import * as React from "react";
import Uploady from "./index";

const MyApp: React.FC = () => <Uploady debug>
    <div>test</div>
</Uploady>;

const testMyApp = (): JSX.Element => {
    return <MyApp/>;
};

export {
    testMyApp,
};
