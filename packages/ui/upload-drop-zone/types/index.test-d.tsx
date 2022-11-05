import * as React from "react";
import UploadDropZone, { GetFilesMethod } from "./index";

const TestDropZone: React.FC = () => {
    // const [draggedFiles, setDraggedFiles] = React.useState<FileList | null | undefined>(null);

    const onDrop = React.useCallback((e: DragEvent) => e.dataTransfer?.files || [], []);
    const overlayRef = React.useRef<HTMLSpanElement | null>(null);

    const checkRemoveDragOver = React.useCallback(
        ({ target } : DragEvent) => target === overlayRef.current, []);

    const checkShouldHandleDrag = React.useCallback(() => true, []);

    return <UploadDropZone
        autoUpload
        destination={{ url: "test.com" }}
        onDragOverClassName="drag-over"
        dropHandler={onDrop}
        shouldHandleDrag={checkShouldHandleDrag}
        shouldRemoveDragOver={checkRemoveDragOver}
    >
        <span ref={overlayRef}>upload</span>
    </UploadDropZone>;
};

const TestDropZoneWithGetFiles: React.FC = () => {
    const onDrop = React.useCallback(async (e: DragEvent, getFiles: GetFilesMethod) => {
        const files = await getFiles();
        return files.filter((f) => f.type.startsWith("image/"));
    }, []);

    return <UploadDropZone
        autoUpload
        destination={{ url: "test.com" }}
        onDragOverClassName="drag-over"
        dropHandler={onDrop}
    >
        <span>upload</span>
    </UploadDropZone>;
};

const testDropZone = (): JSX.Element => {
    return <>
        <TestDropZone/>
        <TestDropZoneWithGetFiles/>
    </>;
};


export {
    testDropZone,
};
