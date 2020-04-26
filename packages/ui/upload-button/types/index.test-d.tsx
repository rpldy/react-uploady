import * as React from "react";
import UploadButton, { asUploadButton } from "./index";

const TestButton: React.FC = () => <UploadButton autoUpload
                                                 destination={{ url: "test.com" }}>
    <span>upload</span>
</UploadButton>;

const testMyButton = (): JSX.Element => {
    return <TestButton/>;
};

type DivUploadButtonProps = {
    children: JSX.Element;
}

const DivUploadButton: React.FC = asUploadButton(React.forwardRef((props: DivUploadButtonProps) => {
    return <div {...props}
                style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}
                id="div-upload">
        {props.children}
    </div>;
}));

const testAppButton = (): JSX.Element => {
    return <DivUploadButton>
        This is a DIV Button
    </DivUploadButton>;
};

export {
    testMyButton,
    testAppButton,
};
