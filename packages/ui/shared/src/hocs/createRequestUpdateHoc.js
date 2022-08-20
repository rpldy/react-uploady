// @flow
import React, { useLayoutEffect, useState } from "react";
import useUploadyContext from "../hooks/useUploadyContext";

import type { Node } from "React";
import type { BatchItem } from "@rpldy/shared";
import type { UploaderCreateOptions } from "@rpldy/uploader";

export type RequestUpdater = ({ items: BatchItem, options: UploaderCreateOptions }) => void;
type EventDataValidator = (...params: any[]) => boolean;
type RequestDataRetriever<T> = (...params: any[]) => T;
export type RequestUpdateHoc =  (Component: React$ComponentType<any>) => React$ComponentType<any>;

type Props = {
    id: string,
};

type RequestUpdateHocOptions<T> = {
    eventType: string,
    getIsValidEventData: EventDataValidator,
    getRequestData: RequestDataRetriever<T>,
};

const createRequestUpdateHoc = <T>({
        eventType,
        getIsValidEventData,
        getRequestData,
    }: RequestUpdateHocOptions<T>
): RequestUpdateHoc =>
    (Component: React$ComponentType<any>): ((props: Props) => Node) =>
        (props: Props) => {
            const context = useUploadyContext();
            const [updater, setUpdater] = useState({
                updateRequest: null,
                requestData: null,
            });
            const { id } = props;

            //need layout effect to register to event in time (block)
            useLayoutEffect(() => {
                const handleEvent = (...params) =>
                    getIsValidEventData(id, ...params) === true ?
                    //returning a promise to event dispatcher so it will await until its resolved by user-land code
                    new Promise((resolve) => {
                        setUpdater({
                            updateRequest: (data) => {
                                //unregister handler so this instance doesnt continue listening unnecessarily
                                context.off(eventType, handleEvent);
                                resolve(data);
                            },
                            requestData: getRequestData(...params),
                        });
                    }) :
                    //returning false for invalid data will cancel the request so must return undefined!
                    undefined;

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
