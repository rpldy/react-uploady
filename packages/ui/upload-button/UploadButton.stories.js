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
    useStoryUploadySetup,
    StoryUploadProgress,
    uploadButtonCss,
    mockDestination,
    useEventsLogUpdater,
    getCsfExport,
    type CsfExport,
} from "../../../story-helpers";
import UploadButton, { asUploadButton } from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

import type { Node, Element } from "React"

export const Simple = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                    fileInputId={"rpldyInput"}>

        <UploadButton/>
    </Uploady>;
};

const StyledUploadButton = styled(UploadButton)`
  ${uploadButtonCss}
`;

export const WithStyledComponent = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <StyledUploadButton/>
    </Uploady>;
};

const EventsLog = ({ setUpdater }) => {
    const [events, setEvents] = useState([]);

    const addEvent = useCallback((event) => {
        setEvents((events) => events.concat(event));
    }, [setEvents]);

    setUpdater(addEvent);

    return <ul data-test="hooks-events">
        {events.map((e) => <li key={e}>{e}</li>)}
    </ul>
};

export const WithEventListeners = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();
    const { setUpdater, logEvent } = useEventsLogUpdater();

    const listeners = useMemo(() => ({
        [UPLOADER_EVENTS.BATCH_START]: (batch) => {
            logEvent(`Batch Start - ${batch.id} - item count = ${batch.items.length}`);
        },
        [UPLOADER_EVENTS.BATCH_FINISH]: (batch) => {
            logEvent(`Batch Finish - ${batch.id} - item count = ${batch.items.length}`);
        },
        [UPLOADER_EVENTS.ITEM_START]: (item) => {
            logEvent(`Item Start - ${item.id} : ${item.file.name}`);
        },
        [UPLOADER_EVENTS.ITEM_FINISH]: (item) => {
            logEvent(`Item Finish - ${item.id} : ${item.file.name}`);
        },
    }), []);

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        listeners={listeners}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <UploadButton/>
        <EventsLog setUpdater={setUpdater}/>
    </Uploady>;
};

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

    return <>
        <UploadButton/>
        <EventsLog setUpdater={setUpdater}/>
    </>;
};

export const withEventHooks = (): Node => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>

        <HookedUploadButton/>
    </Uploady>;
};

export const WithProgress = (): Node => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>
        <UploadButton/>
        <StoryUploadProgress batchProgress itemProgress/>
    </Uploady>;
};

class ClassUsingCustomButton extends Component<any> {

    unsubscribeBatchStart = null;

    componentDidMount(): * {
        this.unsubscribeBatchStart = this.context.on(UPLOADER_EVENTS.BATCH_START, (batch) => {
            console.log(`>>>>> ClassUsingCustomButton - BATCH START - ${batch.id}`);
        });
    }

    componentWillUnmount(): * {
        if (this.unsubscribeBatchStart) {
            this.unsubscribeBatchStart();
        }
    }

    static contextType = UploadyContext;

    showFileChooser = () => {
        this.context.showFileUpload();
    };

    render() {
        return (
            <button onClick={this.showFileChooser}>Custom Upload Button</button>
        );
    }
}

export const WithClass = (): Node => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();
    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>
        <ClassUsingCustomButton/>
    </Uploady>;
};

const DisabledDuringUploadButton = () => {
    const [uploading, setUploading] = useState(false);

    useBatchStartListener(() => {
        setUploading(true);
    });

    useBatchFinishListener(() => {
        setUploading(false);
    });

    return <StyledUploadButton extraProps={{ disabled: uploading }}/>;
};

export const DisabledDuringUpload = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <DisabledDuringUploadButton/>
    </Uploady>;
};

export const DifferentConfiguration = (): Element<"div"> => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    const destinationOverride = useMemo(() => ({
        headers: { ...destination.headers, "x-test": "1234" }
    }), []);

    return <div>
        <p>Buttons can use different configuration overrides.<br/>
            However, Some options cannot be overriden by the button.<br/>
            For example, any prop that influence the file input directly (such as multiple)
        </p>
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}>

            <UploadButton autoUpload={false} id="upload-a">
                autoUpload = false
            </UploadButton>
            <br/>
            <UploadButton destination={destinationOverride} id="upload-b">
                add 'x-test' header
            </UploadButton>
        </Uploady>
    </div>
};

const DivUploadButton = asUploadButton(forwardRef((props, ref) => {
    return <div {...props} ref={ref}
                style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}
                id="div-upload">
        This is a DIV
    </div>
}));

export const WithComponentAsButton = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <DivUploadButton/>
    </Uploady>;
};

const ExampleForm = ({ url }) => {
    const inputRef = useRef();
    useFileInput(inputRef);

    return <form action={url} method="POST">
        <input type="file" name="testFile" style={{ display: "none" }} ref={inputRef}/>
    </form>;
};

export const WithCustomFileInputAndForm = (): Element<"section"> => {
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

const ExampleFormWithCustomButton = ({ url }) => {
    const { showFileUpload } = useUploady();
    const [selectDir, setSelectDir] = useState(false);
    const inputRef = useRef();
    useFileInput(inputRef);

    const onSelectChange = useCallback((e) => {
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

export const WithCustomFileInputAndCustomButton = (): Element<"section"> => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <section>
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
};

export const WithFileFilter = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const filterBySize = useCallback((file) => {
        //filter out files larger than 5MB
        return !(file instanceof File) || file.size < 5242880;
    }, []);

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                    fileFilter={filterBySize}>

        <UploadButton id="upload-button"/>
    </Uploady>;
};

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

    const onFieldChange = useCallback((e) => {
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

export const WithForm = (): Node => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();

    return (
        <Uploady
            debug
            clearPendingOnAdd
            multiple={false}
            destination={destination}
            enhancer={enhancer}
            grouped={grouped}
            maxGroupSize={groupSize}>
            >
            <div className="App">
                <h3>Using a Form with file input and additional fields</h3>

                <MyForm/>
            </div>
        </Uploady>
    );
};

export default (getCsfExport(UploadButton, "Upload Button", readme, { pkg: "upload-button" }): CsfExport);
