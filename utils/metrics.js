// ===============================
// Custom k6 Metrics
// ===============================

import { Counter, Trend, Rate } from 'k6/metrics';

export const transactionTime = new Trend('transaction_time');
export const successfulOrders = new Counter('successful_orders');
export const loginSuccessRate = new Rate('login_success_rate');