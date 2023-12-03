const CROPPED_MAX_SIZE = 70_000;

const examineCroppedUploadReq = (req, name) =>
    req.interceptFormData((formData) => {
        expect(formData["file"]).to.eq(name);
    })
        .its("request.headers")
        .its("content-length")
        .then((length) => {
            expect(parseInt(length)).to.be.lessThan(CROPPED_MAX_SIZE);
        });

const examineFullUploadRequest = (req, name) =>
    req.interceptFormData((formData) => {
        expect(formData["file"]).to.eq(name);
    })
        .its("request.headers")
        .its("content-length")
        .then((length) => {
            expect(parseInt(length)).to.be.least(37200);
        });

export {
    CROPPED_MAX_SIZE,
    examineCroppedUploadReq,
    examineFullUploadRequest,
}
