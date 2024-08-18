import * as React from "react";
import ChunkedUploady, { useItemErrorListener, useChunkStartListener, useChunkFinishListener } from "./index";

const ComponentWithChunkItemError = () => {
    useItemErrorListener((item) => {
        console.log(`item ${item.id} failed -  status code:`,
            item.uploadResponse.chunkUploadResponse.status);
        console.log(`item ${item.id} failed -  msg:`,
            item.uploadResponse.chunkUploadResponse.response);
    });

    useChunkStartListener((data) =>  {
        console.log(`chunk ${data.chunk.index} started`);
    });

    useChunkFinishListener((data) =>  {
        console.log(`chunk ${data.chunk.index} finished`);
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

const ComponentWithAsyncChunkHandlers = () => {
    useChunkStartListener(async (data) => {
        console.log(`chunk ${data.chunk.index} started`);
    });

    useChunkFinishListener(async (data) => {
        console.log(`chunk ${data.chunk.index} finished`);
    });

    return null;
};

const MyAsyncApp: React.FC = () => <ChunkedUploady
    debug
    chunked
    chunkSize={123123123}>
    <div>test</div>

    <ComponentWithAsyncChunkHandlers/>
</ChunkedUploady>;

const testMyApp = (): JSX.Element => {
    return <>
        <MyApp/>
        <MyAsyncApp/>
    </>;
};

export {
    testMyApp,
};
