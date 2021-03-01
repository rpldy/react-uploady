// @flow
import { LE_PACK_SYM } from "./consts";

/**
 * create a pack that will only execute when there are registered event handlers
 *
 * @param creator - a function to return data that will become parameters for the event handler
 * array returned means more than 1 parameter. Any other value will be added to an array as a single param
 */
const createLifePack = (creator: () => any): {|resolve: () => Array<any>|} => {
    const lp = {
        resolve: (): any[] => [].concat(creator()),
    };

    Object.defineProperty(lp, LE_PACK_SYM, {
        value: true,
        configurable: false,
    });

    return lp;
};

export default createLifePack;
