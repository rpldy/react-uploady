// @flow

import type { TusOptions } from "../types";

export type ItemInfo = {
    id: string,
    uploadUrl: string,
    size: number,
    offset: number,
};

export type State = {
    options: TusOptions,
    items: { [string]: ItemInfo }
};

export type TusState = {
    getState: () => State,
    updateState: ((State) => void),
};
