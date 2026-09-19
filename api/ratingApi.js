// ===============================
// Rating API Operations
// ===============================

import http from 'k6/http';
import { getAuthHeaders } from '../utils/request.js';

export function createRating(baseUrl, authToken, ratingPayload) {
    return http.post(
        `${baseUrl}/api/ratings`,
        ratingPayload,
        {
            headers: getAuthHeaders(authToken),
            tags: {
                name: 'create_order'
            }
        }
    );
    }
    
    export function getRating(baseUrl, authToken, ratingId) {

    return http.get(
        `${baseUrl}/api/ratings/${ratingId}`,
        {
            headers: getAuthHeaders(authToken),
            tags: {
                name: 'get_order'
            }
        }
    );
}

export function listRatings(baseUrl, authToken) {

    return http.get(
        `${baseUrl}/api/ratings`,
        {
            headers: getAuthHeaders(authToken),
            tags: {
                name: 'list_orders'
            }
        }
    );
}

export function deleteRating(baseUrl, authToken, ratingId) {

    return http.del(
        `${baseUrl}/api/ratings/${ratingId}`,
        null,
        {
            headers: getAuthHeaders(authToken),
            tags: {
                name: 'delete_order'
            }
        }
    );
}