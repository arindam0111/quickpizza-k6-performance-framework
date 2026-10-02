// ===============================
// Negative Rating API Test
// ===============================

import http from 'k6/http';
import { BASE_URL, PASSWORD } from '../../config/env.js';
import { registerUser, loginUser } from '../../api/userApi.js';
import { getRating, createRating } from '../../api/ratingApi.js';import { randomString } from '../../utils/helpers.js';
import { negativeThresholds } from '../../config/negativeThresholds.js';
import { check, group } from 'k6';
import { negativeRatingData } from '../../data/testData.js';

export const options = {
    scenarios: {
        negative_test: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '1m'
        }
    },

    thresholds: negativeThresholds
};

export default function () {

    const username = `negative_${randomString(8)}`;

    // Register user
    const registrationResponse = registerUser(
        BASE_URL,
        username,
        PASSWORD
    );

    check(registrationResponse, {
        'Registration successful': (res) => res.status === 201
    });

    // Login
    const loginResponse = loginUser(
        BASE_URL,
        username,
        PASSWORD
    );

    check(loginResponse, {
        'Login successful': (res) => res.status === 200
    });

    const authToken = loginResponse.json('token');

    // Request invalid rating ID
    group('Invalid Rating ID', function () {

        const invalidRatingId = negativeRatingData.invalidRatingId;
    
        const response = getRating(
            BASE_URL,
            authToken,
            invalidRatingId
        );
    
        check(response, {
            'Invalid rating returns 404': (res) => res.status === 404
        });
    });
     // Request with invalid authentication token
    group('Invalid Authentication', function () {
    
        const invalidToken = negativeRatingData.invalidToken;

        const authResponse = getRating(
            BASE_URL,
            invalidToken,
            1
        );
    
        check(authResponse, {
            'Invalid token returns 401': (res) => res.status === 401
        });
    });

    group('Invalid Rating Data', function () {
        const invalidRatingPayload = JSON.stringify(
    negativeRatingData.invalidRatingPayload
);
    
        const response = createRating(
            BASE_URL,
            authToken,
            invalidRatingPayload
        );
    
        check(response, {
            'Invalid rating data returns 400': (res) => res.status === 400
        });
    });
}