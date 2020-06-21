<p align="center">
    <img src="https://res.cloudinary.com/yoav-cloud/image/upload/w_400/v22212321/rpldy/logo/react-uploady-text-logo.png" width="300" alt='react-uploady Logo' aria-label='react-uploady' />   
</p>

<p align="center">Modern file-upload components & hooks for React.</p>

<p align="center">
    <a href="https://circleci.com/gh/rpldy/react-uploady">
        <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/>
    </a>  
    <a href="https://codecov.io/gh/rpldy/react-uploady">
      <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/>
    </a>
    <a href="https://react-uploady-storybook.netlify.com">
       <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/>
    </a>  
    <a href="https://lerna.js.org/">
       <img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="lerna"/>
    </a>
    <a href="LICENSE.md">
       <img src="https://img.shields.io/github/license/rpldy/react-uploady?color=blue&style=plastic" alt="MIT License"/>
    </a>
    <a href="CODE_OF_CONDUCT.md">
       <img src="https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg"/> 
    </a>    
</p>

<details>
    <summary>Contents</summary>
    
* [Intro](#intro)
* [Documentation](#documentation)
* [Installation](#installation)
* [Packages](#packages)
* [Examples](#examples)
* [Important Concepts](#important-concepts)
* [Resumable Uploads](#resumable-uploads)
* [UMD Bundles](#umd-bundles)
* [Acknowledgements](#acknowledgements)   
</details>

## Intro

<p align="center">
    React-Uploady is a lightweight library - enabling you to build (client-side) file-upload features with just a few lines of code.
    RU provides the foundations needed to upload files from the browser - The rest is up to you.
</p>

![React-Uploady Demo](guides/rpldy-demo.gif)

The philosophy behind this library is that it should be as simple as possible to use, yet customizable at every point.
You can start simple or you can can configure just about every aspect of the upload flow. 
For this purpose, RU provides components, hooks, and plenty of features. 
You get to choose which ones you need and only install the dependencies required (See [Packages](#packages) details below)

RU has a small footprint (by design) with very few (and small) dependencies.

| Bundle         | Minified size | GZipped size
| -------------- | ------------- | -------------
| core                         | 35.1KB          | 9.9KB
| core + ui                    | 45.9KB          | 12.2KB
| core + ui + chunked support  | 56.8KB          | 14.8KB
| everything                   | 64.7KB          | 16.2KB

## Documentation

**Getting Started**

We recommend checking out the [Uploady](packages/ui/uploady) README first to understand how to configure your uploads
and how to access upload data (using the provided hooks or events).

It's also worth reading the  [Important Concepts](#important-concepts) section below for some key concepts.

In case you need UI components (like an upload button), check out any of our [UI packages](#ui-packages).

**Additional Resources**

Our __[Storybook](https://react-uploady-storybook.netlify.com/)__ has many examples, both simple and advanced.

Checkout our __[Guides](guides)__ section for additional examples & information.

### Changelog

For a list of versions and changes see the [CHANGELOG](CHANGELOG.md)

## Installation

React-uploady is a mono-repo, and as such provides multiple packages with different functionality.

For React applications, at the very least, you will need the Uploady provider:

```shell
#Yarn: 
   $ yarn add @rpldy/uploady

#NPM:
   $ npm i @rpldy/uploady
``` 

If you wish to use the uploading mechanism (no UI), at the very least, you will need the Uploader:

```shell
#Yarn:
  $ yarn add @rpldy/uploader

#NPM:
  $ npm i @rpldy/uploader
```

After that, you can add additional packages as needed. See below for more details.

## Packages

### Main Packages
* [@rpldy/uploader](packages/uploader) - The processing and queuing engine
* [@rpldy/uploady](packages/ui/uploady) - The context provider for react-uploady and hooks (lots of hooks)

### UI Packages
* [@rpldy/upload-button](packages/ui/upload-button) - Upload button component and asUploadButton HOC  
* [@rpldy/upload-preview](packages/ui/upload-preview) - Image&video preview component for files being uploaded 
* [@rpldy/upload-url-input](packages/ui/upload-url-input) - Input component to send URL as upload info (ex: [Cloudinary](https://cloudinary.com/documentation/upload_images#auto_fetching_remote_images))
* [@rpldy/upload-drop-zone](packages/ui/upload-drop-zone) - (Drag&)Drop zone to upload files and folder content
* [@rpldy/retry-hooks](packages/ui/retry-hooks) - Hooks to interact with the retry mechanism

### Providers
* [@rpldy/chunked-uploady](packages/ui/chunked-uploady) - Wrapper for Uploady with support for chunked uploads
* [@rpldy/tus-uploady](packages/ui/tus-uploady) - Wrapper for Uploady with support for tus(resumable) uploads  

### Senders
* [@rpldy/sender](packages/sender) - XHR sender - Uploady's main file sender. Contains mock sender (for testing purposes)
* [@rpldy/chunked-sender](packages/chunked-sender) - add chunked uploads support on top of the XHR Sender
* [@rpldy/tus-sender](packages/tus-sender) - add TUS resumable upload support  

### Extra
* [@rpldy/retry](packages/retry) - Add support for retrying failed uploads

### Shared Packages
* [@rpldy/shared](packages/shared) - Internal set of utils+types that all packages require  
* [@rpldy/shared-ui](packages/ui/shared) - Internal set of utils+types that all UI packages require 
* [@rpldy/live-events](packages/life-events) - provides **cancellable** pub/sub "events" 
* [@rpldy/safe-storage](packages/safe-storage) - safe (don't throw) versions of local and session storage
* [@rpldy/simple-state](packages/simple-state) - deep proxy object, so it's only updateable through an update method

## Examples

For specific usage, see documentation in the relevant package README file.

For upload options see the [@rpldy/uploady docs](packages/ui/uploady).

### Simple Upload Button

This examples shows how you add Uploady and UploadButton to your app.
This is all it takes to get file uploading to work in your React app.

```javascript 

import React from "react";
import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const App = () => (<Uploady
    destination={{ url: "https://my-server/upload" }}>
    <UploadButton/>
</Uploady>);

```

### Custom Upload Button

In case you want to use your own component as the upload trigger, use the asUploadButton HOC:

```javascript

import React from "react";
import Uploady from "@rpldy/uploady";
import { asUploadButton } from "@rpldy/upload-button";

const DivUploadButton = asUploadButton((props) => {
    return <div {...props} style={{ cursor: "pointer" }}>
        DIV Upload Button
    </div>
});

const App = () => (<Uploady
    destination={{ url: "https://my-server/upload" }}>
    <DivUploadButton/>
</Uploady>);

```

### Progress Hook

```javascript

import React from "react";
import Uploady, { useItemProgressListener } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

//must be rendered inside <Uploady>
const LogProgress = () => {
    useItemProgressListener((item) => {
        console.log(`>>>>> (hook) File ${item.file.name} completed: ${item.completed}`);
    });

    return null;
}

const App = () => (<Uploady
    destination={{ url: "https://my-server/upload" }}>
    <LogProgress/>   
    <UploadButton/>
</Uploady>);

```
### Add support for resumable(tus) uploads

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

### Add support for chunked uploads

Can be used with servers that support chunked uploads

```javascript
import React from "react";
import ChunkedUploady from "@rpldy/chunked-uploady";
import UploadButton from "@rpldy/upload-button";

const App = () => (<ChunkedUploady
    destination={{ url: "https://my-server/upload" }}
    chunkSize={5242880}>
       
    <UploadButton/>
</ChunkedUploady>);

```

> See more (advanced) examples in our [guides](guides) and [storybook](https://react-uploady-storybook.netlify.com/).

## Important Concepts

### Upload Options

These are options that are passed to the [uploader](packages/uploader) to configure aspects of the upload process.
For example, whether files can be grouped in a single request (by default, no).

Upload Options are typically passed to the [Uploady](packages/ui/uploady) instance. But these can be overriden. For example, by an [upload button](packages/ui/upload-button).
Or even during [upload processing](guides/DynamicParameters.md).  

### Destination

Passed as a part of the upload options. It's an object that is used to configure the end-point the files will be uploaded to.
It's type is defined [here](packages/shared/src/types.js#L7).

See more information in the [Uploady](packages/ui/uploady#props) README.

At the very least, a destination should contain a URL property with the server endpoint.

### Enhancer

```javascript

(uploader: UploaderType, trigger: Trigger<mixed>) => UploaderType
``` 

Enhancers are functions that can ehance an uploader instance. They are also passed as part of the options given to the Uploady instance.

As they are applied when the uploader instance is created, they can change the way uploader does things or pass different defaults. 

See this [guide](guides/UploaderEnhancers.md) for more practical information and sample code.

### Batch

When a file or files are handed over to the uploader, they are grouped into a batch. 
This batch will have its all lifetime [events](packages/ui/uploady#events).
A batch can be used to abort the upload of all files inside it. Or can also be retried together (see [@rpldy/retry](packages/retry)).

### BatchItem

Each file (or URL) added to the uploader are wrapped by a BatchItem object. They will have a unique ID within the life-time of the uploader instance.
A BatchItem has its own lifetime [events](packages/ui/uploady#events).

## Resumable Uploads

Rpldy supports resumable uploads through the [tus](https://tus.io/) [protocol](https://tus.io/protocols/resumable-upload.html).
Instead of using <Uploady> from @rpldy/uploady, use <TusUploady> from @rpldy/tus-uploady and you will have resumable upload support on the client side.
Your server will also have to support the same protocol for this to work of course.

See the  [@rpldy/tus-uploady](packages/ui/tus-uploady) documentation for more details.


## UMD Bundles

React-uploady is also available on CDNs such as [unpkg.com](https://unpkg.com) and [jsdelivr.com](https://www.jsdelivr.com/)

See this [guide](guides/UMD.md) for more information on how to use.

### jsDelivr

| Bundle                        | URL
| ---------------------------- | ------------- 
| core                         | https://cdn.jsdelivr.net/npm/@rpldy/uploader/umd/rpldy-core.umd.min.js
| core + ui                    | https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/rpldy-ui-core.umd.min.js
| core + ui + chunked support  | https://cdn.jsdelivr.net/npm/@rpldy/chunked-uploady/umd/rpldy-ui-core-chunked.umd.min.js  
| everything                   | https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/rpldy-all.umd.min.js

You will most likely need the polyfill (regenerator & core js) bundle as well (load it first):

- core bundles -> https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/polyfills-bundle.js
- everything bundle -> https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/polyfills-all-bundle.js

### unpkg

| Bundle                        | URL
| ---------------------------- | ------------- 
| core                         | https://unpkg.com/@rpldy/uploader/umd/rpldy-core.umd.min.js
| core + ui                    | https://unpkg.com/@rpldy/uploady/umd/rpldy-ui-core.umd.min.js
| core + ui + chunked support  | https://unpkg.com/@rpldy/chunked-uploady/umd/rpldy-ui-core-chunked.umd.min.js  
| everything                   | https://unpkg.com/@rpldy/uploady/umd/rpldy-all.umd.min.js

You will most likely need the polyfill (regenerator & core js) bundle as well (load it first):

- core bundles -> https://unpkg.com/@rpldy/uploady/umd/polyfills-bundle.js
- everything bundle -> https://unpkg.com/@rpldy/uploady/umd/polyfills-all-bundle.js

> Note that unpkg does a redirect to the latest version in case the URL doesn't already contain it. So don't copy any of the URLs above into your code. 
> Instead, load them in the browser first and then copy the final URL from there (after the redirect).  

## Acknowledgements 

logo's wing thanks to <a href="https://www.vecteezy.com/free-vector/illustration">Illustration Vectors by Vecteezy</a>
