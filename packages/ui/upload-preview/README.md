<a href="https://badge.fury.io/js/%40rpldy%2Fupload-preview">
    <img src="https://badge.fury.io/js/%40rpldy%2Fupload-preview.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/upload-preview">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/upload-preview" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/upload-preview--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Upload Preview

Preview component to show image or video being uploaded.

By default, will present a preview of the file being uploaded in case its an image or video.
 
## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/upload-preview 

#NPM:
   $ npm i @rpldy/uploady @rpldy/upload-preview 
``` 

## Props

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | -------------
| loadFirstOnly        | boolean       | false         | load preview only for the first item in a batch
| maxPreviewImageSize  | number        | 2e+7          | maximum size of image to preview
| maxPreviewVideoSize  | number        | 1e+8          | maximum size of video to preview
| fallbackUrl          | string &#124; [FallbackMethod](src/types.js#L16) | undefined | static URL or function that returns fallback in case failed to load preview or when file over max size
| imageMimeTypes       | string[]      | [see list below](#default-image-types) | image mime types to load preview for
| videoMimeTypes       | string[]      | [see list below](#default-video-types) | video mime types to load preview for
| previewComponentProps | [PreviewComponentPropsOrMethod](src/types.js#L18) | undefined | object or function to generate object as additional props for the preview component
| PreviewComponent      | React.ComponentType<any> | img &#124; video | The component that will show the preview
 
## Example

```javascript

import React from "react";
import Uploady from "@rpldy/uploady";
import UploadPreview from "@rpldy/upload-preview";

export const App = () => (
     <Uploady>
      
        <UploadPreview
            fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"/>
    </Uploady>
);
```

For an example of using a custom preview component see [this story](http://localhost:9111/?path=/story/upload-preview--with-progress). 

## Default image types

- "image/jpeg"
- "image/webp"
- "image/gif"
- "image/png"
- "image/apng"
- "image/bmp"
- "image/x-icon"
- "image/svg+xml"

## Default video types 

- "video/mp4"
- "video/webm"
- "video/ogg"