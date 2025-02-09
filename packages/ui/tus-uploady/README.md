<a href="https://badge.fury.io/js/%40rpldy%2Ftus-uploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Ftus-uploady.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/tus-uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/tus-uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/tus-uploady--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Tus Uploady

This package is provided as a convenient alternative to the main [Uploady](https://react-uploady.org/docs/api/) package. 
To be used in case resumable (tus) upload is required.

The package wraps the [tus-sender](https://react-uploady.org/docs/packages/rpldy-tus-sender/) 

Additional information about tus functionality can be found at the [tus-sender API doc](https://react-uploady.org/docs/api/enhancers/getTusEnhancer/).

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav"> 
        <img width="700" alt="uploady-buy-me-coffee" src="https://github.com/user-attachments/assets/3a22cd82-94f8-4b79-8b1b-c783be5ecb88">
    </a>
</p>


## Installation

```shell
#Yarn:
  $ yarn add @rpldy/tus-uploady

#NPM:
  $ npm i @rpldy/tus-uploady
``` 

## Props

| Name (* = mandatory)        | Type                      | Default             | Description                                                                                                            |
|-----------------------------|---------------------------|---------------------|------------------------------------------------------------------------------------------------------------------------|
| version                     | string                    | "1.0.0"             | The tus server version                                                                                                 |
| featureDetection            | boolean                   | false               | whether to query the server for supported extensions                                                                   |
| featureDetectionUrl         | string                    | null                | URL to query for TUS server feature detection, in case it's different from upload URL                                  |
| onFeaturesDetected          | (string[]) => ?TusOptions | void                | callback to handle the extensions the server broadcasts                                                                |
| resume                      | boolean                   | true                | whether to store information locally on files being uploaded to support resuming                                       |
| deferLength                 | boolean                   | false               | defer sending file length to server ([protocol](https://tus.io/protocols/resumable-upload.html#upload-defer-length))   |
| overrideMethod              | boolean                   | false               | whether to use X-HTTP-Method-Override header instead of PATCH                                                          |
| sendDataOnCreate            | boolean                   | false               | send first chunk with create request ([protocol](https://tus.io/protocols/resumable-upload.html#creation-with-upload)) |
| storagePrefix               | string                    | "\_\_rpldy-tus\_\_" | the key prefix to use for persisting resumable info about files                                                        |
| lockedRetryDelay            | number                    | 2000                | milliseconds to wait before retrying a locked (423) resumable file                                                     |
| forgetOnSuccess             | boolean                   | false               | whether to remove URL from localStorage when upload finishes successfully                                              |
| ignoreModifiedDateInStorage | boolean                   | false               | ignore File's modified date when creating key for storage                                                              |
| resumeHeaders               | Record<string, string>    | null                | Headers to use for the resume check (HEAD) request                                                                     |

In addition, all [UploadOptions](https://react-uploady.org/docs/api/types/#uploadoptions) props can be passed to TusUploady.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](https://react-uploady.org/docs/api/#props) for detailed list of upload options.   

> All of the [chunked-sender options](https://react-uploady.org/docs/api/senders/chunkedSender/#options) are supported as well

> Params prop that is set on the Destination or upload options is serialized (encoded according to Tus protocol) and sent as the value of the Upload-Metadata header.

> Custom headers set on the Destination will be sent (and override existing headers) with the Creation request


## TUS Protocol

On top of the Core Protocol, Uploady supports the following extensions:

- [Creation](https://tus.io/protocols/resumable-upload.html#creation) (creation)
- [Creation with Upload](https://tus.io/protocols/resumable-upload.html#creation-with-upload) (creation-with-upload)
- [Concatenation](https://tus.io/protocols/resumable-upload.html#concatenation) (concatenation)
- [Creation Defer Length](https://tus.io/protocols/resumable-upload.html#upload-defer-length) (creation-defer-length)

It also supports the __Upload-Metadata__ header and will turn the destination __params__ prop into the metadata key/value.

## Hooks

### useTusResumeStartListener

Called before the (HEAD) request is issued on behalf of a potentially resumeable upload.

> This event is _[cancellable](https://react-uploady.org/docs/api/events/#cancellable-events)_

Receives an object with:

- url: the URL the resume request will be sent to
- item: the BatchItem being sent
- resumeHeaders: an optional object that was passed to the TusUploady props

May return `false` to cancel the resume, nothing, or an [object](https://react-uploady.org/docs/api/types/#tusresumestarteventresponse) with `url` property to overwrite the URL the request will be sent to.
And/Or a `resumeHeaders` object that will be merged with the optional object passed as a prop to TusUploady.

```javascript
import React from "react";
import { useTusResumeStartListener } from "@rpldy/tus-uploady";

const MyComponent = () => {
    useTusResumeStartListener(({ url, item, resumeHeaders }) => {
        return cancelResume ? false : {
            resumeHeaders: {
                "x-another-header": "foo",
                "x-test-override": "def"
            }
        }
    });

	//...
};

```

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
