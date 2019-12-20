import { select, boolean } from "@storybook/addon-knobs";
import { useMemo } from "react";
import { createMockSender } from "@rpldy/sender";

const mockDestination = { url: "dummy.com" };

const localDestination = {
	url: `http://localhost:${process.env.LOCAL_PORT}/upload`,
	params: { test: true }
};

const cldDestination = {
	url: `https://api.cloudinary.com/v1_1/${process.env.CLD_CLOUD}/upload`,
	params: {
		upload_preset: process.env.CLD_PRESET,
		folder: process.env.CLD_TEST_FOLDER,
	}
};

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

const useStoryUploadySetup = () => {
	const type = select("destination", DEST_OPTIONS, DEST_OPTIONS.mock);
	const multiple = boolean("multiple files", true);

	return useMemo(() => ({
			multiple,
			destination: DESTINATIONS[type],
			enhancer: (type === DEST_OPTIONS.mock) ? mockSenderEnhancer : null,
		}),
		[type, multiple]);
};

export default useStoryUploadySetup;