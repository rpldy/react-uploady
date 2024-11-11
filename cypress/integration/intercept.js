import { DEFAULT_METHOD, UPLOAD_URL } from "../constants";

export const RESPONSE_DEFAULTS = {
    statusCode: 200,
    body: { success: true },
};

const createResponse = (options = {}) => ({
    ...RESPONSE_DEFAULTS,
    ...options,
});

export const interceptWithHandler = (handler, alias = "uploadReq", url = UPLOAD_URL, method = DEFAULT_METHOD) =>
    intercept(url, method, handler, alias);

export const interceptWithDelay = (delay = 100, alias = "uploadReq", url = UPLOAD_URL, method = DEFAULT_METHOD, resOptions = {}) =>
    interceptWithHandler((req) => {
        req.reply({
            ...RESPONSE_DEFAULTS,
            ...resOptions,
            delay,
        });
    }, alias, url, method);

const intercept = (url = UPLOAD_URL, method = DEFAULT_METHOD, resOptions, alias = "uploadReq") => {
    const handler = (typeof resOptions === "function")  ? resOptions : createResponse(resOptions);

    cy.log(`intercepting url: ${url} with method: ${method}`);

    cy.intercept(method, url, handler)
        .as(alias);
};

export default intercept;
