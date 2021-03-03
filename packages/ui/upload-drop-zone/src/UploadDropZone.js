// @flow
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { getFilesFromDragEvent } from "html-dir-content";
import { useUploadyContext, markAsUploadOptionsComponent } from "@rpldy/shared-ui";

import type { UploadOptions } from "@rpldy/shared";
import type { UploadDropZoneProps } from "./types";

const UploadDropZone: React$AbstractComponent<UploadDropZoneProps, ?HTMLDivElement> = forwardRef<UploadDropZoneProps, ?HTMLDivElement>(
    (props, ref) => {
        const containerRef = useRef(null);

        useImperativeHandle<?HTMLDivElement>(ref, () => containerRef.current, []);

        const { upload } = useUploadyContext();

        const {
            className, id, children, onDragOverClassName, dropHandler,
            htmlDirContentParams,
			extraProps,
            ...uploadOptions
        } = props;

        //using ref so upload can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        uploadOptionsRef.current = uploadOptions;

        const handleEnd = useCallback(() => {
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

        const onDragOver = useCallback((e) => {
            e.preventDefault();

            if (containerRef.current && onDragOverClassName) {
                containerRef.current.classList.add(onDragOverClassName);
            }
        }, [onDragOverClassName, containerRef]);

        const onDrop = useCallback((e: SyntheticDragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.persist();
            handleEnd();
            handleDropUpload(e);
        }, [handleEnd, handleDropUpload]);

        const onDragLeave = useCallback(() => {
            handleEnd();
        }, [handleEnd]);

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
