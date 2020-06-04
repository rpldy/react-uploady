// @flow
import React, { useCallback, useState, memo } from "react";
import styled from "styled-components";
import { withKnobs } from "@storybook/addon-knobs";
import { Circle } from "rc-progress";
import { composeEnhancers } from "@rpldy/uploader";
import Uploady, {
	useItemStartListener,
	useItemProgressListener,
	useItemAbortListener,
	useItemErrorListener,
	useAbortItem,
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";
import { StoryUploadProgress, useStoryUploadySetup } from "../../../story-helpers";
import retryEnhancer, { useBatchRetry, useRetry, useRetryListener } from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

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

export const WithRetry = () => {
    const storySetup = useStoryUploadySetup();
    const { destination, multiple, grouped, groupSize } = storySetup;
    let { enhancer } = storySetup;

    enhancer = enhancer ?
        composeEnhancers(retryEnhancer, enhancer) : retryEnhancer;

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <RetryUi />
    </Uploady>
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
	[STATES.ABORTED]: "#f7cdcd",
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

const PreviewItemContainer = styled.div`
  width: 220px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ state }) => (state ? STATE_COLORS[state] : "#c3d2dd")} 0px
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

const ItemButtons = styled.div`
  button {
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
  }
`;

const AbortButton = ({ id, state }) => {
	const abortItem = useAbortItem();
	const onAbort = useCallback(() => abortItem(id), [id, abortItem]);

	return (
		<button
			disabled={state === STATES.ABORTED || state === STATES.DONE}
			onClick={onAbort}
		>
			🛑
		</button>
	);
};

const RetryButton = ({ id, state }) => {
	const retry = useRetry();
	const onRetry = useCallback(() => retry(id), [id, retry]);

	return (
		<button disabled={state !== STATES.ABORTED} onClick={onRetry}>
			🔃
		</button>
	);
};

const ItemPreview = memo((props) => {
	const [progress, setProgress] = useState(0);
	const [itemState, setItemState] = useState(0);

	useItemProgressListener(item => {
		if (item.completed > progress) {
			setProgress(() => item.completed);
			setItemState(() =>
				item.completed === 100 ? STATES.DONE : STATES.PROGRESS
			);
		}
	}, props.id);

	useItemAbortListener((item) => {
		setItemState(STATES.ABORTED);
	}, props.id);

	useItemErrorListener((item) =>{
		setItemState(STATES.ERROR);
	}, props.id);

	return (
		<PreviewItemContainer state={itemState}>
			<ImageName>{props.name}</ImageName>
			<PreviewImageWrapper>
				<PreviewImage src={props.url} />
			</PreviewImageWrapper>
			<PreviewItemBar>
				<ItemButtons>
					<AbortButton id={props.id} state={itemState} />
					<RetryButton id={props.id} state={itemState} />
				</ItemButtons>
				<StyledCircle
					strokeWidth={4}
					percent={progress}
					strokeColor={progress === 100 ? "#00a626" : "#2db7f5"}
				/>
			</PreviewItemBar>
		</PreviewItemContainer>
	);
});

export const WithRetryAndPreview = () => {
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
		>
			<div className="App">
				<UploadButton>Upload Files</UploadButton>

				<PreviewsContainer>
					<UploadPreview
						rememberPreviousBatches
						PreviewComponent={ItemPreview}
					/>
				</PreviewsContainer>
			</div>
		</Uploady>
	);
};

export default {
    title: "Retry Hooks",
    decorators: [withKnobs],
    parameters: {
        sidebar: readme,
        options: {
            showPanel: true,
            //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
            theme: {}
        },
    },
};
