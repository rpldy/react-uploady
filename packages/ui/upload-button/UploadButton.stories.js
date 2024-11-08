// @flow
import React, {
	Component,
	useMemo,
	useState,
	useRef,
	useCallback,
	forwardRef,
} from "react";
import styled from "styled-components";
import Uploady, {
    UPLOADER_EVENTS,
    useFileInput,
    UploadyContext,
    useItemStartListener,
    useItemFinishListener,
    useBatchStartListener,
    useBatchFinishListener,
    useBatchAddListener,
    useUploady,
} from "@rpldy/uploady";
import {
    createUploadyStory,
    StoryUploadProgress,
    uploadButtonCss,
    mockDestination,
    useEventsLogUpdater,
    getCsfExport,
    type CsfExport,
    type UploadyStory,
} from "../../../story-helpers";
import UploadButton, { asUploadButton } from "./src";

import Readme from "./UploadButton.storydoc.mdx";

import type { Node } from "react";
import type { Batch, BatchItem, UploadyContextType } from "@rpldy/uploady";

export const Simple: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
                fileInputId={"rpldyInput"}
            >
                <UploadButton/>
            </Uploady>
        );
    });

const StyledUploadButton = styled(UploadButton)`
  ${uploadButtonCss}
`;

export const WithStyledComponent: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <StyledUploadButton/>
            </Uploady>
        );
    });

const EventsLog = ({ setUpdater }: { setUpdater: (fn: any) => void }) => {
    const [events, setEvents] = useState<string[]>([]);

    const addEvent = useCallback((event: string) => {
        setEvents((events) => events.concat(event));
    }, [setEvents]);

    setUpdater(addEvent);

    return <ul data-test="hooks-events">
        {events.map((e) => <li key={e}>{e}</li>)}
    </ul>
};

export const WithEventListeners: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        const { setUpdater, logEvent } = useEventsLogUpdater();

        const listeners = useMemo(
            () => ({
                [UPLOADER_EVENTS.BATCH_START]: (batch: Batch) => {
                    logEvent(
                        `Batch Start - ${batch.id} - item count = ${batch.items.length}`,
                    );
                },
                [UPLOADER_EVENTS.BATCH_FINISH]: (batch: Batch) => {
                    logEvent(
                        `Batch Finish - ${batch.id} - item count = ${batch.items.length}`,
                    );
                },
                [UPLOADER_EVENTS.ITEM_START]: (item: BatchItem) => {
                    logEvent(`Item Start - ${item.id} : ${item.file.name}`);
                },
                [UPLOADER_EVENTS.ITEM_FINISH]: (item: BatchItem) => {
                    logEvent(`Item Finish - ${item.id} : ${item.file.name}`);
                },
            }),
            [],
        );

        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                listeners={listeners}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <UploadButton/>
                <EventsLog setUpdater={setUpdater}/>
            </Uploady>
        );
    });

//to be able to use uploady hooks, we need a components that's rendered inside <Uploady>
const HookedUploadButton = () => {
    const { setUpdater, logEvent } = useEventsLogUpdater();

    useBatchStartListener((batch) => {
        logEvent(`hooks: Batch Start - ${batch.id} - item count = ${batch.items.length}`);
    });

    useBatchFinishListener((batch) => {
        logEvent(`hooks: Batch Finish - ${batch.id} - item count = ${batch.items.length}`);
    });

    useItemStartListener((item) => {
        logEvent(`hooks: Item Start - ${item.id} : ${item.file.name}`);
    });

    useItemFinishListener((item) => {
        logEvent(`hooks: Item Finish - ${item.id} : ${item.file.name}`);
    });

    return (
        <>
            <UploadButton/>
            <EventsLog setUpdater={setUpdater}/>
        </>
    );
};

export const withEventHooks: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
            >
                <HookedUploadButton/>
            </Uploady>
        );
    });

export const WithProgress: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
            >
                <UploadButton/>
                <StoryUploadProgress batchProgress itemProgress/>
            </Uploady>
        );
    });

class ClassUsingCustomButton extends Component<any> {

    unsubscribeBatchStart: ?() => void = null;

    componentDidMount() {
        this.unsubscribeBatchStart = this.context.on(UPLOADER_EVENTS.BATCH_START, (batch) => {
            console.log(`>>>>> ClassUsingCustomButton - BATCH START - ${batch.id}`);
        });
    }

    componentWillUnmount() {
        if (this.unsubscribeBatchStart) {
            this.unsubscribeBatchStart();
        }
    }

    static contextType: React$Context<?UploadyContextType> = UploadyContext;

    showFileChooser = () => {
        this.context.showFileUpload();
    };

    render(): Node {
        return <button onClick={this.showFileChooser}>Custom Upload Button</button>;
    }
}

export const WithClass: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
            >
                <ClassUsingCustomButton/>
            </Uploady>
        );
    });

const DisabledDuringUploadButton = () => {
    const [uploading, setUploading] = useState<boolean>(false);

    useBatchStartListener(() => {
        setUploading(true);
    });

    useBatchFinishListener(() => {
        setUploading(false);
    });

    return <StyledUploadButton extraProps={{ disabled: uploading }}/>;
};

export const DisabledDuringUpload: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <DisabledDuringUploadButton/>
            </Uploady>
        );
    });

export const DifferentConfiguration: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple }): Node => {
        const destinationOverride = useMemo(
            () => ({
                headers: { ...destination.headers, "x-test": "1234" },
            }),
            [],
        );

        return (
            <div>
                <p>
                    Buttons can use different configuration overrides.
                    <br/>
                    However, Some options cannot be overriden by the button.
                    <br/>
                    For example, any prop that influence the file input directly (such as
                    multiple)
                </p>
                <Uploady
                    debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                >
                    <UploadButton autoUpload={false} id="upload-a">
                        autoUpload = false
                    </UploadButton>
                    <br/>
                    <UploadButton destination={destinationOverride} id="upload-b">
                        add 'x-test' header
                    </UploadButton>
                </Uploady>
            </div>
        );
    });

const DivUploadButton = asUploadButton(forwardRef((props, ref) => {
    return <div {...props} ref={ref}
                style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}
                id="div-upload">
        This is a DIV
    </div>
}));

export const WithComponentAsButton: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <DivUploadButton/>
            </Uploady>
        );
    });

const ExampleForm = ({ url }: { url: string }) => {
    const inputRef = useRef<?HTMLInputElement>();
    useFileInput(inputRef);

    return <form action={url} method="POST">
        <input type="file" name="testFile" style={{ display: "none" }} ref={inputRef}/>
    </form>;
};

export const WithCustomFileInputAndForm = (): Node => {
    return <section>
        <Uploady
            debug
            customInput
        >
            <ExampleForm url={mockDestination().destination.url}/>
            <UploadButton/>
        </Uploady>
    </section>
};

const ExampleFormWithCustomButton = ({ url }: { url: string }) => {

    console.log("RENDERING CUSTOM FORM !!!!!! ", { url })

    const { showFileUpload } = useUploady();
    const [selectDir, setSelectDir] = useState<boolean>(false);
    const inputRef = useRef<?HTMLInputElement>();
    useFileInput(inputRef);

    const onSelectChange = useCallback((e: SyntheticInputEvent<HTMLSelectElement>) => {
        setSelectDir(e.target.value === "dir");
    }, []);

    const onClick = useCallback(() => {
        showFileUpload();
    }, []);

    return <>
        <form action={url} method="POST">
            <input
                type="file"
                name="testFile"
                style={{ display: "none" }}
                ref={inputRef}
                webkitdirectory={selectDir ? "true" : undefined}
            />
        </form>
        <select id="select-input-type" onChange={onSelectChange}>
            <option value="file">File</option>
            <option value="dir">Directory</option>
        </select>
        <button onClick={onClick}>Upload</button>
    </>;
};

export const WithCustomFileInputAndCustomButton: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        return (
            <section>
                <Uploady
                    debug
                    customInput
                    multiple={multiple}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                >
                    <ExampleFormWithCustomButton url={destination.url}/>
                </Uploady>
            </section>
        );
    });

export const WithFileFilter: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {

        const filterBySize = useCallback((file: mixed) => {
            //filter out files larger than 5MB
            return !(file instanceof File) || file.size < 5242880;
        }, []);

        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
                fileFilter={filterBySize}
            >
                <UploadButton id="upload-button"/>
            </Uploady>
        );
    });

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UploadField = styled.div`
  width: 260px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #fff;
  background-color: #f1f1f1;
  color: #000;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 0 4px;
  cursor: pointer;
`;

const MyUploadField = asUploadButton(
    forwardRef(({ onChange, ...props }, ref) => {
        const [text, setText] = useState("Select file");

        useBatchAddListener((batch) => {
            setText(batch.items[0].file.name);
            onChange(batch.items[0].file.name);
        });

        useBatchFinishListener(() => {
            setText("Select file");
            onChange(null);
        });

        return (
            <UploadField {...props} ref={ref} id="form-upload-button">
                {text}
            </UploadField>
        );
    })
);

const MyForm = () => {
    const [fields, setFields] = useState({});
    const [fileName, setFileName] = useState(null);
    const { processPending } = useUploady();

    const onSubmit = useCallback(() => {
        processPending({ params: fields });
    }, [fields, processPending]);

    const onFieldChange = useCallback((e: SyntheticInputEvent<HTMLInputElement>) => {
        setFields({
            ...fields,
            [e.currentTarget.id]: e.currentTarget.value,
        })
    }, [fields, setFields]);

    const buttonExtraProps = useMemo(() => ({
        onChange: setFileName
    }), [setFileName]);

    return (
        <Form>
            <MyUploadField autoUpload={false} extraProps={buttonExtraProps}/>
            <br/>
            <input onChange={onFieldChange} id="field-name" type="text" placeholder="your name"/>
            <br/>
            <input onChange={onFieldChange} id="field-age" type="number" placeholder="your age"/>
            <br/>
            <button id="form-submit" type="button" onClick={onSubmit} disabled={!fileName}>Submit Form</button>
        </Form>
    );
};

export const WithForm: UploadyStory = createUploadyStory(
    ({ enhancer, destination,  grouped, groupSize }): Node => {
        return (
            <Uploady
                debug
                clearPendingOnAdd
                multiple={false}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <div className="App">
                    <h3>Using a Form with file input and additional fields</h3>

                    <MyForm/>
                </div>
            </Uploady>
        );
    });

const UploadButtonStories: CsfExport = getCsfExport(UploadButton, "Upload Button", Readme, {
    pkg: "upload-button",
    section: "UI"
});

export default { ...UploadButtonStories, title: "UI/Upload Button" };
