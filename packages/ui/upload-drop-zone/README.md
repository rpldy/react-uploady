<a href="https://badge.fury.io/js/%40rpldy%2Fupload-drop-zone">
    <img src="https://badge.fury.io/js/%40rpldy%2Fupload-drop-zone.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/upload-drop-zone">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/upload-drop-zone" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/upload-drop-zone--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Upload Drop Zone

Drop zone (container) component to initiate file and folder content uploads
Supports individual files as well as recursively iterating over a dropped directory to upload its contents.
 
Uses [html-dir-content](https://www.npmjs.com/package/html-dir-content) to process the files/directories in the DnD events ([DataTransferItem](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem)). 

Can easily be combined with other D&D solutions. 

Drop Zones can use different configuration overrides that supersede the options passed to the parent Uploady. 

> Note: Some options cannot be overriden by the button. For example, any prop that influences the file input directly (such as '_multiple_')

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav"> 
        <img width="700" alt="uploady-buy-me-coffee" src="https://github.com/user-attachments/assets/3a22cd82-94f8-4b79-8b1b-c783be5ecb88">
    </a>
</p>

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/upload-drop-zone 

#NPM:
   $ npm i @rpldy/uploady @rpldy/upload-drop-zone 
``` 

## Props

| Name (* = mandatory)  | Type                                                                                                                | Default   | Description                                                                                              |
|-----------------------|---------------------------------------------------------------------------------------------------------------------|-----------|----------------------------------------------------------------------------------------------------------|
| id                    | string                                                                                                              | undefined | id attribute to pass to the container element                                                            |
| className             | string                                                                                                              | undefined | the class attribute to pass to the container element                                                     |
| onDragOverClassName   | string                                                                                                              | undefined | class name to add to the container when dragged over                                                     |
| dropHandler           | [DropHandlerMethod](https://react-uploady.org/docs/api/components/uploadDropZone/#dropHandler)                      | undefined | override default handler that returns the drop result (ex: files). May return a promise                  | 
| htmlDirContentParams  | Object                                                                                                              | undefined | will be passed as is to html-dir-content. See [docs](https://www.npmjs.com/package/html-dir-content#api) |
| shouldRemoveDragOver  | [ShouldRemoveDragOverMethod](https://react-uploady.org/docs/api/components/uploadDropZone/#shouldRemoveDragOver)    | undefined | callback to help identify when to remove the onDragOverClassName. Receives the dragleave event           |
| shouldHandleDrag      | boolean or [ShouldHandleDragMethod](https://react-uploady.org/docs/api/components/uploadDropZone/#shouldHandleDrag) | undefined | Whether drag&drop should be handled, either boolean or method returning boolean                          |
| noContainCheckForDrag | boolean                                                                                                             | false     | By default, the component will check if the drag event is inside the container. Set to true to disable   |
| enableOnContains      | boolean                                                                                                             | true      | By default will handle drag-enter for children of the container and not just the container itself        |
| children              | React.Node                                                                                                          | undefined | child element(s) to render inside the container                                                          |
| extraProps            | Object                                                                                                              | undefined | any other props to pass to the div component (with spread)                                               |

In addition, most [UploadOptions](https://react-uploady.org/docs/api/types/#uploadoptions) props can be passed to UploadDropZone.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](https://react-uploady.org/docs/api/#props) for detailed list of upload options.

### shouldHandleDrag

Can be a boolean or a method returning a boolean. In case of a method, the drag event will be provided as a param.

In case shouldHandleDrag === false, the drag&drop flow will not be handled by this component. 
In case you want to enable logic to determine whether drag&drop will be enabled, pass a callback for this prop. 
Returning a _Falsy_ value will disable DnD, returning _Truthy_ will keep it enabled. 

### dropHandler

By default, handles Drop event by calling [getFilesFromDragEvent](https://github.com/yoavniran/html-dir-content/blob/master/README.MD#getfilesfromdragevent) from [html-dir-content](https://www.npmjs.com/package/html-dir-content).

In case you want to provide your own logic that will calculate the items(files) passed to the uploader from the drop event, pass in a custom handler.

You can still get the files as the internal method does, by calling _getFiles_ passed to the custom dropHandler as the second param. 

### shouldRemoveDragOver

Gives more control over when to recognize drag-over is done and indicator should be cleared 

See [further explanation on our doc site](https://react-uploady.org/docs/api/components/uploadDropZone/#shouldRemoveDragOver)

## Example

Simple example, shows how upload options can be passed to the drop-zone (grouped, maxGroupSize).

```javascript

import Uploady from "@rpldy/uploady";
import UploadDropZone from "@rpldy/upload-drop-zone";

const App = () => (
    <Uploady destination={destination}>
        <UploadDropZone onDragOverClassName="drag-over"
                        grouped
                        maxGroupSize={3}
        >
            <span>Drag&Drop File(s) Here</span>            
        </UploadDropZone>
    </Uploady>);
```

See [story](https://react-uploady-storybook.netlify.com/?path=/story/upload-drop-zone--with-third-party-drop-zone) showing how to use a 3rd library: [react-dnd](https://github.com/react-dnd/react-dnd/)
together with _@rpldy/upload-drop-zone_. 
