// @flow
import {  useCallback } from "react";
import useUploadyContext from "./useUploadyContext";

const useAbortBatch: () => (id: string) => void = () => {
    const context = useUploadyContext();

    return useCallback(
        (id: string) => context.abortBatch(id),
        [context]
    );
};

export default useAbortBatch;
