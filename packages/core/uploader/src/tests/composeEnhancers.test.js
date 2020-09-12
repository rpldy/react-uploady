import composeEnhancers from "../composeEnhancers";

describe("test composeEnhancers", () => {

    it("should enhance by order of input", () => {

        const triggerMock =jest.fn();

        const e1 = (uploader) => {
            uploader.test += "y";
            return uploader;
        };

        const e2 = (uploader, trigger) => {
            trigger();
            uploader.test += "o";
            return uploader;
        };

        const e3 = (uploader) => {
            uploader.test += "a";
            return uploader;
        };

        const e4 = (uploader, trigger) => {
            trigger();
            uploader.test += "v";
            return uploader;
        };

        const orgEnhancer = {test: ""};

        const enhancer = composeEnhancers(e1, e2, e3, e4);

        const enhancedUploader = enhancer(orgEnhancer, triggerMock);

        expect(enhancedUploader.test).toBe("yoav");

        expect(triggerMock).toHaveBeenCalledTimes(2);
    });

    it("should enhance by order of input (enhancers not returning)", () => {

        const e1 = (uploader) => {
            uploader.test += "y";
        };

        const e2 = (uploader) => {
            uploader.test += "o";
        };

        const e3 = (uploader) => {
            uploader.test += "a";
        };

        const e4 = (uploader) => {
            uploader.test += "v";
        };

        const uploader = {test: ""};

        const enhancer = composeEnhancers(e4, e3, e2, e1);

        const enhancedUploader = enhancer(uploader);

        expect(enhancedUploader.test).toBe("vaoy");
    });
});
