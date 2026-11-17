import getRequestBodySize from "../getRequestBodySize";
const CROPPED_MAX_SIZE = 70_000;

const examineCroppedUploadReq = (req, name) =>
    req.interceptFormData((formData) => {
        expect(formData["file"]).to.eq(name);
    })
        .its("request.body")
        .then((body) => {
            expect(getRequestBodySize(body)).to.be.lessThan(CROPPED_MAX_SIZE);
        });

const examineFullUploadRequest = (req, name) =>
    req.interceptFormData((formData) => {
        expect(formData["file"]).to.eq(name);
    })
        .its("request.body")
        .then((body) => {
            expect(getRequestBodySize(body)).to.be.least(37200);
        });

export {
    CROPPED_MAX_SIZE,
    examineCroppedUploadReq,
    examineFullUploadRequest,
};
