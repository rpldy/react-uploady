// @flow
import React, { forwardRef, useCallback, useContext, useRef } from "react";
import { getFilesFromDragEvent } from "html-dir-content";
import { assertContext, UploadyContext, useWithForwardRef } from "@rpldy/shared-ui";
import type { UploadOptions } from "@rpldy/shared";
import type { UploadDropZoneProps } from "./types";

const UploadDropZone = forwardRef<UploadDropZoneProps, ?HTMLDivElement>(
    (props, ref) => {
        const { ref: containerRef, setRef } = useWithForwardRef<?HTMLDivElement>(ref);
        const { upload } = assertContext(useContext(UploadyContext));

        const {
            className, id, children, onDragOverClassName, dropHandler,
            htmlDirContentParams,
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
                dropHandler(e) :
                getFilesFromDragEvent(e, htmlDirContentParams || {});
        }, [dropHandler, htmlDirContentParams]);

        const handleDropUpload = useCallback(async (e: SyntheticDragEvent<HTMLDivElement>) => {
            const files = await dropFileHandler(e);
            upload(files, uploadOptionsRef.current);
        }, [upload, dropFileHandler, uploadOptionsRef]);

        const onDragOver = useCallback((e) => {
            e.preventDefault();

            if (containerRef.current && onDragOverClassName) {
                containerRef.current.classList.add(onDragOverClassName);
            }
        }, [onDragOverClassName, containerRef]);

        const onDrop = useCallback(async (e: SyntheticDragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.persist();
            handleEnd();
            await handleDropUpload(e);
        }, [handleEnd, handleDropUpload]);

        const onDragLeave = useCallback(() => {
            handleEnd();
        }, [handleEnd]);

        const onDragEnd = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEnd();
        }, [handleEnd]);

        return <div id={id} className={className} ref={setRef}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onDragLeave={onDragLeave}
                    onDragEnd={onDragEnd}>
            {children}
        </div>;
    });

export default UploadDropZone;
