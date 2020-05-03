import React from "react";
import styled from "styled-components";
import { Circle } from "rc-progress";
import { useItemProgressListener } from "@rpldy/uploady";
import { logToCypress } from "./uploadyStoryLogger";

const StyledProgressCircle = styled(Circle)`
  width: 100px;
  height: 100px;
`;

const StoryUploadProgress = () => {
    const [uploads, setUploads] = React.useState({});
    const progressData = useItemProgressListener((item) => {
        console.log(">>>>> (hook) File Progress - ", item);
        logToCypress(`progress event uploaded: ${item.loaded}, completed: ${item.completed}`);
    });

    //TODO : add error hook - paint circle red on error

    if (progressData && progressData.completed) {
        const upload = uploads[progressData.id] ||
            { name: progressData.url || progressData.file.name, progress: [0] };

        if (!~upload.progress.indexOf(progressData.completed)) {
            upload.progress.push(progressData.completed);

            setUploads({
                ...uploads,
                [progressData.id]: upload,
            });
        }
    }

    const entries = Object.entries(uploads);

    return <div>
        {entries
            .map(([id, { progress, name }]) => {
                const lastProgress = progress[progress.length - 1];

                return <div key={id}>
                    <StyledProgressCircle strokeWidth={2}
                                          strokeColor={lastProgress === 100 ? "#00a626" : "#2db7f5"}
                                          percent={lastProgress}
                    />
                    <p>{id} : {name}</p>
                </div>;
            })}
    </div>;
};

export default StoryUploadProgress;
