// @flow
import createTusSender from "./tusSender";
import { TUS_EXT } from "./consts";

import type { UploaderType } from "@rpldy/uploader";
import type { TriggerMethod } from "@rpldy/life-events";
import type { TusOptions } from "./types";

export default (options?: TusOptions) => {
	//return uploader enhancer
	return (uploader: UploaderType, trigger: TriggerMethod): UploaderType => {
		const sender = createTusSender(uploader, options, trigger);
		uploader.update({ send: sender.send });

		uploader.registerExtension(TUS_EXT, {
			getOptions: sender.getOptions,
		});

		return uploader;
	};
};
