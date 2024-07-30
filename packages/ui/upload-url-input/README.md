<a href="https://badge.fury.io/js/%40rpldy%2Fupload-url-input">
    <img src="https://badge.fury.io/js/%40rpldy%2Fupload-url-input.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/upload-url-input">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/upload-url-input" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/upload-url-input--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Upload URL Input

Input component to enter a URL (or any string for that matter) that will be sent as an upload.

This can be useful for services that accept a URL and do server-side fetch. [Cloudinary](https://cloudinary.com) is such a service.

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav"> 
        <img width="540" alt="uploady-buy-me-coffee" src="https://github.com/rpldy/react-uploady/assets/1102278/c6de6710-1c93-47a5-85fa-1af7170907f8">
    </a>
</p>

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/upload-url-input

#NPM:
   $ npm i @rpldy/uploady @rpldy/upload-url-input
``` 

## Props


| Name (* = mandatory) | Type          | Default       | Description                                                                                                |
| --------------       | ------------- | ------------- |------------------------------------------------------------------------------------------------------------|
| id             | string   | undefined | id attribute to pass to the button element                                                                 |
| className      | string   | undefined | the class attribute to pass to the button element                                                          |
| placeholder    | string    | undefined | input's placeholder text                                                                                   |
| validate       | [ValidateMethod](src/types.js#L6) | undefined | function to validate input's value before its sent                                                         |
| uploadRef     | React Ref   | undefined | ref will be set to the upload callback so it can be triggered from the outs ide (see [example](#example))  |
| ignoreKeyPress   | boolean | false | by default pressing Enter will initiate the upload, set to true in order to disable this behavior          |

In addition, most [UploadOptions](../../core/shared/src/types.js#L104) props can be passed to UploadButton.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](../uploady#props) for detailed list of upload options.

## Example

```javascript
import React, { useRef } from "react";
import Uploady from "@rpldy/uploady";
import UploadUrlInput from "@rpldy/upload-url-input";

const MyUrlUpload = () => {
    const uploadRef = useRef(null);

    const onClick = () => {
        if (uploadRef && uploadRef.current) {
            uploadRef.current(); //initiate upload
        }
    };
    
    return <Uploady>
        <UploadUrlInput placeholder="URL to upload"
            uploadRef={uploadRef} />
        
        <button onClick={onClick}>Upload</button>
    </Uploady>;
};
```