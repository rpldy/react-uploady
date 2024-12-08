// @flow
import type { BatchItem } from "@rpldy/shared";
import type { State, TusOptions, TusState } from "../../types";

const createStateItemData = (
    item: BatchItem,
    tusState: TusState,
    options: TusOptions,
    parallelIdentifier: ?string,
    orgItemId: ?string
) => {
    tusState.updateState((state: State) => {
        state.items[item.id] = {
            id: item.id,
            uploadUrl: null,
            size: item.file.size,
            offset: 0,

            //will be populated only for items that represent a parallel part:
            parallelIdentifier,
            orgItemId,
        };
    });
};

export default createStateItemData;
