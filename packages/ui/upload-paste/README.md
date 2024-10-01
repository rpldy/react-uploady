<a href="https://badge.fury.io/js/%40rpldy%2Fupload-paste">
    <img src="https://badge.fury.io/js/%40rpldy%2Fupload-paste.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/upload-paste">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/upload-paste" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/upload-paste--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Upload Paste

The main feature is the `withPasteUpload` HOC, which allows any component to become a trigger of paste-to-upload.
A user pasting (ctrl/cmd+v) a file or files while focused on the element will trigger an upload 

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav"> 
        <img width="700" alt="uploady-buy-me-coffee" src="https://github.com/rpldy/react-uploady/assets/1102278/c6de6710-1c93-47a5-85fa-1af7170907f8">
    </a>
</p>

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/upload-paste 

#NPM:
   $ npm i @rpldy/uploady @rpldy/upload-paste   
``` 

## withPasteUpload

_withPasteUpload(ComponentType<any>) => React.FC<PasteProps>_

### PasteProps

| Name (* = mandatory) | Type          | Default       | Description|
| --------------       | ------------- | ------------- | -------------|
| id             | string            | undefined | id attribute to pass to the button element|
| className      | string            | undefined | the class attribute to pass to the button element|
| children       | React.Node        | undefined | child element(s) to render inside the button (replaces text)|
| extraProps     | Object            | undefined | any other props to pass to the wrapped component (with spread)|
| ref            | React ref         | undefined | will be passed to the button element to acquire a ref|
| onPasteUpload  | [PasteUploadHandler](src/types.js#L8) | undefined | function called when paste to upload occurs|

In addition, most [UploadOptions](../../core/shared/src/types.js#L104) props can be passed to the component returned from calling withPasteUpload.
In order to override configuration passed to the parent Uploady component.
See [Uploady documentation](../uploady#props) for detailed list of upload options.

## Example

```javascript
import React from "react";
import styled from "styled-components";
import Uploady from "@rpldy/uploady";
import withPasteUpload from "@rpldy/upload-paste";

const SimpleContainer = styled.div`   
    width: 400px;
    height: 400px;   
`;

const PasteArea = withPasteUpload(SimpleContainer);

const MyApp = () => {
    const onPasteUpload = useCallback(({ count }) => {
        console.log("PASTE-TO-UPLOAD file count: ", count);
    }, []);
    
	return <Uploady destination={{ url: "my-server.com/upload" }}>
        <PasteArea onPasteUpload={onPasteUpload} autoUpload={false}>
            Paste file here to upload
        </PasteArea>
    </Uploady>;
};
```

## Hooks

### usePasteUpload

_(uploadOptions: UploadOptions, element: React.RefObject<HTMLHtmlElement>, onPasteUpload: PasteUploadHandler) =>
{ toggle: () => boolean, getIsEnabled: () => boolean }_

The hook makes it possible to enable paste listening for file(s) on the window (so paste anywhere) or on a specific element (by passing a ref)


```javascript
import React from "react";
import Uploady from "@rpldy/uploady";
import { usePasteUpload } from "@rpldy/upload-paste";

const ElementPaste = (props) => {
    const containerRef = useRef(null);

    const onPasteUpload = useCallback(({ count }) => {
        console.log("ELEMENT PASTE-TO-UPLOAD files: ", count);
    }, []);

    const { toggle, getIsEnabled } = usePasteUpload(props, containerRef, onPasteUpload);

    //toggle can be used in a button click handler to turn paste listening on/off
    
    return <>
        <div ref={containerRef}>
            Click here & Paste a file
            Paste is: {getIsEnabled() ? "enabled" : "disabled"}
        </div>
    </>;
};


const MyApp = () => {
    return <Uploady destination={{ url: "my-server.com/upload" }}>
        <ElementPaste autoUpload={false} params={{ test: "paste" }}/>
    </Uploady>;
};
```