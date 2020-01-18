// @flow
import React, { Component, useMemo, useState, useContext } from "react";
import UploadButton from "./src";
import Uploady, {
	UploadyContext,
	useFileFinishListener,
	useBatchStartListener,
	useBatchAbortListener,

	UPLOADER_EVENTS,
} from "@rpldy/uploady";
import {
	withKnobs,
	useStoryUploadySetup,
	StoryUploadProgress,
} from "../../../story-helpers";

// import readme from '../README.md';


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
		rouped={grouped}
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

const AbortButton = () => {
	const context = useContext(UploadyContext);
	const [uploadingId, setUploading] = useState(null);

	useBatchStartListener((batch) => {
		setUploading(batch.id);
	});

	useBatchAbortListener((batch) => {
		console.log(">>>>> AbortButton - (hook) BATCH ABORT - ", batch);
	});

	return context && uploadingId ? <button onClick={() => {
		context.abortBatch(uploadingId);
	}}>Abort</button> : null;
};

export const Abort = () => {

	const { enhancer, destination, multiple } = useStoryUploadySetup();

	return <div>
		<p>Enable the "local destination" with "long local request" knobs to be able to try aborting a
			running request</p>
		<Uploady
			debug
			multiple={multiple}
			destination={destination}
			enhancer={enhancer}>

			<UploadButton/>
			<AbortButton/>
		</Uploady>
	</div>
};

export default {
	component: UploadButton,
	title: "Upload Button",
	decorators: [withKnobs],
};
