// ===============================
// Test Data Configuration
// ===============================

export const ratingData = {
    stars: 5,
    pizza_id: 1
};

export const negativeRatingData = {
    invalidRatingId: 999999,
    invalidToken: 'invalid_token_12345',
    invalidRatingPayload: {
        stars: 999,
        pizza_id: -1
    }
};