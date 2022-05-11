import * as React from "react";
import withPasteUpload, { PasteUploadData, usePasteUpload } from "./index";

const MyDiv = () => {
    return <div>Paste to Upload</div>;
};

const DivWithPasteToUpload = withPasteUpload(MyDiv);

const TestWithPasteUpload: React.FC = () => {
    return <DivWithPasteToUpload autoUpload={false} id="my-paste-div"/>;
};

const TestPasteUpload: React.FC = () => {
    const containerRef = React.useRef(null);

    const onPasteUpload = React.useCallback(({ count } : PasteUploadData) => {
        console.log("ELEMENT PASTE-TO-UPLOAD files: ", count);
    }, []);

    const { toggle, getIsEnabled } = usePasteUpload({ autoUpload: false }, containerRef, onPasteUpload);

    return <>
        <div ref={containerRef}>
            Click here & Paste a file
        </div>
        enabled: {getIsEnabled()}
        <button onClick={toggle}>Toggle Paste</button>
    </>;
};

export {
    TestWithPasteUpload,
    TestPasteUpload,
};
