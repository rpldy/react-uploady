// @flow

import type { TusOptions } from "../types";

export type ItemInfo = {
    id: string,
    uploadUrl: string,
    size: number,
    offset: number,
    abort?: () => boolean,
};

export type State = {
    options: TusOptions,
    items: { [string]: ItemInfo }
};

export type TusState = {
    getState: () => State,
    updateState: ((State) => void) => State,
};

export type InitData = {|
    uploadUrl?: string,
    offset?: number,
    isNew?: boolean,
    isDone?: boolean,
    canResume?: boolean,
|};

export type InitUploadResult = {
    request: Promise<?InitData>,
    abort: ()=>boolean,
};
