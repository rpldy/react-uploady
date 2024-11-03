import { DESTINATION_TYPES } from "../consts";
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

export const getTusDestinationOptions = () => isProd ?
    [
        DESTINATION_TYPES.url,
    ] :
    [
        DESTINATION_TYPES.url,
        DESTINATION_TYPES.local,
    ];

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
