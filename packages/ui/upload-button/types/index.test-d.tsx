import * as React from "react";
import UploadButton, { asUploadButton, UploadButtonProps } from "./index";

const TestButton: React.FC = () => {
    const btnRef = React.useRef<HTMLButtonElement>();

    return <UploadButton autoUpload
                         destination={{ url: "test.com" }}
                         ref={btnRef}>
        <span>upload</span>
    </UploadButton>;
};

const testMyButton = (): JSX.Element => {
    return <TestButton/>;
};

const DivUploadButton: React.ComponentType<React.PropsWithRef<UploadButtonProps>> =
    asUploadButton<UploadButtonProps>(React.forwardRef((props: UploadButtonProps, ref: React.Ref<HTMLDivElement>) => {
        return <div {...props}
                    ref={ref}
                    style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}
                    id="div-upload">
            {props.children}
        </div>;
    }));

const TestDivButton: React.FC = () => {
    const divRef = React.useRef<HTMLDivElement>();

    return <DivUploadButton ref={divRef}>
        This is a DIV Button
    </DivUploadButton>;
};

const testAsButton = (): JSX.Element => {
    return <TestDivButton/>;
};

export {
    testMyButton,
    testAsButton,
};
