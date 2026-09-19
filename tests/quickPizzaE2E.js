import http from 'k6/http';
import { check, sleep, group } from 'k6';
import {
    transactionTime,
    successfulOrders,
    loginSuccessRate
} from '../utils/metrics.js';
import { BASE_URL, PASSWORD } from '../config/env.js';
import { randomString } from '../utils/helpers.js';

// ===============================
// Test Options
// ===============================

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '2m', target: 15 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 }
    ],

    thresholds: {
        // Global HTTP performance
        'http_req_duration': ['p(95)<2000'],
        'http_req_failed': ['rate<0.05'],

        // Functional checks
        'checks': ['rate>0.95'],
        'iteration_duration': ['p(95)<30000'],

        // Endpoint performance
        'http_req_duration{name:register}': ['p(95)<2000'],
        'http_req_duration{name:login}': ['p(95)<2000'],
        'http_req_duration{name:create_order}': ['p(95)<2000'],
        'http_req_duration{name:get_order}': ['p(95)<2000'],
        'http_req_duration{name:list_orders}': ['p(95)<2000'],
        'http_req_duration{name:verify_order}': ['p(95)<2000'],
        'http_req_duration{name:delete_order}': ['p(95)<2000'],

        // Group performance
        'group_duration{group:::User Registration}': ['p(95)<5000'],
        'group_duration{group:::Authentication}': ['p(95)<5000'],
        'group_duration{group:::Order Management}': ['p(95)<10000'],
        'group_duration{group:::Order Verification}': ['p(95)<5000'],
        'group_duration{group:::Cleanup}': ['p(95)<5000'],

        // Group checks
        'checks{group:::User Registration}': ['rate>0.95'],
        'checks{group:::Authentication}': ['rate>0.95'],
        'checks{group:::Order Management}': ['rate>0.95'],
        'checks{group:::Order Verification}': ['rate>0.95'],
        'checks{group:::Cleanup}': ['rate>0.95'],

        // Custom business metrics
        'transaction_time': ['p(95)<25000'],
        'successful_orders': ['count>20'],
        'login_success_rate': ['rate>0.98']
    }
};

// ===============================
// Setup
// ===============================

export function setup() {
    const testStartTime = new Date().toISOString();

    console.log('==========================================');
    console.log('QuickPizza API Performance Test');
    console.log('==========================================');
    console.log(`Test Start Time : ${testStartTime}`);
    console.log(`Base URL        : ${BASE_URL}`);
    console.log('==========================================');

    return {
        testStartTime: testStartTime,
        baseUrl: BASE_URL
    };
}

// ===============================
// Main Test
// ===============================

export default function (data) {

    const baseUrl = data.baseUrl;

    const username =
        `performance_${__VU}_${__ITER}_${randomString(6)}`;

    const transactionStart = Date.now();

    // ==========================================
    // 1. User Registration
    // ==========================================

    let registrationResponse;

    group('User Registration', function () {

        const registrationPayload = JSON.stringify({
            username: username,
            password: PASSWORD
        });

        registrationResponse = http.post(
            `${baseUrl}/api/users`,
            registrationPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                tags: {
                    name: 'register'
                }
            }
        );

        check(registrationResponse, {
            'registration status is 201': (r) =>
                r.status === 201,
        
            'registration response received': (r) =>
                r.body !== undefined && r.body !== ''
        });
    });

    if (registrationResponse.status !== 201) {
        console.error(
            `Registration failed - Status: ${registrationResponse.status}, ` +
            `Body: ${registrationResponse.body}`
        );
    
        return;
    }

    // ==========================================
    // 2. Authentication
    // ==========================================

    let loginResponse;
    let authToken = null;

    group('Authentication', function () {

        const loginPayload = JSON.stringify({
            username: username,
            password: PASSWORD
        });

        loginResponse = http.post(
            `${baseUrl}/api/users/token/login`,
            loginPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                tags: {
                    name: 'login'
                }
            }
        );

        const loginSuccessful =
            loginResponse.status === 200;

        loginSuccessRate.add(loginSuccessful);

        check(loginResponse, {
            'login status is 200': (r) =>
                r.status === 200,

            'login response contains token': (r) => {
                if (r.status !== 200 || !r.body) {
                    return false;
                }

                try {
                    return r.json('token') !== undefined;
                } catch (e) {
                    return false;
                }
            }
        });

        if (loginSuccessful) {
            try {
                authToken = loginResponse.json('token');
            } catch (e) {
                authToken = null;
            }
        }
    });

    if (loginResponse.status !== 200 || !authToken) {
        console.error(
            `Authentication failed for user: ${username}`
        );

        return;
    }

    // ==========================================
    // Authentication Headers
    // ==========================================

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    // ==========================================
    // 3. Order Management
    // ==========================================

    let createOrderResponse;
    let orderId = null;

    group('Order Management', function () {

        // --------------------------------------
        // Create Order / Rating
        // --------------------------------------

        const orderPayload = JSON.stringify({
            stars: 5,
            pizza_id: 1
        });

        createOrderResponse = http.post(
            `${baseUrl}/api/ratings`,
            orderPayload,
            {
                headers: authHeaders,
                tags: {
                    name: 'create_order'
                }
            }
        );
        
        if (createOrderResponse.status !== 201) {
            console.error(
                `Order creation failed - Status: ${createOrderResponse.status}, ` +
                `Body: ${createOrderResponse.body}`
            );
            return;
        }
        
        try {
            orderId = createOrderResponse.json('id');
        } catch (e) {
            orderId = null;
        }
        
        check(createOrderResponse, {
            'create order status is 201': (r) =>
                r.status === 201,
        
            'order ID is generated': () =>
                orderId !== undefined && orderId !== null
        });

        if (!orderId) {
            return;
        }

        sleep(1);

        // --------------------------------------
        // Get Order / Rating
        // --------------------------------------

        const getOrderResponse = http.get(
            `${baseUrl}/api/ratings/${orderId}`,
            {
                headers: authHeaders,
                tags: {
                    name: 'get_order'
                }
            }
        );

        check(getOrderResponse, {
            'get order status is 200': (r) =>
                r.status === 200,

            'order ID matches created order': (r) => {
                if (r.status !== 200 || !r.body) {
                    return false;
                }

                try {
                    return String(r.json('id')) === String(orderId);
                } catch (e) {
                    return false;
                }
            }
        });

        sleep(1);

        // --------------------------------------
        // List Orders / Ratings
        // --------------------------------------

        const listOrdersResponse = http.get(
            `${baseUrl}/api/ratings`,
            {
                headers: authHeaders,
                tags: {
                    name: 'list_orders'
                }
            }
        );

        check(listOrdersResponse, {
            'list orders status is 200': (r) =>
                r.status === 200,

            'list orders response received': (r) =>
                r.body !== undefined && r.body !== ''
        });
    });

    if (!orderId) {
        console.error(
            `Order creation failed for user: ${username}`
        );

        return;
    }

    // ==========================================
    // 4. Order Verification
    // ==========================================

    let verificationResponse;

    group('Order Verification', function () {

        verificationResponse = http.get(
            `${baseUrl}/api/ratings/${orderId}`,
            {
                headers: authHeaders,
                tags: {
                    name: 'verify_order'
                }
            }
        );

        check(verificationResponse, {
            'order still exists': (r) =>
                r.status === 200,

            'order data integrity': (r) => {
                if (r.status !== 200 || !r.body) {
                    return false;
                }

                try {
                    return String(r.json('id')) === String(orderId);
                } catch (e) {
                    return false;
                }
            }
        });
    });

    // ==========================================
    // 5. Cleanup
    // ==========================================

    group('Cleanup', function () {
        const deleteOrderResponse = http.del(
            `${baseUrl}/api/ratings/${orderId}`,
            null,
            {
                headers: authHeaders,
                tags: {
                    name: 'delete_order'
                }
            }
        );
    
    
        check(deleteOrderResponse, {
            'delete order status is 204': (r) =>
                r.status === 204
        });
    });

    // ==========================================
    // Transaction Metrics
    // ==========================================

    const transactionDuration =
        Date.now() - transactionStart;

    transactionTime.add(transactionDuration);

    successfulOrders.add(1);
}

// ===============================
// Teardown
// ===============================

export function teardown(data) {

    const testEndTime = new Date().toISOString();

    console.log('==========================================');
    console.log('QuickPizza API Performance Test Completed');
    console.log('==========================================');
    console.log(`Test Start Time : ${data.testStartTime}`);
    console.log(`Test End Time   : ${testEndTime}`);
    console.log('==========================================');
}