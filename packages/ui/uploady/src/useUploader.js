// @flow
import { useEffect, useMemo } from "react";
import { pick } from "lodash";
import { logger } from "@rpldy/shared";
import createUploader, { DEFAULT_OPTIONS } from "@rpldy/uploader";

import type { UploaderType } from "@rpldy/uploader";
import type { CreateOptions } from "@rpldy/shared";
import type { UploadyProps } from "./types";

const getUploaderOptions = (props: UploadyProps): CreateOptions =>
    pick(props, Object.keys(DEFAULT_OPTIONS));

export default (props: UploadyProps) => {

    const uploaderOptions = useMemo(
        () => getUploaderOptions(props),
        //using JSON.stringify because there's no other way to handle props refs - https://github.com/facebook/react/issues/14476#issuecomment-471199055
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify({ ...props, children: null })]
    );

    //avoid creating new instance of uploader unless we have to (enhancer changed or uploader instance passed)
    const uploader = useMemo<UploaderType>(
        () => {
            if (!props.uploader) {
                logger.debugLog("Uploady creating a new uploader instance", {
                    uploaderOptions,
                    enhancer: props.enhancer
                });
            }

            return props.uploader || createUploader(uploaderOptions, props.enhancer);
        },
        //dont recreate the uploader when uploaderOptions changed - we do update later
        //eslint-disable-next-line react-hooks/exhaustive-deps
        [props.enhancer, props.uploader]
    );

    useMemo(() => {
        logger.debugLog("Uploady updating uploader options", uploaderOptions);
        uploader.update(uploaderOptions);
    }, [uploader, uploaderOptions]);

    useEffect(() => {
        if (props.listeners) {
            const listeners = props.listeners;
            logger.debugLog("Uploady setting event listeners", listeners);

            Object.entries(listeners)
                .forEach(([name, m]: [string, any]) => {
                    uploader.on(name, m);
                });
        }

        return () => {
            if (props.listeners) {
                Object.entries(props.listeners)
                    .forEach(([name, m]: [string, any]) =>
                        uploader.off(name, m));
            }
        };
    }, [props.listeners, uploader]);

    return uploader;
};
