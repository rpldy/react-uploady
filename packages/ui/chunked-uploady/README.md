<a href="https://badge.fury.io/js/%40rpldy%2Fchunked-uploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Fchunked-uploady.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
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

Internally, _ChunkedUploady_ uses [@rpldy/chunked-sender](../../chunked-sender) instead of the default sender.

_Chunked-Sender_, doesn't support grouped uploads (see Upload Options [documentation](../uploady#props)) or URL uploading. 
These will be handed over to the default [@rpldy/sender](../../sender).

In case the browser doesn't support chunking (blob slicing), the default sender will be used as well.

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/chunked-uploady

#NPM:
   $ npm i @rpldy/chunked-uploady
``` 

> Note that you don't need @rpldy/uploady, it comes with.

## Props

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | ------------
| chunked               | boolean       | true          | chunk uploads. setting to false will return to default sending behavior
| chunkSize             | number        | 5242880      | the chunk size. relevant when uploaded file is larger than the value
| retries               | number        | 0             | how many times to retry sending a failed chunk
| parallel              | number        | 0             | how many (chunk) requests to send simultaneously

In addition, all [UploadOptions](../../shared/src/types.js#L104) props can be passed to ChunkedUploady.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](../uploady#props) for detailed list of upload options.   

## Example

```javascript
 import React from "react";
 import ChunkedUploady from "@rpldy/chunked-uploady";
 import UploadButton from "@rpldy/upload-button";
 
 const App = () => (<ChunkedUploady
     destination={{ url: "https://my-server/upload" }}
     chunkSize={2142880}>
        
     <UploadButton/>
 </ChunkedUploady>);
 
 ```

