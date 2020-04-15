# Uploader

The processing and queuing engine.
The Uploader creates batches from the files passed to it for upload. 
It will handle the processing and send the files to be uploaded to the server.
Uploader fires Batch & BatchItem lifecycle events that can be listened to as well cancel uploads dynamically. 


## Installation

```shell

   $ yarn add @rpldy/uploader
``` 

Or 

```shell

   $ npm i @rpldy/uploader
```

## Upload Options

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | -------------
| autoUpload           | boolean       | true          | automatically upload files when they are added 
| destination          | [Destination](../../shared/src/types.js#L7)   | undefined     | configure the end-point to upload to
| inputFieldName       | string        | "file"        | name (attribute) of the file input field
| grouped              | boolean       | false         | group multiple files in a single request 
| maxGroupSize         | number        | 5             | maximum of files to group together in a single request 
| formatGroupParamName | (number, string) => string | undefined | determine the upload request field name when more than file is grouped in a single upload
| fileFilter           | (File &#124; string) => boolean | undefined | return false to exclude from batch
| method               | string        | "POST"        | HTTP method in upload request
| params               | Object        | undefined     | collection of params to pass along with the upload
| forceJsonResponse    | boolean       | false         | parse server response as JSON even if no JSON content-type header received            
| withCredentials      | boolean       | false         | set XHR withCredentials to true
| enhancer             | [UploaderEnhancer](../../uploader/src/types.js#L37) | undefined    | uploader [enhancer](../../../README.md#enhancer) function
| concurrent           | boolean       | false          | issue multiple upload requests simultaneously
| maxConcurrent        | number        | 2              | maximum allowed simultaneous requests
| send                 | [SendMethod](../../shared/src/types.js#L100) | @rpldy/sender | how to send files to the server



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

## Cancellable Events
