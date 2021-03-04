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

interface DivUploadButtonExtraProps {
    className?: string;
    id?: string;
    children?: JSX.Element[] | JSX.Element | string;
    text?: string;
    foo: string;
}

const DivUploadButton: React.ComponentType<React.PropsWithRef<UploadButtonProps>> =
    asUploadButton<DivUploadButtonExtraProps>(React.forwardRef((props: DivUploadButtonExtraProps, ref: React.Ref<HTMLDivElement>) => {
        return <div ref={ref}
                    style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}
                    className={props.className}
                    id={props.id}>
            {props.children}
        </div>;
    }));

const TestDivButton: React.FC = () => {
    const divRef = React.useRef<HTMLDivElement>();

    return <DivUploadButton ref={divRef} autoUpload={false} extraProps={{ foo: "bar" }}>
        This is a DIV Button
    </DivUploadButton>;
};

const DivUploadButtonWithoutRef: React.ComponentType<UploadButtonProps> =
    asUploadButton<DivUploadButtonExtraProps>((props: DivUploadButtonExtraProps) => {
        return <div
            style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}
            className={props.className}
            id={props.id}>
            {props.children}
        </div>;
    });

const TestDivButtonWithoutRef: React.FC = () => {
    return <DivUploadButtonWithoutRef autoUpload={false} extraProps={{ foo: "bar" }}>
        This is a DIV Button without Ref
    </DivUploadButtonWithoutRef>;
};

const testAsButton = (): JSX.Element => {
    return <TestDivButton/>;
};

const testAsButtonWithoutRef = (): JSX.Element => {
    return <TestDivButtonWithoutRef/>;
};

export {
    testMyButton,
    testAsButton,
    testAsButtonWithoutRef,
};
