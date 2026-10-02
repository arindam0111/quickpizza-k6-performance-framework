// ===============================
// Performance Scenario Configuration
// ===============================

import { loadProfile } from './loadProfile.js';

export const scenarios = {
    load_test: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: loadProfile,
        gracefulRampDown: '30s'
    }
};