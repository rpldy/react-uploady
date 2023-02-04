const examineCroppedUploadReq = (req, name) =>
    req.interceptFormData((formData) => {
        expect(formData["file"]).to.eq(name);
    })
        .its("request.headers")
        .its("content-length")
        .then((length) => {
            expect(parseInt(length)).to.be.lessThan(5000);
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
    examineCroppedUploadReq,
    examineFullUploadRequest,
}
