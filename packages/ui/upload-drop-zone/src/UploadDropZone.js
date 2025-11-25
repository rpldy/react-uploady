// @flow
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useLayoutEffect } from "react";
import { getFilesFromDragEvent } from "html-dir-content";
import { isEmpty, isFunction } from "@rpldy/shared";
import { useUploadyContext, markAsUploadOptionsComponent } from "@rpldy/shared-ui";

import type { UploadOptions } from "@rpldy/shared";
import type { UploadDropZoneProps, ShouldHandleDrag } from "./types";

const getShouldHandleDrag = (e: SyntheticDragEvent<HTMLDivElement>, shouldHandle: ?ShouldHandleDrag) => isEmpty(shouldHandle) ||
    shouldHandle === true ||
    (isFunction(shouldHandle) && shouldHandle(e));

const isOnTarget = (e: SyntheticDragEvent<HTMLDivElement>, containerElm: ?Element, allowContains: boolean) => {
    const target = e.type === "dragleave" ? e.relatedTarget : e.target;
    return target === containerElm ||
        // $FlowIssue[incompatible-call] flow needs to figure it out :(
        (allowContains && containerElm?.contains(target));
};

const UploadDropZone: React.ComponentType<UploadDropZoneProps> = forwardRef(
    ({
         className,
         id,
         children,
         onDragOverClassName,
         dropHandler,
         htmlDirContentParams,
         shouldRemoveDragOver,
         shouldHandleDrag,
         enableOnContains = true,
         noContainCheckForDrag = false,
         extraProps,
         ...uploadOptions
     }: UploadDropZoneProps, ref: React.RefSetter<?HTMLDivElement>) => {
        const { upload } = useUploadyContext();
        const containerRef = useRef<?HTMLDivElement>(null);
        const dragLeaveTrackerRef = useRef(false);

        useImperativeHandle<?HTMLDivElement>(ref, () => containerRef.current, []);

        //using ref so upload can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        useLayoutEffect(() => {
            uploadOptionsRef.current = uploadOptions;
        }, [uploadOptions]);

        const handleEnd = useCallback(() => {
            dragLeaveTrackerRef.current = false;

            if (containerRef.current && onDragOverClassName) {
                containerRef.current.classList.remove(onDragOverClassName);
            }
        }, [onDragOverClassName, containerRef]);

        const dropFileHandler = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            const getFiles = () => getFilesFromDragEvent(e, htmlDirContentParams || {});

            return dropHandler ?
                Promise.resolve(dropHandler(e, getFiles)) :
                getFiles();
        }, [dropHandler, htmlDirContentParams]);

        const handleDropUpload = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            dropFileHandler(e)
                .then((files) => {
                    upload(files, uploadOptionsRef.current);
                });
        }, [upload, dropFileHandler, uploadOptionsRef]);

        const onDragEnter = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            const isHandling = getShouldHandleDrag(e, shouldHandleDrag) &&
                isOnTarget(e, containerRef.current, enableOnContains) || noContainCheckForDrag;

            if (isHandling) {
                dragLeaveTrackerRef.current = true;

                if (containerRef.current && onDragOverClassName) {
                    containerRef.current.classList.add(onDragOverClassName);
                }
            }
        }, [onDragOverClassName, containerRef, shouldHandleDrag, enableOnContains, noContainCheckForDrag]);

        const onDragOver = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            if (dragLeaveTrackerRef.current) {
                //must have drag over event handler with preventDefault for drop to work
                e.preventDefault();
            }
        }, []);

        const onDrop = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            if (dragLeaveTrackerRef.current) {
                e.preventDefault();
                e.persist();

                handleEnd();
                handleDropUpload(e);
            }
        }, [handleEnd, handleDropUpload]);

        const onDragLeave = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            if ((dragLeaveTrackerRef.current &&
                !isOnTarget(e, containerRef.current, enableOnContains)) || shouldRemoveDragOver?.(e)) {
                handleEnd();
            }
        }, [handleEnd, containerRef, shouldRemoveDragOver, enableOnContains]);

        const onDragEnd = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            if (dragLeaveTrackerRef.current) {
                e.preventDefault();
                e.stopPropagation();
                handleEnd();
            }
        }, [handleEnd]);

        return <div
            id={id}
            className={className}
            ref={containerRef}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
            onDragEnd={onDragEnd}
            {...extraProps}
        >
            {children}
        </div>;
    });

markAsUploadOptionsComponent(UploadDropZone);

export default UploadDropZone;
