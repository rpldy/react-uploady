// @flow
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { getFilesFromDragEvent } from "html-dir-content";
import { useUploadyContext, markAsUploadOptionsComponent } from "@rpldy/shared-ui";

import type { UploadOptions } from "@rpldy/shared";
import type { UploadDropZoneProps } from "./types";

const UploadDropZone: React$AbstractComponent<UploadDropZoneProps, ?HTMLDivElement> = forwardRef<UploadDropZoneProps, ?HTMLDivElement>(
    ({
         className,
         id,
         children,
         onDragOverClassName,
         dropHandler,
         htmlDirContentParams,
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
            return dropHandler ?
                Promise.resolve(dropHandler(e)) :
                getFilesFromDragEvent(e, htmlDirContentParams || {});
        }, [dropHandler, htmlDirContentParams]);

        const handleDropUpload = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            dropFileHandler(e)
                .then((files) => {
                    upload(files, uploadOptionsRef.current);
                });
        }, [upload, dropFileHandler, uploadOptionsRef]);

        const onDragEnter = useCallback((e) => {
            dragLeaveTrackerRef.current =
                (!dragLeaveTrackerRef.current && e.target === containerRef.current);

            if (containerRef.current && onDragOverClassName) {
                containerRef.current.classList.add(onDragOverClassName);
            }
        }, [onDragOverClassName, containerRef]);

        const onDragOver = useCallback((e) => {
            //must have drag over event handler with preventDefault for drop to work
            e.preventDefault();
        }, []);

        const onDrop = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.persist();

            handleEnd();
            handleDropUpload(e);
        }, [handleEnd, handleDropUpload]);

        const onDragLeave = useCallback((e) => {
            if (dragLeaveTrackerRef.current &&
                e.target === containerRef.current) {
                handleEnd();
            }
        }, [handleEnd, containerRef]);

        const onDragEnd = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEnd();
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
