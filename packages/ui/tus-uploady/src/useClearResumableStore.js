// @flow
import { useContext } from "react";
import { invariant } from "@rpldy/shared";
import { assertContext, UploadyContext } from "@rpldy/shared-ui";
import { clearResumables, TUS_EXT } from "@rpldy/tus-sender";
import { NO_EXT } from "./consts";

export default () => {
	const context = assertContext(useContext(UploadyContext));
	const ext = context.getExtension(TUS_EXT);
	invariant(ext, NO_EXT);
	return () => clearResumables(ext.getOptions());
};