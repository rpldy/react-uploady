import * as React from "react";
import UploadDropZone from "./index";

const TestDropZone: React.FC = () => {
    // const [draggedFiles, setDraggedFiles] = React.useState<FileList | null | undefined>(null);

    const onDrop = React.useCallback((e: DragEvent) => e.dataTransfer?.files || [], []);
    const overlayRef = React.useRef<HTMLSpanElement | null>(null);

    const checkRemoveDragOver = React.useCallback(
        ({ target } : DragEvent) => target === overlayRef.current, []);

    return <UploadDropZone
        autoUpload
        destination={{ url: "test.com" }}
        onDragOverClassName="drag-over"
        dropHandler={onDrop}
        shouldRemoveDragOver={checkRemoveDragOver}
    >
        <span ref={overlayRef}>upload</span>
    </UploadDropZone>;
};

const testDropZone = (): JSX.Element => {
    return <TestDropZone/>;
};


export {
    testDropZone,
};
