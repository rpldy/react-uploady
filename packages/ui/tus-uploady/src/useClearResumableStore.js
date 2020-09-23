// @flow
import { invariant } from "@rpldy/shared";
import { useUploadyContext } from "@rpldy/shared-ui";
import { clearResumables, TUS_EXT } from "@rpldy/tus-sender";
import { NO_EXT } from "./consts";

export default () => {
	const context = useUploadyContext();
	const ext = context.getExtension(TUS_EXT);
	invariant(ext, NO_EXT);
	return () => clearResumables(ext.getOptions());
};
