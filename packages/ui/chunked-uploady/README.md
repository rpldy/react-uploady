<a href="https://opencollective.com/react-uploady">
    <img src="https://img.shields.io/opencollective/all/react-uploady?style=flat&logo=opencollective&label=Support%20us!&color=blue" alt="Support on Open Collective"/>
</a>
<a href="https://badge.fury.io/js/%40rpldy%2Fchunked-uploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Fchunked-uploady.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/chunked-uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/chunked-uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.app/?path=/docs/ui-chunked-uploady--docs">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Chunked Uploady

This package is provided as a convenient alternative to the main [Uploady](https://react-uploady.org/docs/api/) package. 
To be used in case chunked upload is required.

The server that is accepting the upload must also support chunked uploads. 
The original file is broken down into smaller blobs, which are sent in different requests. 
By default, each request is sent with the _Content-Range_ header to specify the bytes range (can be disabled via `sendWithRangeHeader` option).

Internally, _ChunkedUploady_ uses [@rpldy/chunked-sender](https://react-uploady.org/docs/api/senders/chunkedSender/) instead of the default sender.

_Chunked-Sender_, doesn't support grouped uploads (see Upload Options [documentation](https://react-uploady.org/docs/api/#props)) or URL uploading. 
These will be handed over to the default [@rpldy/sender](https://react-uploady.org/docs/api/senders/xhrSender/).

In case the browser doesn't support chunking (blob slicing), the default sender will be used as well.

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav"> 
        <img width="700" alt="uploady-buy-me-coffee" src="https://github.com/user-attachments/assets/3a22cd82-94f8-4b79-8b1b-c783be5ecb88">
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

| Name (* = mandatory) | Type    | Default | Description                                                             | 
|----------------------|---------|---------|-------------------------------------------------------------------------|
| chunked              | boolean | true    | chunk uploads. setting to false will return to default sending behavior |
| chunkSize            | number  | 5242880 | the chunk size. relevant when uploaded file is larger than the value    |
| retries              | number  | 0       | how many times to retry sending a failed chunk                          |
| parallel             | number  | 0       | how many (chunk) requests to send simultaneously                        |
| sendWithRangeHeader  | boolean | true    | whether to include the Content-Range header per chunk request           |

In addition, all [UploadOptions](https://react-uploady.org/docs/api/types/#uploadoptions) props can be passed to ChunkedUploady.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](https://react-uploady.org/docs/api/#props) for detailed list of upload options.   

## Hooks

Chunked Uploady provides hooks for chunk life-time events:

### useChunkStartListener 

Called when a chunk is about to be sent to the server

> This event is _[cancellable](https://react-uploady.org/docs/api/events/#cancellable-events)_

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

