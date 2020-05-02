# File Filter

The fileFilter upload option can be used to filter out files (or URLs) before an upload batch is created.
In case a falsy value is returned, the file (or URL) will not be uploaded.

Unlike with [Cancellable Events](../packages/uploader#cancellable-events), items that are filtered out are never recorded as part of a batch.
This means that no events will fire for there items, and the uploader will not be aware of them.

## Example

```javascript

import React, { useCallback } from "react";
import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const MyApp = () => {   
    const filterBySize = useCallback((file) => {
        //filter out files larger than 5MB
    	return file.size < 5242880;
    }, []);

    return <Uploady fileFilter={filterBySize}>
        <UploadButton/>
    </Uploady>;
};

```