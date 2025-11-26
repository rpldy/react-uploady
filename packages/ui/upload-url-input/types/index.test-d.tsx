import * as React from "react";
import UploadUrlInput  from "./index";

const TestWithRef: React.FC = () => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const onInputChange = React.useCallback(() => {
        console.log("INPUT = ", inputRef.current?.value);
    }, []);

    React.useEffect(() => {
        const input = inputRef.current;
        if (input) {
            input.addEventListener("input", onInputChange);
        }

        return () => {
            if (input) {
                input.removeEventListener("input", onInputChange);
            }
        };
    });

    return <UploadUrlInput placeholder="URL to upload" ref={inputRef}/>;
};

const testUploadUrlInput = (): React.JSX.Element => {
    return <TestWithRef/>;
};

export {
    testUploadUrlInput,
};
