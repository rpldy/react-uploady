import { useRef, useCallback } from "react";

export default () => {
    const updateFn = useRef();
    //need this because we cant update state related to uploads outside Uploady
    const setUpdater = useCallback((fn) => {
        updateFn.current = fn;
    }, []);

    return {
        setUpdater,
        logEvent: (...args) => updateFn.current(...args),
    };
};
