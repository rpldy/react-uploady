import uploadFile from "../uploadFile";

describe("Uploader - Custom UI", () => {
    before(() => {
        cy.visitStory("uploader", "with-custom-ui&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url", true);
    });

    it("should upload and trigger events", () => {

    });
});
