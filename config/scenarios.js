// ===============================
// Performance Scenario Configuration
// ===============================

import { loadProfile } from './loadProfile.js';

export const scenarios = {
    smoke_test: {
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '1m'
    },

    load_test: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: loadProfile,
        gracefulRampDown: '30s'
    }
};