# Uploady

This is the main UI package. It's main role is to initialize and expose the [uploader](../../uploader) functionality.
It contains the Provider that all other UI packages rely on.

It provides multiple hooks that enable more advanced features and data for client apps.


## Installation

```bash

   yarn add @rpldy/uploady 
```
>   

Or 

```bash

   npm i @rpldy/uploady 
```

## Example





## Context

UploadyContext,


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
 