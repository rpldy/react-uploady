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

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav"> 
        <img width="540" alt="uploady-buy-me-coffee" src="https://github.com/rpldy/react-uploady/assets/1102278/c6de6710-1c93-47a5-85fa-1af7170907f8">
    </a>
</p>

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/upload-preview 

#NPM:
   $ npm i @rpldy/uploady @rpldy/upload-preview 
``` 

## Props

| Name (* = mandatory)    | Type                                              | Default                                | Description                                                                                            | 
|-------------------------|---------------------------------------------------|----------------------------------------|--------------------------------------------------------------------------------------------------------|
| loadFirstOnly           | boolean                                           | false                                  | load preview only for the first item in a batch                                                        |
| maxPreviewImageSize     | number                                            | 2e+7                                   | maximum size of image to preview                                                                       |
| maxPreviewVideoSize     | number                                            | 1e+8                                   | maximum size of video to preview                                                                       |
| fallbackUrl             | string &#124; [FallbackMethod](src/types.js#L16)  | undefined                              | static URL or function that returns fallback in case failed to load preview or when file over max size |
| imageMimeTypes          | string[]                                          | [see list below](#default-image-types) | image mime types to load preview for                                                                   |
| videoMimeTypes          | string[]                                          | [see list below](#default-video-types) | video mime types to load preview for                                                                   |
| previewComponentProps   | [PreviewComponentPropsOrMethod](src/types.js#L18) | undefined                              | object or function to generate object as additional props for the preview component                    |
| PreviewComponent        | React.ComponentType&lt;any&gt;                    | img &#124; video                       | The component that will show the preview                                                               |
| rememberPreviousBatches | boolean                                           | false                                  | show previous batches' previews as opposed to just the last                                            |
| previewMethodsRef       | React Ref                                         | undefined                              | ref will be set with preview helper [methods](src/types.js#L39)                                        |
| onPreviewsChanged       | (PreviewItem[]) => void                           | undefined                              | callback will be called whenever preview items array changes                                           |

## Usage

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

## Advanced Usage

The props _rememberPreviousBatches_, _previewMethodsRef_, and _onPreviewsChanged_ make it possible to do more with previews.
Specifically, the make it possible to create a visual queue of the uploads.

This is especially useful when adding other features such as abort and [retry](../core/retry-hooks).   

The code below shows how to clear the previews with a button click:

```javascript
import React from "react";
import Uploady, { useAbortItem } from "@rpldy/uploady";
import UploadPreview from "@rpldy/upload-preview";
import UploadButton from "@rpldy/upload-button";

const PreviewsWithClear = () => {
	const abortItem = useAbortItem();
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

	const onRemoveItem = useCallback(() => {
		if (previewMethodsRef.current?.removePreview) {
			abortItem("item-123"); //cancel the upload for the item
            previewMethodsRef.current.removePreview("item-123") //need the item id to remove the preview
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

### previewMethodsRef

```typescript
type PreviewMethods = {
    clear: () => void;
    removePreview: (id: string) => void;
};
```

Provides access to preview related methods:

- `clear` - will reset all items shown in the preview
- `removePreview` - will remove a single item preview

> These methods do not remove the item from the upload queue. ONLY from the preview.


### Custom Preview Component

The Upload Preview can be customized in several ways. The main method is through the _PreviewComponent_ prop.
Passing a custom component will make the preview render your own UI per each file being uploaded.

The custom component is called with the following props

```typescript
type PreviewProps = {
	id: string;
	url: string;
	name: string;
	type: PreviewType;
	isFallback: boolean;
    removePreview: () => void;
};
```

For an example of using a custom preview component see [this story](https://react-uploady-storybook.netlify.app/?path=/story/upload-preview--with-progress). 

### Custom Batch Items Method

The default way the UploadPreview component learns which items to show previews for is done by internally using the [useBatchStartListener](../uploady/README.md#usebatchstartlistener-event-hook) hook.
This means that for a batch that hasn't started uploading, because a previous batch hasn't finished or when `autoUpload = false`, the previews for the next batch will not be shown.

If there's a different event (or one completely custom) you want to listen to, for example: the [useBatchAddListener](../uploady/README.md#usebatchaddlistener-event-hook) hook, you can do that with `getUploadPreviewForBatchItemsMethod`.
With useBatchAddListener, the previews will be shown even for batches that hadn't started to upload yet.

This method expects a hook method as a parameter that will return a [batch](../../../README.md#batch)(-like) object with a `items` property as an array of [BatchItem](../../../README.md#batchitem)s.
It returns a UploadPreview component that will use the custom hook method to learn about the items to preview.

Below is an example of how to use it:

```javascript
import React from "react";
import Uploady, { useBatchAddListener } from "@rpldy/uploady";
import { getUploadPreviewForBatchItemsMethod } from "@rpldy/upload-preview";
import UploadButton from "@rpldy/upload-button";

const MyUploadPreview = getUploadPreviewForBatchItemsMethod(useBatchAddListener);

export const App = () => {
    return (
        <Uploady
            destination={{ url: "[upload-url]" }}
        >
            <div className="App">
                <UploadButton>Upload Files</UploadButton>
                <br />
  
                <MyUploadPreview
                    maxPreviewVideoSize={2}
                    fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
                />
            </div>
        </Uploady>
    );
}

```

### Custom Previews Render

The UploadPreview component allows for a lot of customization by providing your own component to render each single preview.
This is mostly enough since it doesn't render anything else beyond the preview items - no surrounding element/component.

However, in case you wish even more control, you can create your own hook from the batch method you wish to use 
(typically either `useBatchAddListener` or `useBatchStartListener`).

```jsx
import { useBatchAddListener } from "@rpldy/uploady";
import { getPreviewsLoaderHook } from "@rpldy/upload-preview";

const useBatchAddPreviewsData = getPreviewsLoaderHook(useBatchAddListener);

const PreviewDataCustomerViewer = () => {
    const { previews } = useBatchAddPreviewsData({ rememberPreviousBatches: true });

    return previews.map((p) =>
        <div key={p.id}>
            {p.name}
            <img src={p.url}/>
        </div>);
};
```

The hook receives [PreviewOptions](src/types.js#L46) and can also be called without any param.  

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