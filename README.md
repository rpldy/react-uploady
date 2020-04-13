<p align="center">
    <img src="https://res.cloudinary.com/yoav-cloud/image/upload/w_400/v22212321/icons/react-uploady-text-logo.png" width="300" alt='react-uploady Logo' aria-label='react-uploady' />
</p>

<p align="center">

[![CircleCI](https://circleci.com/gh/yoavniran/react-uploady.svg?style=svg)](https://circleci.com/gh/yoavniran/react-uploady)
[![codecov](https://codecov.io/gh/yoavniran/react-uploady/branch/master/graph/badge.svg)](https://codecov.io/gh/yoavniran/react-uploady)
[![Storybook](https://cdn.jsdelivr.net/gh/storybookjs/yoavniran@react-uploady/badge/badge-storybook.svg)](https://react-uploady-storybook.netlify.com/)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![license](https://img.shields.io/github/license/yoavniran/react-uploady?color=blue&style=plastic)](https://github.com/yoavniran/react-uploady/blob/master/LICENCE)

</p>

## Intro

> "Modern file-upload components & hooks for React."

With React-Uploady you can build (client-side) file-upload features with just a few lines of code.

The philosophy behind this library is that it should be as simple as possible to use, yet customizable at every point. 

RU comes with many components and features. 
You get to choose which ones you need and only install the dependencies required (See [Packages](#packages) details below)

RU has a small footprint (by design):

| Bundle         | Minified size | GZipped size
| -------------- | ------------- | -------------
| core                         | 34.4KB          | 9.7KB
| core + ui                    | 44.6KB          | 11.8KB
| core + ui + chunked support  | 55.4KB          | 14.4KB
| everything                   | 62.7KB          | 15.7KB

## Documentation

Our __[Storybook](https://react-uploady-storybook.netlify.com/)__ has many examples, both simple and advanced.

<!--TODO XXXX Need animated gif here showing storybook XXXXX-->


Checkout our __[Guides](guides)__ section for additional examples & information

## Installation

react-uploady is a mono-repo, and as such provides multiple packages with different functionality.

For React applications, at the very least, you will need the Uploady provider:

> yarn add @rpldy/uploady

Or

> npm i @rpldy/uploady

If you wish to use the uploading mechanism (no UI), at the very least, you will need the Uploader:

> yarn add @rpldy/uploader

Or

> npm i @rpldy/uploader


After that, you can add additional packages as needed. See below for more details.

## Packages

**Base Packages**

* [@rpldy/uploader](packages/uploader) - The processing and queuing engine
* [@rpldy/uploady](packages/ui/uploady) - The context provider for react-uploady and hooks (lots of hooks)

**UI Packages**
* [@rpldy/upload-button](packages/ui/upload-button) - Upload button component and asUploadButton HOC  
* [@rpldy/upload-preview](packages/ui/upload-preview) - Image preview component for files being uploaded 
* [@rpldy/upload-url-input](packages/ui/upload-url-input) - Input component to send URL as upload info (ex: [Cloudinary](https://cloudinary.com/documentation/upload_images#auto_fetching_remote_images))
* [@rpldy/upload-drop-zone](packages/ui/upload-drop-zone) - (Drag&)Drop zone to upload files and folder content
* @rpldy/crop - TDOO

**Uploaders**
* [@rpldy/chunked-uploady](packages/ui/chunked-uploady) - Wrapper for Uploady to support chunked uploads
* @rpldy/tus - TODO 

**Extra**
* [@rpldy/retry](packages/retry) - Add support for retrying failed uploads

**Shared Packages**

* [@rpldy/shared](packages/shared) - Internal set of utils+types that all packages require  
* [@rpldy/shared-ui](packages/ui/shared) - Internal set of utils+types that all UI packages require 
* [@rpldy/live-events](packages/life-events) - provides **cancellable** pub/sub "events" 


## Examples

Our [storybook](https://react-uploady-storybook.netlify.com/) has many examples but here are a few handy ones:

### Simple Upload Button

### Custom Upload Button

### Progress Hook

### Add support for Chunked Uploads


> See more (advanced) examples in our [guides](guides).

## UMD Bundles

React-uploady is also available on CDNs such as [unpkg.com](https://unpkg.com) and [jsdelivr.com](https://www.jsdelivr.com/)

<!-- TOOD: add urls here -->

See [this guide](guides/UMD.md) for more information on how to use.

## Credits

logo's wing thanks to <a href="https://www.vecteezy.com/free-vector/illustration">Illustration Vectors by Vecteezy</a>