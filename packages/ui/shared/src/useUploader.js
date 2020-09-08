// @flow
import { useEffect, useMemo } from "react";
import { logger } from "@rpldy/shared";
import createUploader from "@rpldy/uploader";

import type { UploaderType, CreateOptions } from "@rpldy/uploader";
import type { UploaderListeners } from "./types";

export default (options: CreateOptions, listeners: ?UploaderListeners): UploaderType => {
    //avoid creating new instance of uploader (unless enhancer method changed)
    const uploader = useMemo<UploaderType>(
        () => {
            logger.debugLog("Uploady creating a new uploader instance", options);
            return createUploader(options);
        },
        //dont recreate the uploader when options changed - we do update later
        //eslint-disable-next-line react-hooks/exhaustive-deps
        [options.enhancer]
    );

    //Forgoing any kind of memoization. Probably not worth the comparison work to save on the options merge
    uploader.update(options);

    useEffect(() => {
        if (listeners) {
            logger.debugLog("Uploady setting event listeners", listeners);
            Object.entries(listeners)
                .forEach(([name, m]: [string, any]) => {
                    uploader.on(name, m);
                });
        }

        return () => {
            if (listeners) {
                logger.debugLog("Uploady removing event listeners", listeners);
                Object.entries(listeners)
                    .forEach(([name, m]: [string, any]) =>
                        uploader.off(name, m));
            }
        };
    }, [listeners, uploader]);

    return uploader;
};
