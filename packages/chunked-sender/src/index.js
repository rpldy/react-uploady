// @flow
import getChunkedEnhancer from "./getChunkedEnhancer";
import { CHUNKING_SUPPORT } from "./utils";

export default getChunkedEnhancer;

export {
    getChunkedEnhancer,
    CHUNKING_SUPPORT,
};

export type {
    ChunkedOptions,
    MandatoryChunkedOptions,
} from "./types";
