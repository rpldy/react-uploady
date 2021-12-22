// @flow
import { useCallback } from "react";
import useUploadyContext from "./useUploadyContext";

const useAbortAll: () => () => void = () => {
    const context = useUploadyContext();

    return useCallback(
        () => context.abort(),
        [context]
    );
};

export default useAbortAll;
