// @flow
import { useCallback } from "react";
import useUploadyContext from "./useUploadyContext";

export default () => {
	const context = useUploadyContext();

	return useCallback(
		() => context.abort(),
		[context]
	);
};
