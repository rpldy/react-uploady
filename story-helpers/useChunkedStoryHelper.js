import { number } from "@storybook/addon-knobs";
import { KNOB_GROUPS } from "./consts";
import useStoryUploadySetup from "./useStoryUploadySetup";

const useChunkedStoryHelper = () => {
    const setup = useStoryUploadySetup({ noGroup: true });
    const chunkSize = number("chunk size (bytes)", 5242880, {}, KNOB_GROUPS.SETTINGS);

    return { ...setup, chunkSize };
};

export default useChunkedStoryHelper;
