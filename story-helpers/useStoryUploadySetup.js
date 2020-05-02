import { select, boolean, number, text, object } from "@storybook/addon-knobs";
import { useMemo } from "react";
import { composeEnhancers } from "@rpldy/uploady";
import { createMockSender } from "@rpldy/sender";
import { actionLogEnhancer } from "./uploadyStoryLogger";

export const isProd = process.env.NODE_ENV === "production";

export const KNOB_GROUPS = {
    DESTINATION: "Upload Destination",
    SETTINGS: "Upload Settings",
};

console.log(`** React Uploady - storybook helper running in ${isProd ? "production" : "development"} mode. **`);

const PROD_DEST_OPTIONS = {
    "mock": "mock",
    "cloudinary": "cloudinary",
    "url": "url",
};

const DEV_DEST_OPTIONS = {
    ...PROD_DEST_OPTIONS,
    "local": "local",
};

const mockSenderEnhancer = (uploader) => {
    const mockSender = createMockSender({ delay: 1000 });
    uploader.update({ send: mockSender.send });
    return uploader;
};

export const mockDestination = () => ({
    destinationType: DEV_DEST_OPTIONS.mock,
    destination: { url: "http://react-uploady-dummy-server.comm" },
    enhancer: mockSenderEnhancer
});

export const localDestination = () => {
    let result;

    if (!isProd) {
        const long = boolean("long local request (relevant for local only)", false, KNOB_GROUPS.DESTINATION);

        result = {
            destinationType: DEV_DEST_OPTIONS.local,
            destination: {
                url: `http://localhost:${process.env.LOCAL_PORT}/upload${long ? "?long=true" : ""}`,
                params: { test: true }
            }
        }
    }

    //no local when running online
    return result || mockDestination();
};

const cldDestination = () => {
    const cloudName = text("(cloudinary) cloud name", process.env.CLD_CLOUD || "", KNOB_GROUPS.DESTINATION);
    const uploadPreset = text("(cloudinary) upload preset", process.env.CLD_PRESET || "", KNOB_GROUPS.DESTINATION);
    const folder = text("(cloudinary) folder", process.env.CLD_TEST_FOLDER || "", KNOB_GROUPS.DESTINATION);

    return {
        destinationType: DEV_DEST_OPTIONS.cloudinary,
        destination: {
            url: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
            params: {
                upload_preset: uploadPreset,
                folder: folder
            }
        }
    };
};

const urlDestination = () => {
    const url = text('upload url', "", KNOB_GROUPS.DESTINATION);
    const params = object("params", { foo: "bar" }, KNOB_GROUPS.DESTINATION);

    return {
        destinationType: DEV_DEST_OPTIONS.url,
        destination: {
            url,
            params,
        }
    };
};

const DESTINATIONS = {
    [DEV_DEST_OPTIONS.mock]: mockDestination,
    [DEV_DEST_OPTIONS.cloudinary]: cldDestination,
    [DEV_DEST_OPTIONS.local]: localDestination,
    [DEV_DEST_OPTIONS.url]: urlDestination,
};

export const addActionLogEnhancer = (enhancer) => {
    return enhancer ? composeEnhancers(enhancer, actionLogEnhancer) : actionLogEnhancer;
};

const useStoryUploadySetup = (options = {}) => {
    const type = select("destination", isProd ? PROD_DEST_OPTIONS : DEV_DEST_OPTIONS, DEV_DEST_OPTIONS.mock, KNOB_GROUPS.DESTINATION),
        { destination, enhancer } = DESTINATIONS[type](),
        multiple = boolean("multiple files", true, KNOB_GROUPS.SETTINGS),
        grouped = !options.noGroup && boolean("group files in single request", false, KNOB_GROUPS.SETTINGS),
        groupSize = !options.noGroup && number("max in group", 2, {}, KNOB_GROUPS.SETTINGS);

    return useMemo(() => ({
            multiple,
            destination,
            enhancer: addActionLogEnhancer(enhancer),
            grouped,
            groupSize,
        }),
        [type, multiple, grouped, groupSize, destination, enhancer]);
};

export default useStoryUploadySetup;
