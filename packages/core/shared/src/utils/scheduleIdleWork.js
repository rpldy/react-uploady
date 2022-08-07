// @flow
import hasWindow from "./hasWindow";

const supportsIdle = (hasWindow() && window.requestIdleCallback);
const scheduler =  supportsIdle ? window.requestIdleCallback : setTimeout;
const clear = supportsIdle ? window.cancelIdleCallback : clearTimeout;

const scheduleIdleWork = (fn: Function, timeout: number = 0) => {
    const handler = scheduler(fn, supportsIdle ? { timeout } : timeout);

    return () => clear(handler);
};

export default scheduleIdleWork;
