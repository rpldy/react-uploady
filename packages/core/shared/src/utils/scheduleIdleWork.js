// @flow
import hasWindow from "./hasWindow";

const supportsIdle = !!(hasWindow() && window.requestIdleCallback);

type ClearSchedule = () => void;

const scheduleIdleWork = (fn: Function, timeout: number = 0): ClearSchedule => {
    const handler = supportsIdle ?
        window.requestIdleCallback(fn, { timeout }) :
        setTimeout(fn, timeout);

    return () => {
        if (supportsIdle) {
            window.cancelIdleCallback(handler);
        } else {
            clearTimeout(handler);
        }
    };
};

export default scheduleIdleWork;
