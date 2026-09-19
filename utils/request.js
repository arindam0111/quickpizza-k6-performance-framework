// ===============================
// API Request Utilities
// ===============================

export function getJsonHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}

export function getAuthHeaders(authToken) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}