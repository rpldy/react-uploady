import * as React from "react";
import UploadDropZone from "./index";

const TestDropZone: React.FC = () => {

    const onDrop = React.useCallback((e) => e.dataTransfer.files, []);

    return <UploadDropZone autoUpload
                           destination={{ url: "test.com" }}
                           onDragOverClassName="drag-over"
                           dropHandler={onDrop}>
        <span>upload</span>
    </UploadDropZone>;
};

const testDropZone = (): JSX.Element => {
    return <TestDropZone/>;
};


export {
    testDropZone,
};
