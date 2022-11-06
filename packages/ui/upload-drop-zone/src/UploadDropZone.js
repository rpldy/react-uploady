// @flow
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { getFilesFromDragEvent } from "html-dir-content";
import { isEmpty, isFunction } from "@rpldy/shared";
import { useUploadyContext, markAsUploadOptionsComponent } from "@rpldy/shared-ui";

import type { UploadOptions } from "@rpldy/shared";
import type { UploadDropZoneProps } from "./types";

const getShouldHandleDrag = (e, shouldHandle) => isEmpty(shouldHandle) ||
    shouldHandle === true ||
    (isFunction(shouldHandle) && shouldHandle(e));

const isOnTarget = (e, containerElm, allowContains) => {
    return e.target === containerElm || (allowContains && containerElm?.contains(e.target));
};

const UploadDropZone: React$AbstractComponent<UploadDropZoneProps, ?HTMLDivElement> = forwardRef<UploadDropZoneProps, ?HTMLDivElement>(
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
         extraProps,
         ...uploadOptions
     }, ref) => {
        const { upload } = useUploadyContext();
        const containerRef = useRef(null);
        const dragLeaveTrackerRef = useRef(false);

        useImperativeHandle<?HTMLDivElement>(ref, () => containerRef.current, []);

        //using ref so upload can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        uploadOptionsRef.current = uploadOptions;

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

        const onDragEnter = useCallback((e) => {
            const isHandling = getShouldHandleDrag(e, shouldHandleDrag) &&
                isOnTarget(e, containerRef.current, enableOnContains);

            if (isHandling) {
                dragLeaveTrackerRef.current = true;

                if (containerRef.current && onDragOverClassName) {
                    containerRef.current.classList.add(onDragOverClassName);
                }
            }
        }, [onDragOverClassName, containerRef, shouldHandleDrag, enableOnContains]);

        const onDragOver = useCallback((e) => {
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

        const onDragLeave = useCallback((e) => {
            if ((dragLeaveTrackerRef.current &&
                e.target === containerRef.current) || shouldRemoveDragOver?.(e)) {
                handleEnd();
            }
        }, [handleEnd, containerRef, shouldRemoveDragOver]);

        const onDragEnd = useCallback((e) => {
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
