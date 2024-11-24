import { DEFAULT_CHUNK_SIZE, DESTINATION_TYPES } from "../consts";
import { isProd } from "../helpers";

export const getDestinationOptions = () => isProd ?
    [
        DESTINATION_TYPES.mock,
        DESTINATION_TYPES.cloudinary,
        DESTINATION_TYPES.url
    ] : [
        DESTINATION_TYPES.mock,
        DESTINATION_TYPES.cloudinary,
        DESTINATION_TYPES.url,
        DESTINATION_TYPES.local,
    ];

console.log("DESTINATION OPTIONS (uploadType: ", getDestinationOptions(), { isProd });

export const getTusDestinationOptions = () => isProd ?
    [
        DESTINATION_TYPES.url,
    ] :
    [
        DESTINATION_TYPES.url,
        DESTINATION_TYPES.local,
    ];

export const getTusStoryArgs = () => {
    return {
        parameters: {
            controls: {
                exclude: ["group", "longLocal"],
            }
        },
        args: {
            uploadType: "url",
            chunkSize: DEFAULT_CHUNK_SIZE,
            parallel: 0,
            forgetOnSuccess: false,
            resumeStorage: true,
            ignoreModifiedDateInStorage: false,
            sendDataOnCreate: false,
            sendWithCustomHeader: false,
        },
        argTypes: {
            uploadType: {
                control: "radio",
                options: getTusDestinationOptions(),
            },
            chunkSize: { control: "number" },
            parallel: { control: "number" },
            forgetOnSuccess: { control: "boolean" },
            resumeStorage: { control: "boolean" },
            ignoreModifiedDateInStorage: { control: "boolean" },
            sendDataOnCreate: { control: "boolean" },
            sendWithCustomHeader: { control: "boolean" },
        }
    };
};

export default {
    args: {
        uploadType: "mock",
        multiple: true,
        grouped: false,
        groupSize: 2,
        autoUpload: true,
        mockSendDelay: 1000,
        uploadUrl: "http",
        uploadParams: {},
        longLocal: false,
        cloud: "",
        preset: "",
        folder: "",
    },
    argTypes: {
        uploadType: {
            control: { type: "radio" },
            options: getDestinationOptions(),
        },
        multiple: { control: "boolean" },
        grouped: { control: "boolean" },
        groupSize: { control: "number" },
        autoUpload: { control: "boolean" },

        //only show when uploadType === "mock"
        mockSendDelay: { control: "number", if: { arg: "uploadType", eq: "mock" } },

        //only show when uploadType === "url"
        uploadUrl: { control: "text",  if: { arg: "uploadType", eq: "url" } },
        uploadParams: { control: "object", if: { arg: "uploadType", eq: "url" } },

        //only show when uploadType === "local"
        longLocal: { control: "boolean", description: "longer upload time",  if: { arg: "uploadType", eq: "local" } },

        //only show when uploadType === "cloudinary"
        cloud: { description: "Cloudinary cloud", if: { arg: "uploadType", eq: "cloudinary" } },
        preset: { description: "Cloudinary public preset", if: { arg: "uploadType", eq: "cloudinary" } },
        folder: { description: "Cloudinary folder", if: { arg: "uploadType", eq: "cloudinary" } },
    }
};
