
const getFormDataFromRequest = (body, boundary) => {
    const decoder = new TextDecoder()
    const decoded = decoder.decode(body);
    const parts = decoded.split(boundary);

    return parts.reduce((res, p) => {
        const fileNameMatch = p.match(/name="([\w\[\]]+)"; filename="([\w.]+)"/m);

        if (fileNameMatch) {
            res[fileNameMatch[1]] = fileNameMatch[2];
        } else {
            const fieldName = p.match(/; name="([\w-]+)"/)?.[1];
            if (fieldName) {
                res[fieldName] = p.split(`\r\n`)[3];
            }
        }

        return res;
    }, {});
};

const interceptFormData = (request) => {
    const { body, headers } = request;
    const contentType = headers["content-type"];
    const boundary = contentType.match(/boundary=([\w-]+)/)?.[1];

    return getFormDataFromRequest(body, boundary);
};

export default interceptFormData;

Cypress.Commands
    .add("interceptFormData", { prevSubject: true }, (interception, cb) => {
        cy.wrap(interceptFormData(interception.request))
            .then(cb)
            .then(() => interception);
    });

