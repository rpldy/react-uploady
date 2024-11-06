import { DESTINATION_TYPES } from "../consts";
import { mockDestination, urlDestination, cldDestination, localDestination } from "../uploadDestinations";
import { useExternalUploadOptionsProvider } from "../useExternalUploadOptionsProvider";
import { addActionLogEnhancer } from "../uploadyStoryLogger";

const DESTINATIONS = {
    [DESTINATION_TYPES.mock]: mockDestination,
    [DESTINATION_TYPES.cloudinary]: cldDestination,
    [DESTINATION_TYPES.local]: localDestination,
    [DESTINATION_TYPES.url]: urlDestination,
};

const getDestinationProps = (type, args, options) => {
    return DESTINATIONS[type](args, options);
};

const useStoryUploadySetupFromArgs = (args, options) => {
    console.log("PARSING STORY SETUP FROM ARGS: ", { args, options });
    const uploadType = args.uploadType || DESTINATION_TYPES.mock;
    const { destination, enhancer, destinationType } = getDestinationProps(uploadType, args, options);

    const extOptions = useExternalUploadOptionsProvider();

    return {
        ...args,
        uploadType,
        destination,
        enhancer: addActionLogEnhancer(enhancer),
        destinationType,
        extOptions,
    };
};

export default useStoryUploadySetupFromArgs;
