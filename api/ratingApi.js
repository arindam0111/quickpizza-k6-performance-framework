// ===============================
// Rating API Operations
// ===============================

import http from 'k6/http';

export function createRating(baseUrl, authHeaders, ratingPayload) {

    return http.post(
        `${baseUrl}/api/ratings`,
        ratingPayload,
        {
            headers: authHeaders,
            tags: {
                name: 'create_order'
            }
        }
    );
}

export function getRating(baseUrl, authHeaders, ratingId) {

    return http.get(
        `${baseUrl}/api/ratings/${ratingId}`,
        {
            headers: authHeaders,
            tags: {
                name: 'get_order'
            }
        }
    );
}

export function listRatings(baseUrl, authHeaders) {

    return http.get(
        `${baseUrl}/api/ratings`,
        {
            headers: authHeaders,
            tags: {
                name: 'list_orders'
            }
        }
    );
}

export function deleteRating(baseUrl, authHeaders, ratingId) {

    return http.del(
        `${baseUrl}/api/ratings/${ratingId}`,
        null,
        {
            headers: authHeaders,
            tags: {
                name: 'delete_order'
            }
        }
    );
}