# Uploady

This is the main UI package. It's main role is to initialize and expose the [uploader](../../uploader) functionality.
It contains the Provider that all other UI packages rely on.

It provides multiple hooks that enable more advanced features and data for client apps.


## Installation

```shell

   $ yarn add @rpldy/uploady 
```
>   

Or 

```shell

   $ npm i @rpldy/uploady 
```

## Example

To be able to use one of the [UI Components](../../../README.md#ui-packages) or one of the hooks, you need to wrap them with <Uploady>.
This will give them access to the UploadyContext.

```javascript

import Uploady from "@rpldy/uploady";

const App = () => (<Uploady
    multiple
    grouped
    maxGroupSize={2}
    method="PUT"
    destination={{url: "https://my-server", headers: {"x-custom": "123"}}}>

    <RestOfMyApp/>
</Uploady>)

```


## Context

When working in React, The UploadyContext is the API provider for the uploader mechanism.
It wraps the uploadre and exposes everything the app using it needs.

```javascript
import React, { useContext, useCallback } from "react";
import Uploady, { UploadyContext } from "@rpldy/uploady";

const MyComponent = () => { 
    const uploady = useContext(UploadyContext);

    const onClick = useCallback(()=> {
            uploady.showFileUpload();
        });

    return <button onClick={onClick}>Custom Upload Button</button>
}

const App = () => (<Uploady>
    <MyComponent/>
</Uploady>);

```

The UploadyContext API:

* showFileUpload - (?UploadOptions) => void
    
    Show the native file selection dialog. Pass upload options to override options set as props on the <Uploady/> component. 

* upload - (files: UploadInfo | UploadInfo[], addOptions: ?UploadOptions) => void

* setOptions - (CreateOptions) => void

            getOptions,
            getExtension,
            abort,
            abortBatch,
            on,
            once,
            off,



## Events

	[UPLOADER_EVENTS.BATCH_START],
    [UPLOADER_EVENTS.BATCH_FINISH],
    [UPLOADER_EVENTS.BATCH_CANCEL],
    [UPLOADER_EVENTS.BATCH_ABORT],
    [UPLOADER_EVENTS.ITEM_START],
    [UPLOADER_EVENTS.ITEM_FINISH],
    [UPLOADER_EVENTS.ITEM_CANCEL],
    [UPLOADER_EVENTS.ITEM_ERROR],
    [UPLOADER_EVENTS.REQUEST_PRE_SEND],

### Cancellable Events


### withEvent.... maybe dont need

### Hooks

    useUploadOptions,
    
    useBatchAddListener,
    useBatchStartListener,
    useBatchProgressListener,
    useBatchFinishListener,
    useBatchCancelledListener,
    useBatchAbortListener,

    useItemStartListener,
    useItemFinishListener,
    useItemProgressListener,
    useItemCancelListener,
    useItemErrorListener,

    useRequestPreSend,
    
 ## custom file input and useFileInput

will use the input name attribute and url (action), and method from the form element if the input resides in one
only if a destination configuration object wasnt provided already
 
 > updating the attributes of the form wont affect the uploader configuration
 