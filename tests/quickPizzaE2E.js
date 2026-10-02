import http from 'k6/http';
import { check, sleep, group } from 'k6';
import {
    transactionTime,
    successfulOrders,
    loginSuccessRate
} from '../utils/metrics.js';
import { BASE_URL, PASSWORD } from '../config/env.js';
import { randomString } from '../utils/helpers.js';
import {
    registerUser,
    loginUser
} from '../api/userApi.js';
import {
    createRating,
    getRating,
    listRatings,
    deleteRating
} from '../api/ratingApi.js';
import { getAuthHeaders } from '../utils/request.js';
import { scenarios } from '../config/scenarios.js';
import { thresholds } from '../config/thresholds.js';


// ===============================
// Test Options
// ===============================

const selectedScenario = __ENV.TEST_SCENARIO || 'load_test';

if (
    selectedScenario !== 'smoke_test' &&
    selectedScenario !== 'load_test'
) {
    throw new Error(
        `Invalid TEST_SCENARIO: "${selectedScenario}". ` +
        `Allowed values: smoke_test, load_test`
    );
}

let selectedScenarios = {
    load_test: scenarios.load_test
};

if (selectedScenario === 'smoke_test') {
    selectedScenarios = {
        smoke_test: scenarios.smoke_test
    };
}

export const options = {
    scenarios: selectedScenarios,

    thresholds: thresholds
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

        registrationResponse = registerUser(
            baseUrl,
            username,
            PASSWORD
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

        loginResponse = loginUser(
            baseUrl,
            username,
            PASSWORD
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

        createOrderResponse = createRating(
            baseUrl,
            authToken,
            orderPayload
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

        const getOrderResponse = getRating(
            baseUrl,
            authToken,
            orderId
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
        
        const listOrdersResponse = listRatings(
            baseUrl,
            authToken
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
                headers: getAuthHeaders(authToken),
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
        const deleteOrderResponse = deleteRating(
            baseUrl,
            authToken,
            orderId
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