// ===============================
// Performance Threshold Configuration
// ===============================

export const thresholds = {
    // Global HTTP thresholds
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.95'],
    iteration_duration: ['p(95)<30000'],

    // Endpoint thresholds
    'http_req_duration{name:register}': ['p(95)<2000'],
    'http_req_duration{name:login}': ['p(95)<2000'],
    'http_req_duration{name:create_order}': ['p(95)<2000'],
    'http_req_duration{name:get_order}': ['p(95)<2000'],
    'http_req_duration{name:list_orders}': ['p(95)<2000'],
    'http_req_duration{name:verify_order}': ['p(95)<2000'],
    'http_req_duration{name:delete_order}': ['p(95)<2000'],

    // Group duration thresholds
    'group_duration{group:::User Registration}': ['p(95)<5000'],
    'group_duration{group:::Authentication}': ['p(95)<5000'],
    'group_duration{group:::Order Management}': ['p(95)<10000'],
    'group_duration{group:::Order Verification}': ['p(95)<5000'],
    'group_duration{group:::Cleanup}': ['p(95)<5000'],

    // Group check thresholds
    'checks{group:::User Registration}': ['rate>0.95'],
    'checks{group:::Authentication}': ['rate>0.95'],
    'checks{group:::Order Management}': ['rate>0.95'],
    'checks{group:::Order Verification}': ['rate>0.95'],
    'checks{group:::Cleanup}': ['rate>0.95'],

    // Custom metrics
    transaction_time: ['p(95)<25000'],
    successful_orders: ['count>20'],
    login_success_rate: ['rate>0.98']
};