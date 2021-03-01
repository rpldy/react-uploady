// @flow
import { useCallback } from "react";
import useUploadyContext from "./useUploadyContext";

const useAbortItem = (): ((id: string) => any) => {
    const context = useUploadyContext();

    return useCallback(
        (id: string) => context.abort(id),
        [context]
    );
};

export default useAbortItem;
