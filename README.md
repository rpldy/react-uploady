[![CircleCI](https://circleci.com/gh/yoavniran/react-uploady.svg?style=svg)](https://circleci.com/gh/yoavniran/react-uploady)
[![codecov](https://codecov.io/gh/yoavniran/react-uploady/branch/master/graph/badge.svg)](https://codecov.io/gh/yoavniran/react-uploady)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![license](https://img.shields.io/github/license/yoavniran/react-uploady?color=blue&style=plastic)](https://github.com/yoavniran/react-uploady/blob/master/LICENCE)

<img src="https://res.cloudinary.com/yoav-cloud/image/upload/w_400/v22212321/icons/react-uploady-text-logo.png" width="300" alt='react-uploady Logo' aria-label='react-uploady' />

#

> "Modern file uploader components & hooks for React."

With react-uploady you can achieve file uploading with just a few lines of code.

The philosophy behind this library is that it should be as simple as possible to use, yet customizable at every point. 

react-uploady comes with many components and features. You get to choose which ones you need and only install the dependencies required.

At its simplest configuration it is only: ~XXkb
At its more sophisticated configuration it is still only ~XXkb

XXXX Need animated gif here showing storybook XXXXX

## Documentation

Our __[Storybook](https://react-uploady-storybook.netlify.com/)__ has many examples, both simple and advanced.

Checkout our __[Guides](https://github.com/yoavniran/react-uploady/blob/master/guides/)__ section for useful information


## Installation

react-uploady is a mono-repo and such provides multiple packages with different functionality.

For React appliactions, at the very least, you will need the Uploady provider:

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

* [uploady]() - The context provider for react-uploady. (required)
* [uploader]() - The processing engine (required)

**UI Packages**
* [upload-button]() - 
* [preview]() - 
* [upload-url-input]() -
* [upload-drop-zone]() - 

**Uploaders**
* [chunked-uploader]() - 
* tus-uploader - TODO 

**Shared Packages**

* [shared]() - set of utils+types that all packages require  
* [shared-ui]() - set of utils+types that all UI packages require 
* [live-events]() - provides cancellable pub/sub "events" 


## Size

React Uploady is very small:

(built with webpack lodash plugin)

TODO !!! show table of dependencies and their weight:

uploader

uplodaer + uploady

uploader + uploady + upload-button


## Examples

Our [storybook](https://react-uploady-storybook.netlify.com/) has many examples but here are a few handy ones:

> add examples here




logo's wing thanks to <a href="https://www.vecteezy.com/free-vector/illustration">Illustration Vectors by Vecteezy</a>