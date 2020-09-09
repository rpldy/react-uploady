import * as React from "react";
import Uploady, {
    NoDomUploady,
    useUploadOptions,
    withRequestPreSendUpdate,
    WithRequestPreSendUpdateWrappedProps,
} from "./index";
import { useEffect } from "react";

const MyApp: React.FC = () => <Uploady debug>
    <div>test</div>
</Uploady>;

const testMyApp = (): JSX.Element => {
    return <MyApp/>;
};

interface WithPreReqTestProps extends WithRequestPreSendUpdateWrappedProps{
    name: string
}

const testWithRequestPreSendUpdate = (): JSX.Element => {
    const MyComp: React.FC<WithPreReqTestProps> = (props) => {
        const { updateRequest } = props;

        useEffect(() => {
            if (updateRequest) {
                updateRequest({
                    options: {
                        destination: { url: "different-server.com" }
                    }
                });
            }
        }, [updateRequest]);

        return <span>test {props.id} - {props.name}</span>;
    };

    const TestPreReqComp = withRequestPreSendUpdate(MyComp);

    return <div>
        <TestPreReqComp id="bi1" name="test"/>
    </div>;
};

const ListOfUploadOptions = () => {
    const options = useUploadOptions();

    return <ul>
        {JSON.stringify(options)}
    </ul>;
};

const testNoDomUploady = (): JSX.Element => {

    return <NoDomUploady debug>
        <ListOfUploadOptions/>
    </NoDomUploady>;
};

export {
    testMyApp,
    testWithRequestPreSendUpdate,
    testNoDomUploady,
};
