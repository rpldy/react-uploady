
<!--
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
-->

# TUS Sender

An Uploady sender implementation of the TUS protocol.

supports version 1.0.0 of the [TUS protocol](https://tus.io/protocols/resumable-upload.html)

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

## Options


## Feature Detection

will request extensions from server

by default will turn off options that the server doesnt support

- KNOWN_EXTENSIONS.CONCATENATION - parallel

- CREATION_WITH_UPLOAD - sendDataOnCreate

- CREATION_DEFER_LENGTH - deferLength

unless onFeaturesDetected option is provided - then its up to you to handle the options (turn on/off)
the object returned by the onFeaturesDetected callback will be merged into the existing options 

For this to work when the TUS server is served from a different origin than the page making the request, 
the server must allow these headers: __Tus-Extension__ and __Tus-Version__ to be read over CORS. Otherwise, it will not work and feature detection will be skipped.

## Example