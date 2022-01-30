
<!--
<a href="https://badge.fury.io/js/%40rpldy%2Ftus-sender">
    <img src="https://badge.fury.io/js/%40rpldy%2Ftus-sender.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/tus-sender">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/tus-sender" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/tus-sender--with-tus-sender">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 
-->

# TUS Sender

An Uploady sender implementation of the TUS protocol.

Supports version 1.0.0 of the [TUS protocol](https://tus.io/protocols/resumable-upload.html)

Under the hood, the tus-sender uses the [@rpldy/chunked-sender](../chunked-sender) to upload the files as chunks 

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.netlify.app)**

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/tus-sender

#NPM:
  $ npm i @rpldy/tus-sender
``` 

## TUS Protocol

On top of the Core Protocol, Uploady supports the following extensions:

- [Creation](https://tus.io/protocols/resumable-upload.html#creation) (creation)
- [Creation with Upload](https://tus.io/protocols/resumable-upload.html#creation-with-upload) (creation-with-upload)
- [Concatenation](https://tus.io/protocols/resumable-upload.html#concatenation) (concatenation)
- [Creation Defer Length](https://tus.io/protocols/resumable-upload.html#upload-defer-length) (creation-defer-length)

It also supports the __Upload-Metadata__ header and will turn the destination/upload options __params__ prop into the metadata key/value.

## Options

| Name (* = mandatory) | Type          | Default       | Description  |
| --------------       | ------------- | ------------- | ------------|
| version           | string    | "1.0.0" | The tus server version|
| featureDetection | boolean    | false | whether to query the server for supported extensions|
| featureDetectionUrl | string | null | URL to query for TUS server feature detection, in case it's different from upload URL|
| onFeaturesDetected  | (string[]) => ?TusOptions | void | callback to handle the extensions the server broadcasts|
| resume    |   boolean     | true | whether to store information locally on files being uploaded to support resuming|
| deferLength | boolean | false | defer sending file length to server ([protocol](https://tus.io/protocols/resumable-upload.html#upload-defer-length))|
| overrideMethod | boolean | false | whether to use X-HTTP-Method-Override header instead of PATCH|
| sendDataOnCreate | boolean | false | send first chunk with create request ([protocol](https://tus.io/protocols/resumable-upload.html#creation-with-upload))|
| storagePrefix | string | "__rpldy-tus__" | the key prefix to use for persisting resumable info about files|
| lockedRetryDelay | number | 2000 | milliseconds to wait before retrying a locked (423) resumable file|
| forgetOnSuccess   | boolean | false | whether to remove URL from localStorage when upload finishes successfully|
| ignoreModifiedDateInStorage   | boolean   | false     | ignore File's modified date when creating key for storage|

> All of the [chunked-sender options](../chunked-sender#options) are supported with this sender

> When the chunked-sender parallel param is set to > 1, the Concatenation tus extension will be used.
>It will send the chunks as different parallel requests that are finalized once done.

> Params prop that is set on the Destination or upload options is serialized (encoded according to Tus protocol) and sent as the value of the Upload-Metadata header.

> Custom headers set on the Destination will be sent (and override existing headers) with the Creation request      

## Feature Detection

When the featureDetection option is enabled, the tus-sender will request the supported extensions' info from the server.

In case there are options that aren't supported by the extensions list the server provides, 
they will be turned off.

These options are:

- parallel: requiring the _concatenation_ extension
- sendDataOnCreate: requiring the _creation_with_upload_ extension
- deferLength: requiring the _creation_defer_length_ extension

When _onFeaturesDetected_ callback is provided, the responsibility to turn off options that aren't supported
is handed over to the callback. The object returned by the callback will be merged with options being used, overriding them as needed.

> For feature detection to work, when the TUS server is served from a different origin than the page making the request, 
the server must allow these headers: __Tus-Extension__ and __Tus-Version__ to be read over CORS. 
>Otherwise, it will not work and feature detection will be skipped.

## Example

```javascript
import React, { useCallback, useEffect, useRef } from "react";
import createUploader from "@rpldy/uploader";
import getTusEnhancer from "@rpldy/tus-sender";

export const App = () => {
	const inputRef = useRef(null);
	const uploaderRef = useRef(null);

	useEffect(() => {
		const tusEnhancer = getTusEnhancer({
            parallel: 2,                
		});

		uploaderRef.current = createUploader({
			enhancer: tusEnhancer,
			destination: {url: "my-tus-server.com"},
			params: {
				source: "rpldy",		
			}
		});
	}, []);

	const onClick = useCallback(() => {
		const input = inputRef.current;
		if (input) {
			input.value = "";
			input.click();
		}
	}, []);

	const onInputChange = useCallback(() => {
		uploaderRef.current?.add(inputRef.current?.files);
	}, []);

	return <div>
		<input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
		<button id="upload-button" onClick={onClick}>Upload with TUS</button>
	</div>
};

```