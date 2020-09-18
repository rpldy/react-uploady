<a href="https://badge.fury.io/js/%40rpldy%2Fupload-button">
    <img src="https://badge.fury.io/js/%40rpldy%2Fupload-button.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/upload-button">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/upload-button" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/upload-button--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Upload Button

Upload button component and asUploadButton HOC

Initiate file upload by opening the browser's native file selection dialog.

Buttons can use different configuration overrides that supersede the options passed to the parent Uploady. 

> Note: Some options cannot be overriden by the button. For example, any prop that influences the file input directly (such as '_multiple_')

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/upload-button 

#NPM:
   $ npm i @rpldy/uploady @rpldy/upload-button 
``` 

## Props

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | -------------
| id             | string            | undefined | id attribute to pass to the button element
| text           | string            | "Upload"  | the button text (in case no children passed)
| className      | string            | undefined | the class attribute to pass to the button element
| children       | React.Node        | undefined | child element(s) to render inside the button (replaces text)
| extraProps     | Object            | undefined | any other props to pass to the button component (with spread)
| ref            | React ref         | undefined | will be passed to the button element to acquire a ref
| onClick        | EventHandler      | undefined | function to handle button click (called after showing the system's file selection dialog)

In addition, most [UploadOptions](../../core/shared/src/types.js#L104) props can be passed to UploadButton.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](../uploady#props) for detailed list of upload options.

The following [guide](../../../guides/DifferentConfiguration.md) shows how different upload buttons may use different upload options.

## Example

### Simple Upload Button

This examples shows how you add Uploady and UploadButton to your app.
This is all it takes to get file uploading to work in your React app.

```javascript 
import React from "react";
import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const App = () => (<Uploady
    destination={{ url: "https://my-server/upload" }}>
    <UploadButton/>
</Uploady>);

```

### Custom Upload Button (asUploadButton)

In case you want to use your own component as the upload trigger, use the asUploadButton HOC:

```javascript
import React, { forwardRef } from "react";
import Uploady from "@rpldy/uploady";
import { asUploadButton } from "@rpldy/upload-button";

const DivUploadButton = asUploadButton(forwardRef(
    (props, ref) =>
        <div {...props} style={{ cursor: "pointer" }}>
            DIV Upload Button
        </div>
));

const App = () => (<Uploady
    destination={{ url: "https://my-server/upload" }}>
    <DivUploadButton/>
</Uploady>);

```

> Note: _asUploadButton_ makes it possible to gain access to the underlying component with a [ref](https://reactjs.org/docs/refs-and-the-dom.html).
  To support this, it passes along a ref to the component you provide it. For functional components, 
  you'd need to wrap your component with [React.forwardRef](https://reactjs.org/docs/react-api.html#reactforwardref).