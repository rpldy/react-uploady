
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


## Example