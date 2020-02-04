import { select, boolean, number } from "@storybook/addon-knobs";
import { useMemo } from "react";
import { createMockSender } from "@rpldy/sender";

const mockDestination = () => ({ url: "dummy.com" });

const localDestination = (long) => ({
	url: `http://localhost:${process.env.LOCAL_PORT}/upload${long ? "?long=true" : ""}`,
	params: { test: true }
});

const cldDestination = () => ({
	url: `https://api.cloudinary.com/v1_1/${process.env.CLD_CLOUD}/upload`,
	params: {
		upload_preset: process.env.CLD_PRESET,
		folder: process.env.CLD_TEST_FOLDER,
	}
});

const DEST_OPTIONS = {
	"mock": 0,
	"cloudinary": 1,
	"local": 2,
};

const DESTINATIONS = {
	[DEST_OPTIONS.mock]: mockDestination,
	[DEST_OPTIONS.cloudinary]: cldDestination,
	[DEST_OPTIONS.local]: localDestination,
};

const mockSenderEnhancer = (uploader) => {
	const mockSender = createMockSender({ delay: 1000 });
	uploader.update({ send: mockSender.send });
	return uploader;
};

const getDestination = (type, longRequest) => {
	return DESTINATIONS[type](longRequest);
};

const useStoryUploadySetup = (options = {}) => {
	const type = select("destination", DEST_OPTIONS, DEST_OPTIONS.mock);
	const longRequest = boolean("long local request (relevant for local only)", false);
	const multiple = boolean("multiple files", true);
	const grouped = !options.noGroup && boolean("group files in single request", false);
	const groupSize = !options.noGroup && number("max in group", 2);

	return useMemo(() => ({
			multiple,
			destination: getDestination(type, longRequest), //DESTINATIONS[type],
			enhancer: (type === DEST_OPTIONS.mock) ? mockSenderEnhancer : null,
			grouped,
			groupSize,
			longRequest,
		}),
		[type, multiple, grouped, groupSize, longRequest]);
};

export default useStoryUploadySetup;