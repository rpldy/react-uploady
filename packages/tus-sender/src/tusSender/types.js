// @flow

import type { TusOptions } from "../types";

export type State = {
    Options: TusOptions,
};

export type TusState = {
    getState: () => State,
    updateState: ((State) => void),
};
