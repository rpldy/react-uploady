import { Trigger, UploaderEnhancer } from "@rpldy/shared";
import { createUploader, UploaderType, composeEnhancers } from "./index";

const testCreateUploader = (): void => {

    const uploader = createUploader({
        autoUpload: false,
        destination: {
            url: "test.com",
            method: "POST"
        }
    });

    console.log(uploader.getOptions());
};

const testComposeEnhancers = (): void => {

    const enhancer1 = (uploader: UploaderType) => {
        uploader.update({maxGroupSize: 4});
        return uploader;
    };

    const enhancer2 = (uploader: UploaderType, trigger: Trigger<void>) => {
        trigger("test");

        uploader.registerExtension("ext1", {
            doSomething: () => {
                console.log("test");
            }
        });

        return uploader;
    };

    const composed: UploaderEnhancer = composeEnhancers(enhancer1, enhancer2);
};

export {
    testCreateUploader,
    testComposeEnhancers
};
