const thresholds = [
    {
        metric: 'http_req_duration',
        operator: 'p95<',
        threshold: 2000,
        summaryPath: ['performance', 'httpRequestDuration', 'p95'],
        unit: 'ms'
    },
    {
        metric: 'http_req_failed',
        operator: 'rate<',
        threshold: 0.05,
        summaryPath: ['reliability', 'httpRequestFailed', 'rate'],
        unit: 'rate'
    },
    {
        metric: 'checks',
        operator: 'rate>',
        threshold: 0.95,
        summaryPath: ['reliability', 'checks', 'rate'],
        unit: 'rate'
    },
    {
        metric: 'transaction_time',
        operator: 'p95<',
        threshold: 25000,
        summaryPath: ['performance', 'transactionTime', 'p95'],
        unit: 'ms'
    },
    {
        metric: 'login_success_rate',
        operator: 'rate>',
        threshold: 0.98,
        summaryPath: ['reliability', 'loginSuccessRate', 'rate'],
        unit: 'rate'
    },
    {
        metric: 'successful_orders',
        operator: 'count>',
        threshold: 20,
        summaryPath: ['business', 'successfulOrders'],
        unit: 'count'
    }
];

module.exports = thresholds;