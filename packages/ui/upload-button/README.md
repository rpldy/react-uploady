# Upload Button

Upload button component and asUploadButton HOC

Initiate file upload by opening the browser's native file selection dialog.

Buttons can use different configuration overrides that supersede the options passed to the parent Uploady. 

> Note: Some options cannot be overriden by the button. For example, any props that influence the file input directly (such as '_multiple_')

## Installation

```shell

   $ yarn add @rpldy/uploady @rpldy/upload-button 
```
>   

Or 

```shell

   $ npm i @rpldy/uploady @rpldy/upload-button 
```

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

import React from "react";
import Uploady from "@rpldy/uploady";
import { asUploadButton } from "@rpldy/upload-button";

const DivUploadButton = asUploadButton((props) => {
    return <div {...props} style={{ cursor: "pointer" }}>
        DIV Upload Button
    </div>
});

const App = () => (<Uploady
    destination={{ url: "https://my-server/upload" }}>
    <DivUploadButton/>
</Uploady>);

```

## Props

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | -------------
| id             | string   | undefined | id attribute to pass to the button element
| text           | string   | "Upload"  | the button text (in case no children passed)
| className      | string   | undefined | the class attribute to pass to the button element
| children       | React.Node | undefined | child element(s) to render inside the button (replaces text)
| extraProps     | Object   | undefined | any other props to pass to the button component (with spread)
| ref            | React ref | undefined will be passed to the button element to acquire a ref

In addition, most [UploadOptions](../../shared/src/types.js#L104) props can be passed to UploadButton.
In order to override configuration passed to the parent Uploady component. 
See [Uploady documentation](../uploady#props) for detailed list of upload options.

The following [guide](../../../guides/DifferentConfiguration.md) shows how different upload buttons may use different upload options.