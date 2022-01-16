import { createUploader, UploaderType, composeEnhancers, UploaderEnhancer, FileFilterMethod, Trigger } from "./index";

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

const testAsyncFileFilter = (): UploaderType => {
    const filter: FileFilterMethod = async (file: unknown) => {
        const response = await fetch(`https://bogus.url.test/${(file as File).name}`);
        const json: { result: boolean } | undefined = await response.json();

        return json?.result;
    };

    return createUploader({
        autoUpload: false,
        destination: {
            url: "test.com",
            method: "POST"
        },
        fileFilter: filter,
    });
};

export {
    testCreateUploader,
    testComposeEnhancers,
    testAsyncFileFilter,
};
