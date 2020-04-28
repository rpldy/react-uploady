// @flow
import React, { Component, useMemo, useState, useRef, useCallback, forwardRef } from "react";
import styled from "styled-components";
import { withKnobs } from "@storybook/addon-knobs";
import Uploady, {
    useFileInput,
    UploadyContext,
    useItemStartListener,
    useItemFinishListener,
    useBatchStartListener,
    useBatchFinishListener,
    UPLOADER_EVENTS,
} from "@rpldy/uploady";
import {
    useStoryUploadySetup,
    StoryUploadProgress,
    StoryAbortButton,
    uploadButtonCss,
    mockDestination,
    useEventsLogUpdater,
} from "../../../story-helpers";
import UploadButton, { asUploadButton } from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from './README.md';

export const Simple = () => {
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

export const WithStyledComponent = () => {
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

export const WithEventListeners = () => {
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

export const withEventHooks = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>

        <HookedUploadButton/>
    </Uploady>;
};

export const WithProgress = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>
        <UploadButton/>
        <StoryUploadProgress/>
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

export const WithClass = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();
    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>
        <ClassUsingCustomButton/>
    </Uploady>;
};

export const WithAbort = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <div>
        <p>Enable the "local destination" with "long local request" knobs to be able to try aborting
            a running request</p>
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}>

            <UploadButton id="upload-button"/>
            <StoryAbortButton/>
        </Uploady>
    </div>
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

export const DisabledDuringUpload = () => {
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

export const DifferentConfiguration = () => {
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
    return <div {...props}
                style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}
                id="div-upload">
        This is a DIV
    </div>
}));

export const WithComponentAsButton = () => {
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

export const WithCustomFileInputAndForm = () => {
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

export default {
    component: UploadButton,
    title: "Upload Button",
    decorators: [withKnobs],
    parameters: {
        readme: {
            sidebar: readme,
        },
        options: {
            showPanel: true,
            //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
            theme: {}
        },
    },
};
