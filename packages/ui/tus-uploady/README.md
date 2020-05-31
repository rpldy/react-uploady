<a href="https://badge.fury.io/js/%40rpldy%2Ftus-uploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Ftus-uploady.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/tus-uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/tus-uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/tus-uploady--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Tus Uploady

This package is provided as a convenient alternative to the main [Uploady](../uploady) package. 
To be used in case resumable (tus) upload is required.

The package wraps the [tus-sender](../../tus-sender) 

Additional information about tus functionality can be found the [tus-sender README](../../tus-sender).

## Props

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | ------------
| version           | string    | "1.0.0" | The tus server version
| featureDetection | boolean    | false | whether to query the server for supported extensions
| featureDetectionUrl | string | null | URL to query for TUS server feature detection, in case it's different from upload URL
| onFeaturesDetected  | (string[]) => ?TusOptions | void | callback to handle the extensions the server broadcasts
| resume    |   boolean     | true | whether to store information locally on files being uploaded to support resuming
| deferLength | boolean | false | defer sending file length to server ([protocol](https://tus.io/protocols/resumable-upload.html#upload-defer-length))
| overrideMethod | boolean | false | whether to use X-HTTP-Method-Override header instead of PATCH
| sendDataOnCreate | boolean | false | send first chunk with create request ([protocol](https://tus.io/protocols/resumable-upload.html#creation-with-upload))
| storagePrefix | string | "__rpldy-tus__" | the key prefix to use for persisting resumable info about files
| lockedRetryDelay | number | 2000 | milliseconds to wait before retrying a locked (423) resumable file
| forgetOnSuccess   | boolean | false | whether to remove URL from localStorage when upload finishes successfully
| ignoreModifiedDateInStorage   | boolean   | false     | ignore File's modified date when creating key for storage

In addition, all [UploadOptions](../../shared/src/types.js#L104) props can be passed to TusUploady.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](../uploady#props) for detailed list of upload options.   

> All of the [chunked-sender options](../chunked-sender#options) are supported as well

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/tus-uploady

#NPM:
  $ npm i @rpldy/tus-uploady
``` 

## TUS Protocol

On top of the Core Protocol, Uploady supports the following extensions:

- [Creation](https://tus.io/protocols/resumable-upload.html#creation) (creation)
- [Creation with Upload](https://tus.io/protocols/resumable-upload.html#creation-with-upload) (creation-with-upload)
- [Concatenation](https://tus.io/protocols/resumable-upload.html#concatenation) (concatenation)
- [Creation Defer Length](https://tus.io/protocols/resumable-upload.html#upload-defer-length) (creation-defer-length)

It also supports the __Upload-Metadata__ header and will turn the destination __params__ prop into the metadata key/value.

## Hooks

### useClearResumableStore

By default, the tus-sender will store the URLs for uploaded files so it can query
the server for their status and skip chunks that are indicated as uploaded.

The URLs are persisted to local storage. This hooks allows you to clear the URLs that were previously persisted.

```javascript
import React, { useCallback } from "react";
import { useClearResumableStore } from "@rpldy/tus-uploady"; 

const MyComponent = () => {
	const clearResumables = useClearResumableStore();
    
    const onClear = useCallback(() => {
      clearResumables();
    }, [clearResumables]);

    return <button onClick={onClear}>Clear Store</button>;
}; 
``` 

## Example

```javascript
 import React from "react";
 import TusUploady from "@rpldy/tus-uploady";
 import UploadButton from "@rpldy/upload-button";
 
 const App = () => (<TusUploady
     destination={{ url: "https://my-tus-server/upload" }}
     chunkSize={2142880}
     sendDataOnCreate>
     <UploadButton/>
 </TusUploady>);
 
 ```
