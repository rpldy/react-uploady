# Progress UI

Uploady (the [sender](../packages/sender) really) exposes an item progress event and hook that can be used to show an upload progress UI.

Below is an example of this using the very cool [rc-progress](https://www.npmjs.com/package/rc-progress).

The [useItemProgressListener](../packages/ui/uploady#useitemprogresslistener-event-hook) hook is used to capture progress info for all uploads taking place within an Uploady instance.
Regardless of how the uploads are initiated (ex: upload-button, upload-drop-zoe, api call, etc.).

## Example

The UploadProgress component collects upload data for individual upload items as progress data comes in.

For each one, a circle progress bar will be shown with the percentage of the upload.

```javascript

import React from "react";
import { Circle } from "rc-progress";
import Uploady, { useItemProgressListener } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const UploadProgress = () => {
    const [uploads, setUploads] = React.useState({});
    const progressData = useItemProgressListener();

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
                    <Circle strokeWidth={2}
                            strokeColor={lastProgress === 100 ? "#00a626" : "#2db7f5"}
                            percent={lastProgress} />
                    <p>{id} : {name}</p>
                </div>;
            })}
    </div>;
};


const MyApp = () => {
    return <Uploady {...}>
        <UploadProgress/>
        <UploadButton/>
    </Uploady>
}

```

 