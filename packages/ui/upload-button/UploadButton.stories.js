// @flow
import React, { Component, useEffect, useMemo } from "react";
import UploadButton from "./src";
import Uploady, {
    UploadyContext,
    useFileFinishListener,
    useBatchStartListener,
    // useBatchAbortListener,

    UPLOADER_EVENTS,
} from "@rpldy/uploady";
import {
    withKnobs,
    useStoryUploadySetup,
    StoryUploadProgress,
    StoryAbortButton,
} from "../../../story-helpers";

// import readme from '../README.md';

// const Test = (props) => {
//     useEffect(() => {
//         console.log("!!!!!!!!!! TEST USE EFFECT ", props.destination);
//         return () => {
//             console.log("!!!!!!!!!! TEST CLEAN UP !!! ", props.destination);
//         };
//     }, [props.destination]);
//
//     return null;
// };

export const Simple = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <UploadButton/>
    </Uploady>;
};

export const WithEventListeners = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const listeners = useMemo(() => ({
        [UPLOADER_EVENTS.BATCH_START]: (batch) => {
            console.log(`>>>>> WithEventListeners - BATCH START - ${batch.id}`)
        },
        [UPLOADER_EVENTS.BATCH_FINISH]: (batch) => {
            console.log(`>>>>> WithEventListeners - BATCH FINISH - ${batch.id}`, batch)
        },
        [UPLOADER_EVENTS.ITEM_START]: (file) => {
            console.log(`>>>>> WithEventListeners - FILE START - ${file.id}`)
        },
        [UPLOADER_EVENTS.ITEM_FINISH]: (file) => {
            console.log(`>>>>> WithEventListeners - FILE FINISH - ${file.id}`, file)
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
    </Uploady>;
};

const HookedUploadButton = () => {
    useFileFinishListener((file) => {
        console.log(">>>>>> HookedUploadButton - FILE FINISH - ", file);
    });

    useBatchStartListener((batch) => {
        console.log(">>>>> HookedUploadButton - (hook) BATCH START - ", batch);

        const item = batch.items[0];

        if (item.file) {
            console.log(item.file);
        }
    });

    return <UploadButton/>;
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
        <StoryUploadProgress/>
        <UploadButton/>
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

export const Abort = () => {

    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <div>
        <p>Enable the "local destination" with "long local request" knobs to be able to try aborting
            a
            running request</p>
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}>

            <UploadButton/>
            <StoryAbortButton/>
        </Uploady>
    </div>
};

export const DifferentConfiguration = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    const destinationOverride = useMemo(() => ({
        ...destination,
        headers: { ...destination.headers, "x-test": "1234" }
    }), [destination]);

    return <div>
        <p>Buttons can use different configuration overrides. Some options cannot be overriden by the button.<br/>
        For example, any props that influence the file input directly (such as multiple)</p>
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}>

            <UploadButton autoUpload={false}>
                autoUpload = false
            </UploadButton>
            <br/>
            <UploadButton destination={destinationOverride}>
                add 'x-test' header
            </UploadButton>
        </Uploady>
    </div>

};

export default {
    component: UploadButton,
    title: "Upload Button",
    decorators: [withKnobs],
};
