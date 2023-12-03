// @flow
import React, { useLayoutEffect, useState } from "react";
import useUploadyContext from "../hooks/useUploadyContext";

export type RequestUpdater<T> = (?T) => void;
type EventDataValidator = (...params: any[]) => boolean;
type RequestDataRetriever<T> = (...params: any[]) => ?T;
export type RequestUpdateHoc =  (Component: React$ComponentType<any>) => React$ComponentType<any>;

type Props = {|
    id: string,
|};

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
    (Component: React$ComponentType<any>): ((props: Props) => React$Element<any>) =>
        (props: Props) => {
            const context = useUploadyContext();
            const [updater, setUpdater] = useState<{| updateRequest: ?RequestUpdater<T>, requestData: ?T |}>({
                updateRequest: null,
                requestData: null,
            });
            const { id } = props;

            //need layout effect to register to event in time (block)
            useLayoutEffect(() => {
                const handleEvent: (...params: mixed[]) => ?mixed  = (...params: mixed[]) =>
                    getIsValidEventData(id, ...params) === true ?
                    //returning a promise to event dispatcher so it will await until its resolved by user-land code
                    new Promise((resolve) => {
                        setUpdater({
                            updateRequest: (data: ?T) => {
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
