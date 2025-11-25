import { getMockSenderEnhancer } from "@rpldy/mock-sender";
import { DESTINATION_TYPES } from "./consts";
import { isProd } from "./helpers";
import { isCypress } from "./uploadyStoryLogger";

const urlDestination = ({ uploadUrl, uploadParams }) => {
    return {
        destinationType: DESTINATION_TYPES.url,
        destination: {
            url: uploadUrl,
            params: uploadParams,
        }
    };
};

const mockDestination = ({ mockSendDelay } = {}) => {
    return {
        destinationType: DESTINATION_TYPES.mock,
        destination: { url: "http://react-uploady-dummy-server.comm" },
        enhancer: getMockSenderEnhancer({ delay: mockSendDelay }),
    };
};

const localDestination = ({ longLocal } = {}, { noLong = false } = {}) => {
    const long = !noLong && longLocal;

    //no local when running online
    const localPort = (typeof process !== 'undefined' && process.env && process.env.LOCAL_PORT) || LOCAL_PORT || 4000;
    return (!isProd || isCypress) ? {
        destinationType: DESTINATION_TYPES.local,
        destination: {
            url: `http://localhost:${localPort}/upload${long ? "?long=true" : ""}`,
            params: { test: true }
        }
    } : mockDestination();
};

const cldDestination = ({ cloud, preset, folder }) => {
    const processEnv = typeof process !== 'undefined' && process.env ? process.env : {};
    return {
        destinationType: DESTINATION_TYPES.cloudinary,
        destination: {
            url: `https://api.cloudinary.com/v1_1/${cloud || processEnv.CLD_CLOUD}/upload`,
            params: {
                upload_preset: preset || processEnv.CLD_PRESET,
                folder: folder || processEnv.CLD_TEST_FOLDER,
            }
        }
    };
};

export {
    localDestination,
    mockDestination,
    cldDestination,
    urlDestination,
};
