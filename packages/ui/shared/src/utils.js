// @flow
import { isProduction } from "@rpldy/shared";
import { UPLOAD_OPTIONS_COMP } from "./consts";

const logWarning = (condition: ?any, msg: string) => {

	if (!isProduction() && !condition) {
		// eslint-disable-next-line no-console
		console.warn(msg);
	}
};

const markAsUploadOptionsComponent = (Component: React$ComponentType<any>): void => {
    Component[UPLOAD_OPTIONS_COMP] = true;
};

const getIsUploadOptionsComponent = (Component: any): boolean =>
    Component[UPLOAD_OPTIONS_COMP] === true ||
    Component.target?.[UPLOAD_OPTIONS_COMP] === true ||
    Component.render?.[UPLOAD_OPTIONS_COMP] === true;

export {
	logWarning,
    markAsUploadOptionsComponent,
    getIsUploadOptionsComponent,
};
