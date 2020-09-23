// @flow
import {  useCallback } from "react";
import useUploadyContext from "./useUploadyContext";

export default () => {
	const context = useUploadyContext();

	return useCallback(
		(id: string) => context.abortBatch(id),
		[context]
	);
};
