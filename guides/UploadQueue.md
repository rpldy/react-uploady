# Upload Queue

> A more detailed demo with code can be found in this post: [hooked on file uploads with react-uploady](https://dev.to/poeticgeek/hooked-on-file-uploads-with-react-uploady-3h0j) and here: [React Uploady with Ant Design ](https://dev.to/poeticgeek/react-uploady-with-ant-design-dja)
 
 ```javascript

import React, { useCallback, useState, memo } from "react";
import styled from "styled-components";
import { Circle } from "rc-progress";
import Uploady, {
    useItemProgressListener,
    useItemAbortListener,
    useItemErrorListener,
    useAbortItem,
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";
import retryEnhancer, { useRetry } from "@rpldy/retry-hooks";

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

const QueueItem = memo((props) => {
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

export const MyApp = () => (
        <Uploady
            destination={{url: "my-server.com/upload"}}
            enhancer={retryEnhancer}
        >           
                <UploadButton>Upload Files</UploadButton>

                <PreviewsContainer>
                    <UploadPreview
                        rememberPreviousBatches
                        PreviewComponent={QueueItem}
                    />
                </PreviewsContainer>
        </Uploady>);

```
