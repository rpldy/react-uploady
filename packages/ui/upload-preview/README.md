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
| rememberPreviousBatches | boolean | false | show previous batches' previews as opposed to just the last 
| previewMethodsRef     | React Ref   | undefined | ref will be set with preview helper [methods](src/types.js#L29)
| onPreviewsChanged     | (PreviewItem[]) => void | undefined | callback will be called whenever preview items array changes

## Example

```javascript

import React from "react";
import Uploady from "@rpldy/uploady";
import UploadPreview from "@rpldy/upload-preview";

export const App = () => (
     <Uploady destination={{ url: "my-server.com/upload" }}>     
        <UploadPreview
            fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"/>
    </Uploady>
);
```

### Advanced Usage

_The props _rememberPreviousBatches_, _previewMethodsRef_, and _onPreviewsChanged_ make it possible to do more with previews.
Specifically, the make it possible to create a visual queue of the uploads.

This is especially useful when adding other features such as abort and [retry](../core/retry-hooks).   

The code below shows how to clear the previews with a button click:

```javascript
import React from "react";
import Uploady from "@rpldy/uploady";
import UploadPreview from "@rpldy/upload-preview";
import UploadButton from "@rpldy/upload-button";

const PreviewsWithClear = () => {
	const previewMethodsRef = useRef();
	const [previews, setPreviews] = useState([]);

	const onPreviewsChanged = useCallback((previews) => {
		setPreviews(previews);
	}, []);

	const onClear = useCallback(() => {
		if (previewMethodsRef.current?.clear) {
			previewMethodsRef.current.clear();
		}
	}, [previewMethodsRef]);

	return <>
		<button onClick={onClear}>
            Clear {previews.length} previews
        </button>
		<br/>		
        <UploadPreview
            rememberPreviousBatches            
            previewMethodsRef={previewMethodsRef}
            onPreviewsChanged={onPreviewsChanged}
        />            		
	</>;
};

export const App = () => {	
	return <Uploady destination={{ url: "my-server.com/upload" }}>
		<UploadButton />
		<PreviewsWithClear />
	</Uploady>;
};

```

### Custom Preview
 
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