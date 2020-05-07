# Uploader Events

When files are added to the upload queue, they are organized in batches and each file is represented by a batch item.

Both batches and batch items have their own life-cycles and the uploader exposes events for all of them.

The entire list of Uploader events is documented in the [Uploader README](../packages/uploader#events).

Extensions may also add their own events. For example, [Retry](../packages/ui/retry-hooks#events).


## Cancellable Events

There are explained in further detail [here](../packages/uploader#cancellable-events).

These events allow you to cancel the uploading batch or item.

Cancelling the operation through an event handler is done by returning false or by returning a Promise that resolves with false.

## Usage

While in React, [Uploady hooks](../packages/ui/uploady#hooks) provide easy access to event handling. 

However, outside of React, it is also possible to handle these events using the uploader's: on, off and once methods.

## Examples

### Working with the Uploder instance

If you're creating your own uploader instance (what Uploady does for you):

```javascript

import createUploader, { UPLOADER_EVENTS } from "@rpldy/uploader";

const uploader = createUploader({ destination: {url: "https://my-server.com/upload" }});

const unregister = uploader.on(UPLOADER_EVENTS.BATCH_ADD, (batch) => {
    //cancel the batch if more than 10 items
    return batch.items.length <= 10;
});

//same as using the off method
unregister(); 
```

### Using the Uploady props

In React, if you're not using hooks, you can still handle events. 
You can pass event handlers directly to the Uploady instance:

```javascript
import React, { useMemo } from "react";
import Uploady, { UPLOADER_EVENTS } from "@rpldy/uplady";

const MyApp = () => {
    
    const listeners = useMemo(() => ({
        [UPLOADER_EVENTS.BATCH_START]: (batch) => {
            console.log(`Batch Start - ${batch.id} - item count = ${batch.items.length}`);
        },
        [UPLOADER_EVENTS.BATCH_FINISH]: (batch) => {
             console.log(`Batch Finish - ${batch.id} - item count = ${batch.items.length}`);
        },
        [UPLOADER_EVENTS.ITEM_START]: (item) => {
            console.log(`Item Start - ${item.id} : ${item.file.name}`);
        },
        [UPLOADER_EVENTS.ITEM_FINISH]: (item) => {
            console.log(`Item Finish - ${item.id} : ${item.file.name}`);
        },
    }), []);

    return <Uploady listeners={listeners}>
        {...}
    </Uploady>; 
};
```

### Using the Context API

Also in React, if you're not using hooks. You can register your handlers using the Uploady Context API:

```javascript
import React, { useEffect } from "react";
import Uploady, { UploadyContext, UPLOADER_EVENTS } from "@rpldy/uplady";

const MyUploadyLogger = () => {
    const uploadyContext = useContext(UploadyContext);

    useEffect(() => {
        const onItemStart = (item) => {
            console.log(`Item Start - ${item.id} : ${item.file.name}`);
        };
    
        uploadyContext.on(UPLOADER_EVENTS.ITEM_START, onItemStart);
    
        return () => {
            uploadyContext.off(UPLOADER_EVENTS.ITEM_START, onItemStart);
        };
    }, [uploadyContext]);    
};

const MyApp = () => {
        
    return <Uploady>
        <MyUploadyLogger />
    </Uploady>; 
};
```