
const getFormDataFromRequest = (body, boundary) => {
    const decoder = new TextDecoder()
    const decoded = decoder.decode(body);
    const parts = decoded.split(boundary);

    console.log("!!!!!!! ", parts)

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

Cypress.Commands
    .add("interceptFormData", { prevSubject: true }, (interception, cb) => {
        const { body, headers } = interception.request;
        const contentType = headers["content-type"];
        const boundary = contentType.match(/boundary=([\w-]+)/)?.[1];
        const formData = getFormDataFromRequest(body, boundary);

        console.log("!!!!!!! ", headers)

        return cy.wrap(formData)
            .then(cb)
            .then(() => interception);
    });

