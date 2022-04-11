<a href="https://badge.fury.io/js/%40rpldy%2Fupload-drop-zone">
    <img src="https://badge.fury.io/js/%40rpldy%2Fupload-drop-zone.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/upload-drop-zone">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/upload-drop-zone" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/upload-drop-zone--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Upload Drop Zone

Drop zone (container) component to initiate file and folder content uploads
Supports individual files as well as recursively iterating over a dropped directory to upload its contents.
 
Uses [html-dir-content](https://www.npmjs.com/package/html-dir-content) to process the files/directories in the dnd events ([DataTransferItem](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem)). 

Can easily be combined with other D&D solutions. 

Drop Zones can use different configuration overrides that supersede the options passed to the parent Uploady. 

> Note: Some options cannot be overriden by the button. For example, any prop that influences the file input directly (such as '_multiple_')

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.netlify.app)**

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/upload-drop-zone 

#NPM:
   $ npm i @rpldy/uploady @rpldy/upload-drop-zone 
``` 

## Props

| Name (* = mandatory) | Type                                           | Default       | Description                                                                                              |
|----------------------|------------------------------------------------| ------------- |----------------------------------------------------------------------------------------------------------|
| id                   | string                                         | undefined | id attribute to pass to the container element                                                            |
| className            | string                                         | undefined | the class attribute to pass to the container element                                                     |
| onDragOverClassName  | string                                         | undefined | class name to add to the container when dragged over                                                     |
| dropHandler          | [DropHandlerMethod](src/types.js#L4)           | undefined | override default handler that returns the drop result (ex: files). May return a promise                  | 
| htmlDirContentParams | Object                                         | undefined | will be passed as is to html-dir-content. See [docs](https://www.npmjs.com/package/html-dir-content#api) |
| shouldRemoveDragOver | [ShouldRemoveDragOverMethod](src/types.js#L6)  | undefined | callback to help identify when to remove the onDragOverClassName. Receives the dragleave event           |
| children             | React.Node                                     | undefined | child element(s) to render inside the container                                                          |
| extraProps           | Object                                         | undefined | any other props to pass to the div component (with spread)                                               |

In addition, most [UploadOptions](../../core/shared/src/types.js#L104) props can be passed to UploadDropZone.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](../uploady#props) for detailed list of upload options.

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