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

        const clickHandler: React.MouseEventHandler<HTMLDivElement> = React.useCallback((e) => {
            console.log(e.target);
        }, []);

        return <div
            ref={ref}
            style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}
            className={props.className}
            id={props.id}
            onClick={clickHandler}
        >
            {props.children}
        </div>;
    }));

const TestDivButton: React.FC = () => {
    const divRef = React.useRef<HTMLDivElement>();

    return <DivUploadButton ref={divRef} autoUpload={false} extraProps={{ foo: "bar" }}>
        This is a DIV Button
    </DivUploadButton>;
};

const DivUploadButtonWithoutRef: React.ComponentType<UploadButtonProps<HTMLDivElement>> =
    asUploadButton<DivUploadButtonExtraProps, HTMLDivElement>((props: DivUploadButtonExtraProps) => {
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

interface LiUploadButtonExtraProps {
    id: string
}

const LiUploadButton =
    asUploadButton<LiUploadButtonExtraProps, HTMLLIElement>((props: LiUploadButtonExtraProps) => {
        return <li data-id={props.id}>
            Upload Files
        </li>;
    });

const TestLiButtonWithoutRef: React.FC = () => {
    return <LiUploadButton autoUpload={false} extraProps={{ id: "i123" }}>
        This is a LI Button without Ref
    </LiUploadButton>;
};

const testAsButton = (): JSX.Element => {
    return <TestDivButton/>;
};

const testAsButtonWithoutRef = (): JSX.Element => {
    return <>
        <TestDivButtonWithoutRef/>
        <TestLiButtonWithoutRef/>
        </>;
};

export {
    testMyButton,
    testAsButton,
    testAsButtonWithoutRef,
};
