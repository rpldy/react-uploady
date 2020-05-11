// @flow

import type { TusOptions } from "../types";

export type State = {
    options: TusOptions,
};

export type TusState = {
    getState: () => State,
    updateState: ((State) => void),
};
