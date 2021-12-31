import * as React from "react";
import {
    useBatchAddListener,
    useBatchStartListener,
    useBatchProgressListener,
    useBatchFinishListener,
    useBatchCancelledListener,
    useBatchAbortListener,

    useItemStartListener,
    useItemFinishListener,
    useItemProgressListener,
    useItemCancelListener,
    useItemErrorListener,
    useItemAbortListener,
    useItemFinalizeListener,

    useRequestPreSend,

    useUploadOptions,

    UploadyContext,
    assertContext,
    NoDomUploady,
    withRequestPreSendUpdate,
    withBatchStartUpdate,
    WithRequestPreSendUpdateWrappedProps,
    CreateOptions,
    PreSendResponse,
} from "./index";

const makeApiCall = (options: CreateOptions): Promise<{ important: string }> =>
    new Promise((resolve) => {
        resolve({ important: "info" });
    });

const EventHooksTest: React.FC = () => {

    useBatchAddListener((batch) => {
        console.log(`batch ${batch.id} added`);
        return batch.id !== "b1";
    });

    useBatchStartListener((batch) => {
        console.log(`batch ${batch.id} started`);
        return batch.id !== "b1";
    });

    const batchProgress = useBatchProgressListener((batch) => {
        console.log(`batch ${batch.id} completed: ${batch.completed}`);
    });

    const { completed: batchCompleted } = useBatchProgressListener("b1");

    useBatchFinishListener((batch) => {
        console.log(`batch ${batch.id} finished`);
    });

    useBatchCancelledListener((batch) => {
        console.log(`batch ${batch.id} cancelled`);
    });

    useBatchAbortListener((batch) => {
        console.log(`batch ${batch.id} aborted`);
    });

    useItemStartListener((item) => {
        console.log(`item ${item.id} started`);
        return !item.url;
    });

    useItemFinishListener((item) => {
        console.log(`item ${item.id} finished`);
    });

    const itemProgress = useItemProgressListener((item) => {
        console.log(`item ${item.id} completed: ${item.completed}`);
    });

    const { completed: itemCompleted } = useItemProgressListener("bi3");

    useItemCancelListener((item) => {
        console.log(`item ${item.id} cancelled`);
    });

    useItemCancelListener((item) => {
        console.log(`item ${item.id} cancelled`);
    });

    useItemErrorListener((item) => {
        console.log(`item ${item.id} failed - `, item.uploadResponse);
    });

    useItemAbortListener((item) => {
        console.log(`item ${item.id} was aborted`);
    });

    useItemFinalizeListener((item) => {
        console.log(`item ${item.id} is done`);
    });

    useRequestPreSend(({ options }) => {
        let method = options.method;

        if (options.destination?.url?.startsWith("https://put-server")) {
            method = "PUT";
        }

        return {
            options: { method },
        };
    });

    useRequestPreSend(({ options }) => {
        const method = options.method;

        const res: Promise<boolean | PreSendResponse> = new Promise((resolve) => {
            resolve(method === "GET" ? false : { options: { autoUpload: false } });
        });

        return res;
    });

    useRequestPreSend(async ({ options }) => {
        const apiResult = await makeApiCall(options);

        return {
           options: {
               params: { foo: apiResult.important },
           }
        };
    });

    useRequestPreSend(() => {
        return false;
    });

    useRequestPreSend(async () => {
        await makeApiCall({});
        return false;
    });

    return <div>
        <div>test</div>
        <div>batch progress: {batchProgress.completed}</div>
        <div>item progress: {itemProgress.completed}</div>
        <div>batch progress without callback: {batchCompleted}</div>
        <div>item progress without callback: {itemCompleted}</div>
    </div>;
};

const testEventHooks = (): JSX.Element => {
    return <EventHooksTest/>;
};

const WithUploadyContext: React.FC = () => {
    const uploadyContext = assertContext(React.useContext(UploadyContext));

    const hasUploader = uploadyContext.hasUploader();

    uploadyContext.setOptions({
        autoUpload: false,
    });

    return <div>
        has uploader = {hasUploader}
    </div>;
};

const testUploadyContext = (): JSX.Element => {
    return <WithUploadyContext/>;
};

const TestUseOptions: React.FC = () => {

    const options = useUploadOptions({
        autoUpload: false,
    });

    return <div>
        {options.autoUpload}
    </div>;
};

const testUseUploadOptions = (): JSX.Element => {
    return <TestUseOptions/>;
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

interface WithPreReqTestProps extends WithRequestPreSendUpdateWrappedProps{
    name: string
}

const testWithRequestPreSendUpdate = (): JSX.Element => {
    const MyComp: React.FC<WithPreReqTestProps> = (props) => {
        const { updateRequest } = props;

        React.useEffect(() => {
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

interface WithBatchStartProps extends WithRequestPreSendUpdateWrappedProps {
 name: string
}

const testWithBatchStartUpdate = (): JSX.Element =>  {
    const MyComp: React.FC<WithBatchStartProps> = (props) => {
        const { updateRequest, requestData } = props;

        React.useEffect(() => {
            updateRequest({
                    options: {
                        autoUpload: !requestData.options.autoUpload,
                        destination: { url: "different-server.com" }
                    },
                    items: requestData.items,
                });
        }, [updateRequest, requestData]);

        return <>
            <span>test {props.name} {requestData.batch.id}</span>
            {requestData.items.map(({ id }) => <li key={id}>{id}</li>)}
            </>;
    };

    const TestPreReqComp = withBatchStartUpdate(MyComp);

    return <div>
        <TestPreReqComp name="test" id="b1"/>
    </div>;
};

export {
    testEventHooks,
    testUploadyContext,
    testUseUploadOptions,
    testNoDomUploady,
    testWithRequestPreSendUpdate,
    testWithBatchStartUpdate,
};
