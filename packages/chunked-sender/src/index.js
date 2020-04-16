// @flow
import chunkedEnhancer from "./chunkedEnhancer";
import { CHUNKING_SUPPORT } from "./utils";

export default chunkedEnhancer;

export {
    chunkedEnhancer,
    CHUNKING_SUPPORT,
};

export type {
    ChunkedOptions,
    MandatoryChunkedOptions,
} from "./types";
