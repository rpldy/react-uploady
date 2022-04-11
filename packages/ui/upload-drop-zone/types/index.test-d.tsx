import * as React from "react";
import UploadDropZone from "./index";

const TestDropZone: React.FC = () => {
    const onDrop = React.useCallback((e) => e.dataTransfer.files, []);
    const overlayRef = React.useRef<HTMLSpanElement | null>(null);

    const checkRemoveDragOver = React.useCallback(
        (target) => target === overlayRef.current, []);

    return <UploadDropZone autoUpload
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
