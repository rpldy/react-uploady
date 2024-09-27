<a href="https://badge.fury.io/js/%40rpldy%2Fchunked-uploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Fchunked-uploady.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/chunked-uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/chunked-uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/chunked-uploady--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Chunked Uploady

This package is provided as a convenient alternative to the main [Uploady](../uploady) package. 
To be used in case chunked upload is required.

The server that is accepting the upload must also support chunked uploads. 
The original file is broken down into smaller blobs, which are sent in different requests. 
Each request is sent with the _Content-Range_ header to specify the bytes range.

Internally, _ChunkedUploady_ uses [@rpldy/chunked-sender](../../core/chunked-sender) instead of the default sender.

_Chunked-Sender_, doesn't support grouped uploads (see Upload Options [documentation](../uploady#props)) or URL uploading. 
These will be handed over to the default [@rpldy/sender](../../core/sender).

In case the browser doesn't support chunking (blob slicing), the default sender will be used as well.

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav"> 
        <img width="700" alt="uploady-buy-me-coffee" src="https://github.com/rpldy/react-uploady/assets/1102278/c6de6710-1c93-47a5-85fa-1af7170907f8">
    </a>
</p>

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/chunked-uploady

#NPM:
   $ npm i @rpldy/chunked-uploady
``` 

> Note that you don't need @rpldy/uploady, it comes with.

## Props

| Name (* = mandatory) | Type          | Default       | Description | 
| --------------       | ------------- | ------------- | ------------|
| chunked               | boolean       | true          | chunk uploads. setting to false will return to default sending behavior|
| chunkSize             | number        | 5242880      | the chunk size. relevant when uploaded file is larger than the value|
| retries               | number        | 0             | how many times to retry sending a failed chunk|
| parallel              | number        | 0             | how many (chunk) requests to send simultaneously|

In addition, all [UploadOptions](../../core/shared/src/types.js#L104) props can be passed to ChunkedUploady.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](../uploady#props) for detailed list of upload options.   

## Hooks

Chunked Uploady provides hooks for chunk life-time events:

### useChunkStartListener 

Called when a chunk is about to be sent to the server

> This event is _[cancellable](../../core/uploader/README.md#cancellable-events)_

```javascript
import { useChunkStartListener } from "@rpldy/chunked-uploady";

const MyComponent = () => {
    useChunkStartListener((data) => {
        return {
            url: `${data.url}/${data.chunk.index}`
        };  
    });   
};
```

### useChunkFinishListener

Called when a chunk has finished uploading

## Example

```javascript
import { useChunkFinishListener } from "@rpldy/chunked-uploady";

const MyComponent = () => {
    useChunkFinishListener(({ chunk }) => {
        console.log(`Chunk Finished - ${chunk.id} - attempt: ${chunk.attempt}`);
    });
};
 ```

