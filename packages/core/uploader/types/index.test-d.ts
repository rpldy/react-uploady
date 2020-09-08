import { Trigger } from "@rpldy/shared";
import { createUploader, UploaderType, composeEnhancers, UploaderEnhancer } from "./index";

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

const testComposeEnhancers = (): UploaderEnhancer => {

    const enhancer1 = (uploader: UploaderType): UploaderType => {
        uploader.update({ maxGroupSize: 4 });
        return uploader;
    };

    const enhancer2 = (uploader: UploaderType, trigger: Trigger<void>): UploaderType => {
        trigger("test");

        uploader.registerExtension("ext1", {
            doSomething: () => {
                console.log("test");
            }
        });

        return uploader;
    };

    const composed: UploaderEnhancer = composeEnhancers(enhancer1, enhancer2);

    return composed;
};

export {
    testCreateUploader,
    testComposeEnhancers
};
