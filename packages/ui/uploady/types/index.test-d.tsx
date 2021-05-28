import * as React from "react";
import Uploady, { useFileInput } from "./index";

const MyComponent: React.FC = () => {
    const inputRef = useFileInput();
    if (inputRef.current) {
        inputRef.current.setAttribute("webkitdirectory", "true");
    }
    return <div>test</div>;
};

const MyApp: React.FC = () => <Uploady debug>
    <div>test</div>
</Uploady>;

const testMyApp = (): JSX.Element => {
    return <MyApp/>;
};

const testUseFileInput = (): JSX.Element => <Uploady debug>
    <MyComponent />
</Uploady>;

export {
    testMyApp,
    testUseFileInput
};
