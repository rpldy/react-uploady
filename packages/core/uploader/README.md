<a href="https://badge.fury.io/js/%40rpldy%2Fuploader">
    <img src="https://badge.fury.io/js/%40rpldy%2Fuploader.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/uploader">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/uploader" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

<details>
    <summary>Contents</summary>
    
* [Intro](#uploader)
* [Installation](#installation)
* [Usage](#usage)
* [Upload Options](#usage-options)
* [Uploader API](#uploader-api)
* [Events](#events)
* [Cancellable Events](#cancellable-events)
</details>

# Uploader

The Uploader is the processing and queuing engine for React-Uploady.
When files are handed to the Uploader, it will represent each file as a Batch Item and group them together in Batches.
This is for the most part internal to the uploading mechanism. 

The Uploader fires Batch & BatchItem lifecycle [events](#events) that can be registered to. 
Some of these events also allow to cancel uploads dynamically. 

_If you're looking to integrate file upload with your React app, you'd probably want to head over to the [@rpldy/uploady README](../ui/uploady).

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/uploader

#NPM:
  $ npm i @rpldy/uploader
```

## Usage

When in React, you don't need to use this package directly. Uploady will take care of initialization and other aspects (ie: event registration) for you.
In case you want to create your own uploader instance, you can do it like so:

```javascript
import createUploader, { UPLOADER_EVENTS } from "@rpldy/uploader";

const uploader = createUploader({ 
    autoUpload: false,
    grouped: true,
    //...
});

uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
     console.log(`item ${item.id} started uploading`);  
});

uploader.add(myFile);

```

## Upload Options

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | -------------
| autoUpload           | boolean       | true          | automatically upload files when they are added 
| destination          | [Destination](../shared/src/types.js#L7)   | undefined     | configure the end-point to upload to
| inputFieldName       | string        | "file"        | name (attribute) of the file input field (requires sendWithFormData = true)
| grouped              | boolean       | false         | group multiple files in a single request 
| maxGroupSize         | number        | 5             | maximum of files to group together in a single request 
| formatGroupParamName | (number, string) => string | undefined | determine the upload request field name when more than file is grouped in a single upload
| fileFilter           | (File &#124; string, index: number, File[] &#124; string[]) => boolean | undefined | return false to exclude from batch
| method               | string        | "POST"        | HTTP method in upload request
| params               | Object        | undefined     | collection of params to pass along with the upload (requires sendWithFormData = true)
| forceJsonResponse    | boolean       | false         | parse server response as JSON even if no JSON content-type header received            
| withCredentials      | boolean       | false         | set XHR withCredentials to true
| enhancer             | [UploaderEnhancer](../uploader/src/types.js#L37) | undefined    | uploader [enhancer](../../../README.md#enhancer) function
| concurrent           | boolean       | false          | issue multiple upload requests simultaneously
| maxConcurrent        | number        | 2              | maximum allowed simultaneous requests
| send                 | [SendMethod](../sender/src/types.js#L38) | @rpldy/sender | how to send files to the server
| sendWithFormData     | boolean       | true           | upload is sent as part of [formdata](https://developer.mozilla.org/en-US/docs/Web/API/FormData) - when true, additional params can be sent along with uploaded data
| formatServerResponse | [FormatServerResponseMethod](../shared/src/types.js#L40) | undefined | function to create the batch item's uploadResponse from the raw xhr response

## Uploader API

### add

_(files: UploadInfo | UploadInfo[], options?: ?UploadOptions) => void_

The way to add file(s) to be uploaded. Second parameters allows to pass different options than
the ones the instance currently uses for this specific batch. These options will be merged with current instance options.
 
### upload

_() => void_

For batches that were added with autoUpload = false, the upload method must be called for the files to begin uploading.

### abort

_(id?: string) => void_

abort all files being uploaded or a single item by its ID
   
### abortBatch

_(id: string) => void_

abort a specific batch by its ID

### update
 
_(options: UploadOptions) => UploaderType_

options parameter will be merged with the instance's existing options
Returns the uploader instance

###	getOptions

_() => CreateOptions_

get the instance's upload options

###	clearPending

_() => void_

remove all batches that were added with autoUpload = false 
and were not sent to upload yet.

### on 

_[OnAndOnceMethod](../life-events/src/types.js#29)_

register an event handler

### once 

_[OnAndOnceMethod](../life-events/src/types.js#29)_

register an event handler that will be called only once

### off
_[OffMethod](../life-events/src/types.js#27)_

unregister an existing event handler
    
### registerExtension

_(name: any, Object) => void_

Extensions can only be registered by [enhancers](../../README.md#enhancer).
If registerExtension is called outside an enhancer, an error will be thrown
Name must be unique. If not, an error will be thrown

### getExtension
 
_(name: any) => ?Object__

Retrieve a registered extension by its name

## Events

The Uploader will trigger for batch and batch-item lifecycle events.

Registering to handle events can be done using the uploader's _on()_ and _once()_ methods.
Unregistering can be done using _off()_ or by the return value of both _on()_ and _once()_.

```javascript
const batchAddHandler = (batch) => {};

const unregister = uploader.on(UPLOADER_EVENTS.BATCH_ADD, batchAddHandler);

unregister(); //is equivalent to the line below
uploader.off(UPLOADER_EVENTS.BATCH_ADD, batchAddHandler);
```

### UPLOADER_EVENTS.BATCH_ADD

Triggered when a new batch is added.

- Parameters: _(batch, uploadOptions)_ 

> This event is _[cancellable](#cancellable-events)_

### UPLOADER_EVENTS.BATCH_START

Triggered when batch items start uploading

- Parameters: _(batch)_

> This event is _[cancellable](#cancellable-events)_

### UPLOADER_EVENTS.BATCH_PROGRESS

Triggered every time progress data is received from the upload request(s)

- Parameters: _(batch)_

### UPLOADER_EVENTS.BATCH_FINISH

Triggered when batch items finished uploading

- Parameters: _(batch)_
 
### UPLOADER_EVENTS.BATCH_CANCEL

Triggered in case batch was cancelled from BATCH_START event handler

- Parameters: _(batch)_

### UPLOADER_EVENTS.BATCH_ABORT

Triggered in case the batch was [aborted](#abortBatch)

- Parameters: _(batch)_

### UPLOADER_EVENTS.ITEM_START

Triggered when item starts uploading (just before)
For grouped uploads (multiple files in same xhr request) ITEM_START is triggered for each item separately 

- Parameters: _(item)_

> This event is _[cancellable](#cancellable-events)_

### UPLOADER_EVENTS.ITEM_FINISH

Triggered when item finished uploading successfully

- Parameters: _(item)_

> The server response can be accessed through the item's _uploadResponse_ property and status code through _uploadStatus_ 

### UPLOADER_EVENTS.ITEM_PROGRESS

Triggered every time progress data is received for this file upload

- Parameters: _(item)_

> progress info is accessed through the item's "completed" (percentage) and "loaded" (bytes) properties.

### UPLOADER_EVENTS.ITEM_CANCEL

Triggered in case item was cancelled from [ITEM_START](#UPLOADER_EVENTS.ITEM_START) event handler

- Parameters: _(item)_

### UPLOADER_EVENTS.ITEM_ERROR

Triggered in case item upload failed

- Parameters: _(item)_

> The server response can be accessed through the item's uploadResponse property.

### UPLOADER_EVENTS.ITEM_ABORT
    
Triggered in case [abort](#abort) was called

- Parameters: _(item)_

### UPLOADER_EVENTS.ITEM_FINALIZE

Triggered for item when uploading is done due to: finished, error, cancel or abort
Use this event if you want to handle the state of the item being done for any reason.

- Parameters: _(item)_

### UPLOADER_EVENTS.REQUEST_PRE_SEND

Triggered before a group of items is going to be uploaded
Group will contain a single item unless "grouped" option is set to true.

Handler receives the item(s) in the group and the upload options that were used.
The handler can change data inside the items and in the options by returning different data than received.
See this [guide](../../../guides/DynamicParameters.md) for more details.

- Parameters: _(items, options)_

> This event is _[cancellable](#cancellable-events)_

### UPLOADER_EVENTS.ALL_ABORT

Triggered when abort is called without an item id (abort all)

- no parameters

## Cancellable Events

These are events that allow the client to cancel their respective upload object (batch or batch-item)
To cancel the upload, the handler must return (boolean) false.

```javascript
uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
    let result;
    
    if (item.file.name.endsWith(".xml")) {
        result = false; //only false will cause a cancel.
    }

    return result;
});
```