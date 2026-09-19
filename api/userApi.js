// ===============================
// User API Operations
// ===============================

import http from 'k6/http';
import { getJsonHeaders } from '../utils/request.js';
export function registerUser(baseUrl, username, password) {

    const payload = JSON.stringify({
        username: username,
        password: password
    });

    return http.post(
        `${baseUrl}/api/users`,
        payload,
        {
            headers: getJsonHeaders(),
            tags: {
                name: 'register'
            }
        }
    );
}

export function loginUser(baseUrl, username, password) {

    const payload = JSON.stringify({
        username: username,
        password: password
    });

    return http.post(
        `${baseUrl}/api/users/token/login`,
        payload,
        {
            headers: getJsonHeaders(),
            tags: {
                name: 'login'
            }
        }
    );
}