//Cypress 16 native network (Chrome) no longer exposes content-length on intercepted requests, so measure the body itself
const getRequestBodySize = (body) =>
    typeof body === "string" ? new Blob([body]).size : (body?.byteLength ?? 0);

export default getRequestBodySize;
