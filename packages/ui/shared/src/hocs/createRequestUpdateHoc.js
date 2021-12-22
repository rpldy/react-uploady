// @flow
import React, { useLayoutEffect, useState } from "react";
import useUploadyContext from "../hooks/useUploadyContext";

import type { Node } from "React";
import type { BatchItem } from "@rpldy/shared";
import type { CreateOptions } from "@rpldy/uploader";

type Props = { id: string };
type EventDataValidator = (id: string, ...params: any[]) => boolean;
type RequestDataCreator = (...params: any[]) => { items: BatchItem[], options: CreateOptions };
export type RequestUpdateHoc =  (Component: React$ComponentType<any>) => React$ComponentType<Props>;

const createRequestUpdateHoc = (
    eventType: string,
    getIsValidEventData: EventDataValidator,
    getRequestData: RequestDataCreator,
) : RequestUpdateHoc =>
    (Component: React$ComponentType<any>): ((props: Props) => Node) =>
        (props: Props) => {
            const context = useUploadyContext();
            const { id } = props;

            const [updater, setUpdater] = useState({
                updateRequest: null,
                requestData: null,
            });

            //need layout effect to register to event in time (block)
            useLayoutEffect(() => {
                const handleEvent = (...params) =>
                    getIsValidEventData(id, ...params) &&
                    new Promise((resolve) => {
                        setUpdater(() => ({
                            updateRequest: (data) => {
                                //unregister handler so this instance doesnt continue listening unnecessarily
                                context.off(eventType, handleEvent);
                                resolve(data);
                            },
                            requestData: getRequestData(...params),
                        }));
                    });

                if (id) {
                    context.on(eventType, handleEvent);
                }

                return () => {
                    if (id) {
                        context.off(eventType, handleEvent);
                    }
                };
            }, [context, id]);

            return <Component {...props} {...updater} />;
        };

export {
    createRequestUpdateHoc,
};
