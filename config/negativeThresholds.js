// ===============================
// Negative Test Threshold Configuration
// ===============================

export const negativeThresholds = {
    checks: ['rate>0.95'],

    'http_req_duration{name:register}': ['p(95)<2000'],
    'http_req_duration{name:login}': ['p(95)<2000'],
    'http_req_duration{name:get_order}': ['p(95)<2000'],
    'http_req_duration{name:create_order}': ['p(95)<2000']
};