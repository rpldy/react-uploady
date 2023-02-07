// @flow
import React, { useCallback, useState, useRef, memo } from "react";
import styled from "styled-components";
import { Circle } from "rc-progress";
import { composeEnhancers } from "@rpldy/uploader";
import Uploady, {
	useItemStartListener,
	useItemProgressListener,
	useItemAbortListener,
	useItemErrorListener,
	useAbortItem,
    useItemFinishListener,
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";
import {
    getCsfExport,
    logToCypress,
    StoryUploadProgress,
    useStoryUploadySetup,
    type CsfExport
} from "../../../story-helpers";
import retryEnhancer, { useBatchRetry, useRetry, useRetryListener, RETRY_EVENT } from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

import type {Node} from "React";
import type { RefObject } from "@rpldy/shared-ui";
import type { RemovePreviewMethod, PreviewProps, PreviewMethods, PreviewItem } from "@rpldy/upload-preview";

const RetryUi = () => {
	const [seenItems, setItems] = useState({});
	const [seenBatches, setBatches] = useState([]);
	const abortItem = useAbortItem();
	const retry = useRetry();
	const retryBatch = useBatchRetry();

	useItemStartListener((item) => {
		if (!seenItems[item.id]) {
			setItems((seen) => {
				return { ...seen, [item.id]: item.file ? item.file.name : item.url };
			});

			setBatches((batches) => {
				return !~batches.indexOf(item.batchId) ?
					batches.concat(item.batchId) :
					batches;
			});

			abortItem(item.id);
		}
	});

	useRetryListener(({ items }) => {
		console.log("##### RETRY EVENT - retrying items: ", items);
        logToCypress(`###${RETRY_EVENT}`, items);
	});

	const onRetryAll = useCallback(() => {
		retry();
	}, [retry]);

	const onRetryItem = useCallback((e) => {
		const itemId = e.target.dataset["id"];
		retry(itemId);
	}, [retry]);

	const onRetryBatch = useCallback((e) => {
		const batchId = e.target.dataset["id"];
		retryBatch(batchId);
	}, [retryBatch]);

	return <>
		<UploadButton id="upload-button"/>
		<br/>
		<button id="retry-all" onClick={onRetryAll}>Retry All</button>

		<section>Failed Batches:
			<ul>
				{seenBatches.map((bId, index) =>
					<li style={{ cursor: "pointer" }}
						key={bId}
						data-id={bId}
						data-test={`batch-retry-${index}`}
						onClick={onRetryBatch}>
						{bId}
					</li>)}
			</ul>
		</section>

		<section>Failed Items:
			<ul>
				{Object.keys(seenItems).map((id, index) =>
					<li style={{ cursor: "pointer" }}
						data-id={id} key={id}
						data-test={`item-retry-${index}`}
						onClick={onRetryItem}>
						cancelled: ({id}) {seenItems[id]}
					</li>)}
			</ul>
		</section>
		<br/>
		<StoryUploadProgress/>
	</>
};

export const WithRetry = (): Node => {
	const storySetup = useStoryUploadySetup();
	const { destination, multiple, grouped, groupSize } = storySetup;
	let { enhancer } = storySetup;

	enhancer = enhancer ?
		composeEnhancers(retryEnhancer, enhancer) : retryEnhancer;

    return (
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}
            grouped={grouped}
            maxGroupSize={groupSize}
            fileFilter={
                (f) =>
                    f instanceof File &&
                    (f.type.startsWith("image/") || f.type.includes("pdf"))
            }
        >
            <RetryUi/>
        </Uploady>
    );
};

const STATES = {
	PROGRESS: "PROGRESS",
	DONE: "DONE",
	ABORTED: "ABORTED",
	ERROR: "ERROR",
};

const STATE_COLORS = {
	[STATES.PROGRESS]: "#f4e4a4",
	[STATES.DONE]: "#a5f7b3",
	[STATES.ABORTED]: "#b855da",
	[STATES.ERROR]: "#ee4c4c",
};

const StyledCircle = styled(Circle)`
  width: 32px;
  height: 32px;
`;

const PreviewsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  border-top: 1px solid #0c86c1;
  margin-top: 10px;
`;

const PreviewImageWrapper = styled.div`
  height: 150px;
  text-align: center;
  width: 100%;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  height: auto;
  max-height: 140px;
`;

const PreviewItemContainer = styled.article`
  width: 220px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ state }: { state : string }) => (state ? STATE_COLORS[state] : "#c3d2dd")} 0px
    8px 5px -2px;
  position: relative;
  align-items: center;
  margin: 0 10px 10px 0;
`;

const ImageName = styled.span`
  position: absolute;
  top: 10px;
  font-size: 12px;
  padding: 3px;
  background-color: #25455bab;
  width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
`;

const PreviewItemBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  width: 100%;
  box-shadow: #5dbdec 0px -3px 2px -2px;
`;

const Button = styled.button`
    width: 52px;
    height: 34px;
    font-size: 26px;
    line-height: 26px;
    cursor: pointer;
    margin-right: 4px;

    :disabled {
      cursor: not-allowed;
      background-color: grey;
      color: grey;
    }
`;

const QueueBar = styled.div`
	width: 100%;
	height: 40px;
	display: flex;
	justify-content: flex-end;
	align-items: center;
`;

const AbortButton = ({ id, state }: { id: string, state: string }) => {
	const abortItem = useAbortItem();
	const onAbort = useCallback(() => abortItem(id), [id, abortItem]);

	return <Button
		disabled={state === STATES.ABORTED || state === STATES.DONE}
		onClick={onAbort}
		data-test="abort-button"
	>
		🛑
	</Button>;
};

const RetryButton = ({ id, state }: { id: string, state: string }) => {
	const retry = useRetry();
	const onRetry = useCallback(() => retry(id), [id, retry]);

	return <Button disabled={state !== STATES.ABORTED}
				   onClick={onRetry}
				   data-test="retry-button"
	>
		🔃
	</Button>;
};

const ClearPreviewsButton = ({ methods, previews }: { methods: RefObject<PreviewMethods>, previews: PreviewItem[]  }) => {
	const disabled = !methods.current?.clear || !previews.length;

	const onClear = useCallback(() => {
		if (methods.current?.clear) {
			methods.current.clear()
		}
	}, [methods]);

	return <>
		<Button disabled={disabled} onClick={onClear} data-test="queue-clear-button">
			🗑️
		</Button>
		({previews.length} items)
	</>;
};

const QueueItem = memo((props: { id: string, name: string, url: string }) => {
	const [progress, setProgress] = useState(0);
	const [itemState, setItemState] = useState("");

	useItemProgressListener((item) => {
		if (item.completed > progress) {
			setProgress(() => item.completed);
			setItemState(() => STATES.PROGRESS);
		}
	}, props.id);

    useItemFinishListener(() => setItemState(() => STATES.DONE), props.id)

	useItemAbortListener((item) => {
		setItemState(STATES.ABORTED);
	}, props.id);

	useItemErrorListener((item) => {
		setItemState(STATES.ERROR);
	}, props.id);

	return (
		<PreviewItemContainer state={itemState} data-test="preview-item-container" data-state={itemState}>
			<ImageName>{props.id} : {props.name}</ImageName>
			<PreviewImageWrapper>
				<PreviewImage src={props.url}/>
			</PreviewImageWrapper>
			<PreviewItemBar>
				<div>
					<AbortButton id={props.id} state={itemState}/>
					<RetryButton id={props.id} state={itemState}/>
				</div>
				<StyledCircle
					strokeWidth={4}
					percent={progress}
					strokeColor={progress === 100 ? "#00a626" : "#2db7f5"}
				/>
			</PreviewItemBar>
		</PreviewItemContainer>
	);
});

const Queue = () => {
	const [previews, setPreviews] = useState([]);
	const previewMethodsRef = useRef();
	const onPreviewsChanged = useCallback((previews) => {
		setPreviews(previews);
	}, []);

	return <PreviewsContainer>
		<QueueBar>
			<ClearPreviewsButton methods={previewMethodsRef} previews={previews} />
		</QueueBar>
		<UploadPreview
			rememberPreviousBatches
			PreviewComponent={QueueItem}
			previewMethodsRef={previewMethodsRef}
			onPreviewsChanged={onPreviewsChanged}
		/>
	</PreviewsContainer>
};

export const WithRetryAndPreview = (): Node => {
	const storySetup = useStoryUploadySetup();
	const { destination, multiple, grouped, groupSize } = storySetup;
	let { enhancer } = storySetup;

	enhancer = enhancer ?
		composeEnhancers(retryEnhancer, enhancer) : retryEnhancer

	return (
		<Uploady
			debug
			destination={destination}
			multiple={multiple}
			grouped={grouped}
			maxGroupSize={groupSize}
            enhancer={enhancer}
            fileFilter={
                (f) =>
                    f instanceof File &&
                    (f.type.startsWith("image/") || f.type.includes("pdf"))
            }
        >
			<div className="App">
				<UploadButton id="upload-button">Upload Files</UploadButton>
				<Queue/>
			</div>
		</Uploady>
	);
};

export default (getCsfExport(undefined, "Retry Hooks", readme, { pkg: "retry-hooks", section: "UI" }): CsfExport);
