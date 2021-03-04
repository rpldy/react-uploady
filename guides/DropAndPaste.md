# Drop and Paste

With [@rpldy/upload-paste](../packages/ui/upload-paste) you can make an element a 
recipient of paste events that trigger an upload.

With [@rpldy/upload-drop-zone](../packages/ui/upload-drop-zone) you can make an element trigger upload by 
accepting a file being dropped on it.

Combining the two together can be a very nice user experience. For example: Whatsapp Web does this very nicely.
You can drag&drop a file on the chat area but you can also simply paste a file. Both actions will initiate the file sharing feature.

With Uploady you can do this for your apps very easily:

## Code

Below is sample code that combines both features into one element/component:

```javascript
import React, {
    useState,
    useRef,
    useCallback,
} from "react";
import styled from "styled-components";
import Uploady, { useUploady } from "@rpldy/uploady";
import UploadDropZone from "@rpldy/upload-drop-zone";
import withPasteUpload from "@rpldy/upload-paste";

const StyledDropZone = styled(UploadDropZone)`
   width: 400px;
   height: 400px;
   border: 1px solid #000;
`;

const PasteUploadDropZone = withPasteUpload(StyledDropZone);

export const MyApp = (): Node => {
    return <Uploady multiple
                    destination={{ url: "my-server.com/upload" }}>
        <PasteUploadDropZone autoUpload={false} params={{ test: "paste" }}>
            You can drop a file here
            <br/>
            OR
            <br/>
            click and paste a file to upload
        </PasteUploadDropZone>
    </Uploady>
};
```

> Note that the PasteUploadDropZone accepts [Upload Options](../packages/ui/uploady#props) that override
> the options given to the Uploady provider. 