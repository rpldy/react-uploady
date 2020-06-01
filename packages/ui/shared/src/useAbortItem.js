// @flow
import { useContext, useCallback } from "react";
import assertContext from "./assertContext";
import { UploadyContext } from "./index";

export default () => {
	const context = assertContext(useContext(UploadyContext));

	return useCallback(
		(id: string) => context.abort(id),
		[context]
	);
};