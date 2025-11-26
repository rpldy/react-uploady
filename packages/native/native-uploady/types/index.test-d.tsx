import * as React from "react";
import NativeUploady from "./";
import { useUploadOptions } from "@rpldy/shared-ui";

const ListOfUploadOptions = () => {
    const options = useUploadOptions();

    return <ul>
        {JSON.stringify(options)}
    </ul>;
};

const testNativeUploady = (): React.JSX.Element => {
    return <NativeUploady debug>
        <ListOfUploadOptions/>
    </NativeUploady>;
};

export {
    testNativeUploady,
};
