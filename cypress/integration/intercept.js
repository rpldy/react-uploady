const RESPONSE_DEFAULTS = {
    statusCode: 200,
    body: { success: true },
};

const createResponse = (options = {}) => ({
    ...RESPONSE_DEFAULTS,
    ...options,
});

const intercept = (url = "http://test.upload/url", method = "POST", resOptions, alias = "uploadReq") => {
    cy.intercept(method, url, createResponse(resOptions))
        .as(alias);
};

export default intercept;
