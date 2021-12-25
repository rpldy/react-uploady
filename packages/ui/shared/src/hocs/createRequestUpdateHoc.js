// @flow
import React, { useLayoutEffect, useState } from "react";
import { isFunction } from "@rpldy/shared";
import useUploadyContext from "../hooks/useUploadyContext";

import type { Node } from "React";
import type { BatchItem } from "@rpldy/shared";
import type { CreateOptions } from "@rpldy/uploader";

type RegisterValidator<T> = (T) => boolean;
type EventDataValidator = (id: string, ...params: any[]) => boolean;
type RequestDataCreator = (...params: any[]) => { items: BatchItem[], options: CreateOptions };
type DependenciesRetriever<T> = (T) => any[];
export type RequestUpdateHoc<T> =  (Component: React$ComponentType<any>) => React$ComponentType<T>;

const createRequestUpdateHoc = <T>(
    eventType: string,
    getCanRegister: boolean | RegisterValidator<T>,
    getIsValidEventData: EventDataValidator,
    getRequestData: RequestDataCreator,
    getDeps: ?DependenciesRetriever<T>,
) : RequestUpdateHoc<T> =>
    (Component: React$ComponentType<any>): ((props: T) => Node) =>
        (props: T) => {
            const context = useUploadyContext();

            const [updater, setUpdater] = useState({
                updateRequest: null,
                requestData: null,
            });

            const canRegister = getCanRegister === true ||
                (isFunction(getCanRegister) && getCanRegister(props));

            const deps = getDeps?.(props) || [];

            //need layout effect to register to event in time (block)
            useLayoutEffect(() => {
                const handleEvent = (...params) => {
                    return getIsValidEventData(...deps, ...params) &&
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
                };

                if (canRegister) {
                    context.on(eventType, handleEvent);
                }

                return () => {
                    if (canRegister) {
                        context.off(eventType, handleEvent);
                    }
                };
                //eslint-disable-next-line react-hooks/exhaustive-deps
            }, [context, canRegister, ...deps]);

            return <Component {...props} {...updater} />;
        };

export {
    createRequestUpdateHoc,
};
