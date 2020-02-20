import React from "react";
import styled from "styled-components";
import { Circle } from "rc-progress";
import { useFileProgressListener } from "@rpldy/uploady";

const StyledProgressCircle = styled(Circle)`
  width: 100px;
  height: 100px;
`;

const StoryUploadProgress = () => {
    const [uploads, setUploads] = React.useState({});
    const progressData = useFileProgressListener((item) => {
        console.log(">>>>> (hook) File Progress - ", item);
    });

    if (progressData && progressData.completed) {
        const upload = uploads[progressData.id] || { name: progressData.file.name, progress: [0] };

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
            .map(([id, { progress, name }]) =>
                <div key={id}>
                    <StyledProgressCircle strokeWidth={2}
                                          percent={progress[progress.length - 1]}
                    />
                    <p>{name}</p>
                </div>)}
    </div>;
};

export default StoryUploadProgress;
