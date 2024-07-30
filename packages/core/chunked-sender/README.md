<a href="https://badge.fury.io/js/%40rpldy%2Fchunked-sender">
    <img src="https://badge.fury.io/js/%40rpldy%2Fchunked-sender.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/chunked-sender">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/chunked-sender" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Chunked Sender

Adds chunked upload capabilities on top of the regular XHR [@rpldy/sender](../sender)
Exposes an UploaderEnhancer that replaces the default send method the [uploader](../uploader) uses.

For usage with your React app, see [@rpldy/chunked-uploady](../ui/chunked-uploady).

Chunked uploading doesn't support grouped uploads (in single XHR request) or URL uploading. 
These will be handed over to the default [@rpldy/sender](../sender)

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/chunked-sender

#NPM:
  $ npm i @rpldy/chunked-sender
``` 

## Options

| Name (* = mandatory) | Type          | Default       | Description  |
| --------------       | ------------- | ------------- | ------------|
| chunked               | boolean       | true          | chunk uploads. setting to false will return to default sending behavior|
| chunkSize             | number        | 5242880      | the chunk size. relevant when uploaded file is larger than the value|
| retries               | number        | 0             | how many times to retry sending a failed chunk|
| parallel              | number        | 0             | how many (chunk) requests to send simultaneously|

## Events

Chunked Sender makes it possible to handle chunk life-time events.
See [uploader events](../uploader/README.md#events) section on more info regarding how to register for events.

### CHUNK_EVENTS.CHUNK_START

Triggered when a chunk is about to be sent to the server

> This event is _[cancellable](../uploader/README.md#cancellable-events)_

The event handler may return an object with the following shape: 

```javascript
type StartEventResponse = {
	url: string,
    sendOptions: ChunkedSendOptions
}
``` 

> * [ChunkedSendOptions](src/types.js#L16)

### CHUNK_EVENTS.CHUNK_FINISH

Triggered when a chunk has finished uploading

### Item Error

In case of chunk upload error in conjunction of using the [ITEM_ERROR](https://react-uploady.org/docs/api/events/#itemError) or the
[useItemErrorListener](https://react-uploady.org/docs/api/hooks/useItemErrorListener/) hook, it is possible to access the error information returned from the server like so:

```jsx

import { useItemErrorListener } from "@rpldy/uploady";

const MyComponent = () => {
    useItemErrorListener((item) => {
        console.log(`item ${item.id} failed -  status code:`, item.uploadResponse.chunkUploadResponse.status); //the status code returned by the server on the failed chunk
        console.log(`item ${item.id} failed -  msg:`, item.uploadResponse.chunkUploadResponse.response); //the response data (if) sent by the server on the failed chunk
    });

    //...
};
```

