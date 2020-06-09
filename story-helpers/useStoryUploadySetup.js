import { select, boolean, number, text, object } from "@storybook/addon-knobs";
import { useMemo } from "react";
import { composeEnhancers } from "@rpldy/uploady";
import { createMockSender } from "@rpldy/sender";
import { DESTINATION_TYPES, KNOB_GROUPS} from "./consts";
import { actionLogEnhancer, isCypress } from "./uploadyStoryLogger";
import { isProd } from "./helpers";

console.log(`** React Uploady - storybook helper running in ${isProd ? "production" : "development"} mode. **`);

const PROD_DEST_OPTIONS = [
    DESTINATION_TYPES.mock,
    DESTINATION_TYPES.cloudinary,
    DESTINATION_TYPES.url
];

const DEV_DEST_OPTIONS = [
    ...PROD_DEST_OPTIONS,
    DESTINATION_TYPES.local,
];

const mockSenderEnhancer = (uploader) => {
    const mockSender = createMockSender({ delay: 1000 });
    uploader.update({ send: mockSender.send });
    return uploader;
};

export const mockDestination = () => ({
    destinationType: DESTINATION_TYPES.mock,
    destination: { url: "http://react-uploady-dummy-server.comm" },
    enhancer: mockSenderEnhancer
});

export const localDestination = ({noLong = false} = {}) => {
	console.log("GETTING LOCAL DESTINATION ", noLong);

    let result;

    if (!isProd || isCypress) {
        const long = !noLong && boolean("long local request (relevant for local only)", false, KNOB_GROUPS.DESTINATION);

        result = {
            destinationType: DESTINATION_TYPES.local,
            destination: {
                url: `http://localhost:${process.env.LOCAL_PORT || LOCAL_PORT || 4000}/upload${long ? "?long=true" : ""}`,
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
        destinationType: DESTINATION_TYPES.cloudinary,
        destination: {
            url: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
            params: {
                upload_preset: uploadPreset,
                folder: folder
            }
        }
    };
};

export const urlDestination = () => {
    const url = text('upload url', "", KNOB_GROUPS.DESTINATION);
    const params = object("params", { foo: "bar" }, KNOB_GROUPS.DESTINATION);

    return {
        destinationType: DESTINATION_TYPES.url,
        destination: {
            url,
            params,
        }
    };
};

const DESTINATIONS = {
    [DESTINATION_TYPES.mock]: mockDestination,
    [DESTINATION_TYPES.cloudinary]: cldDestination,
    [DESTINATION_TYPES.local]: localDestination,
    [DESTINATION_TYPES.url]: urlDestination,
};

export const addActionLogEnhancer = (enhancer) => {
    return enhancer ? composeEnhancers(enhancer, actionLogEnhancer) : actionLogEnhancer;
};

const getDestinationOptions = ({destinations = null}) => {
    const types = destinations && destinations.length ? destinations : (isProd ? PROD_DEST_OPTIONS : DEV_DEST_OPTIONS)

    return types.reduce((res, t) => {
        res[t] = t;
        return res;
    }, {});
};

const useStoryDestination = (type, { noLong }) => {
	return useMemo(() => DESTINATIONS[type]({ noLong }), [type, noLong]);
};

const useStoryUploadySetup = (options = {}) => {
    const type = select("destination", getDestinationOptions(options), DESTINATION_TYPES.mock, KNOB_GROUPS.DESTINATION),
        { destination, enhancer, destinationType } = useStoryDestination(type, options),
        multiple = boolean("multiple files", true, KNOB_GROUPS.SETTINGS),
        grouped = !options.noGroup && boolean("group files in single request", false, KNOB_GROUPS.SETTINGS),
        groupSize = !options.noGroup && number("max in group", 2, {}, KNOB_GROUPS.SETTINGS);

    return useMemo(() => ({
            multiple,
            destination,
            enhancer: addActionLogEnhancer(enhancer),
            grouped,
            groupSize,
            destinationType
        }),
        [type, multiple, grouped, groupSize, destination, enhancer, destinationType]);
};

export default useStoryUploadySetup;
