import * as React from "react";
import ChunkedUploady from "./index";

const MyApp: React.FC = () => <ChunkedUploady
    debug
    chunked
    chunkSize={123123123}>
    <div>test</div>
</ChunkedUploady>;

const testMyApp = (): JSX.Element => {
    return <MyApp/>;
};

export {
    testMyApp,
};
