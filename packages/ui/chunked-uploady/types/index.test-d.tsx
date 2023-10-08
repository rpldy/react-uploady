import * as React from "react";
import ChunkedUploady, { useItemErrorListener } from "./index";

const ComponentWithChunkItemError = () => {
    useItemErrorListener((item) => {
        console.log(`item ${item.id} failed -  status code:`,
            item.uploadResponse.chunkUploadResponse.status);
        console.log(`item ${item.id} failed -  msg:`,
            item.uploadResponse.chunkUploadResponse.response);
    });

    return null;
};

const MyApp: React.FC = () => <ChunkedUploady
    debug
    chunked
    chunkSize={123123123}>
    <div>test</div>

    <ComponentWithChunkItemError/>
</ChunkedUploady>;

const testMyApp = (): JSX.Element => {
    return <MyApp/>;
};

export {
    testMyApp,
};
