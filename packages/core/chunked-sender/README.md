<a href="https://badge.fury.io/js/%40rpldy%2Fchunked-sender">
    <img src="https://badge.fury.io/js/%40rpldy%2Fchunked-sender.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
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

Doesnt support grouped uploads (in single XHR equest) or URL uploading. 
These will be handed over to the default [@rpldy/sender]()

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/chunked-sender

#NPM:
  $ npm i @rpldy/chunked-sender
``` 

## Options

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | ------------
| chunked               | boolean       | true          | chunk uploads. setting to false will return to default sending behavior
| chunkSize             | number        | 5242880      | the chunk size. relevant when uploaded file is larger than the value
| retries               | number        | 0             | how many times to retry sending a failed chunk
| parallel              | number        | 0             | how many (chunk) requests to send simultaneously

## Events

Chunked Sender makes it possible to handle chunk life-time events.
See [uploader events](../uploader/README.md#events) section on more info regarding how to register for events.

## CHUNK_EVENTS.CHUNK_START

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

## CHUNK_EVENTS.CHUNK_FINISH

Triggered when a chunk has finished uploading

