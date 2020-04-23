<a href="https://badge.fury.io/js/%40rpldy%2Fuploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Fuploady.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Uploady

This is the main UI package. Its role is to initialize and expose the [uploader](../../uploader) functionality.
It contains the Provider that all other UI packages rely on.

It provides multiple hooks that enable more advanced features and data for client apps.


## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady

#NPM:
   $ npm i @rpldy/uploady
``` 

## Props

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | -------------
| Uploader Options
| autoUpload           | boolean       | true          | automatically upload files when they are added 
| destination          | [Destination](../../shared/src/types.js#L7)   | undefined     | configure the end-point to upload to
| inputFieldName       | string        | "file"        | name (attribute) of the file input field
| grouped              | boolean       | false         | group multiple files in a single request 
| maxGroupSize         | number        | 5             | maximum of files to group together in a single request 
| formatGroupParamName | (number, string) => string | undefined | determine the upload request field name when more than file is grouped in a single upload
| fileFilter           | (File &#124; string) => boolean | undefined | return false to exclude from batch
| method               | string        | "POST"        | HTTP method in upload request
| params               | Object        | undefined     | collection of params to pass along with the upload
| forceJsonResponse    | boolean       | false         | parse server response as JSON even if no JSON content-type header received            
| withCredentials      | boolean       | false         | set XHR withCredentials to true
| enhancer             | [UploaderEnhancer](../../uploader/src/types.js#L37) | undefined    | uploader [enhancer](../../../README.md#enhancer) function
| concurrent           | boolean       | false          | issue multiple upload requests simultaneously
| maxConcurrent        | number        | 2              | maximum allowed simultaneous requests
| send                 | [SendMethod](../../shared/src/types.js#L100) | @rpldy/sender | how to send files to the server
| Uploady Options
| debug                | boolean        | false | enable console logs from uploady packages
| listeners            | Object        | undefined | map of [event](../../uploader/README.md#events) name and event handler
| customInput          | boolean       | false | whether to use a custom file input (see: [useFileInput](#useFileInput)
| inputFieldContainer  | HTMLElement   | document.body | html element to place the file input element inside
| children             | React.Node    | undefined     | any part of your React app that will require access to the upload flow  (components, hooks, etc.)
| capture              | string        | null          | [input/file#capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture)
| multiple             | boolean       | true          | [input/file#multiple](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple)
| accept               | string        | null          | [input/file#accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept)
| webkitdirectory      | boolean       | false         | [webkitdirectory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)
| fileInputId          | string        | undefined     | the value to use for the internal file input element

## Example

To be able to use one of the [UI Components](../../../README.md#ui-packages) or one of the hooks, you need to wrap them with <Uploady>.
This will give them access to the UploadyContext.

```javascript

import Uploady from "@rpldy/uploady";

const App = () => (<Uploady
    multiple
    grouped
    maxGroupSize={2}
    method="PUT"
    destination={{url: "https://my-server", headers: {"x-custom": "123"}}}>

    <RestOfMyApp/>
</Uploady>)

```


## Context

When working in React, The UploadyContext is the API provider for the uploader mechanism.
It wraps the uploader and exposes everything the app using it needs.

```javascript
import React, { useContext, useCallback } from "react";
import Uploady, { UploadyContext } from "@rpldy/uploady";

const MyComponent = () => { 
    const uploady = useContext(UploadyContext);

    const onClick = useCallback(()=> {
            uploady.showFileUpload();
        });

    return <button onClick={onClick}>Custom Upload Button</button>
}

const App = () => (<Uploady>
    <MyComponent/>
</Uploady>);

```

### UploadyContext API

#### showFileUpload 

_(?UploadOptions) => void_
    
Show the native file selection dialog. Optionally Pass options as a parameter to override options set as props on the <Uploady/> component. 

#### upload 

_(files: UploadInfo | UploadInfo[], addOptions: ?UploadOptions) => void_

Upload file(s). Optionally Pass options as the second parameter to override options set as props on the <Uploady/> component.
    
#### setOptions 

_(UploadOptions) => void_
    
Update the uploader instance with different options than the ones used to initialize
    
#### getOptions 

_() => UploadOptions_

get the current options used by the uploader

#### getExtension 

_(name: any) => ?Object_
    
get an extension registered by that name (through an enhancer)
 
#### abort

_(id?: string) => void_

abort all files being uploaded or a single item by its ID
   
#### abortBatch 

_(id: string) => void_
            
abort a specific batch by its ID

#### on 

_(name: any, cb: EventCallback) => OffMethod_

register for an [event](../../uploader/README.md#events)
 
#### once 

_(name: any, cb: EventCallback) => OffMethod_
 
register once for an [event](../../uploader/README.md#events)
    
#### off

_(name: any, cb?: EventCallback) => void_

unregister from an events

## Hooks

Uploady provides hooks for all [uploader events](../../uploader/README.md#events), as well as a few other useful ones.

### useBatchAddListener (event hook)

Called when a new batch is added.

> This event is _[cancellable](../../uploader/README.md#cancellable-events)_

```javascript
    import { useBatchAddListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchAddListener((batch) => {
            console.log(`batch ${batch.id} was just added with ${batch.items.length} items`);  
        });

        //...    
    };
```

### useBatchStartListener (event hook)

Called when batch items start uploading

> This event is _[cancellable](../../uploader/README.md#cancellable-events)_

```javascript
    import { useBatchStartListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchStartListener((batch) => {
            console.log(`batch ${batch.id} started uploading`);  
        });

        //...    
    };
```

### useBatchProgressListener (event hook)

Called every time progress data is received from the upload request(s)

```javascript
    import { useBatchProgressListener } from "@rpldy/uploady";

   const MyComponent = () => {
        const batch = useBatchProgressListener((batch) => {});
    
        console.log(`batch ${batch.id} is ${batch.completed}% done and ${batch.loaded} bytes uploaded`)

       //...    
   };
``` 
        
### useBatchFinishListener (event hook)

Called when batch items finished uploading 

```javascript
    import { useBatchFinishListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchFinishListener((batch) => {
            console.log(`batch ${batch.id} finished uploading`);  
        });

        //...    
    };
```

### useBatchCancelledListener (event hook)

Called in case batch was cancelled from BATCH_START event handler

```javascript
    import { useBatchCancelledListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchCancelledListener((batch) => {
            console.log(`batch ${batch.id} was cancelled`);  
        });

        //...    
    };
```

### useBatchAbortListener (event hook)

Called in case [abortBatch](#abortBatch) was called

```javascript
    import { useBatchAbortListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchAbortListener((batch) => {
            console.log(`batch ${batch.id} was aborted`);  
        });

        //...    
    };
```
 
### useItemStartListener (event hook)

Called when item starts uploading (just before)

> This event is _[cancellable](../../uploader/README.md#cancellable-events)_

```javascript
    import { useItemStartListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemStartListener((item) => {
            console.log(`item ${item.id} started uploading`);  
        });

        //...    
    };
```
   
### useItemFinishListener (event hook)

Called when item finished uploading

```javascript
    import { useItemFinishListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemFinishListener((item) => {
            console.log(`item ${item.id} finished uploading, response was: `, item.uploadResponse);  
        });

        //...    
    };
```
    
### useItemProgressListener (event hook)

Called every time progress data is received for this file upload

```javascript
    import { useItemProgressListener } from "@rpldy/uploady";

    const MyComponent = () => {
        const item = useItemProgressListener((item) => {});
    
        console.log(`item ${item.id} is ${item.completed}% done and ${item.loaded} bytes uploaded`)
    
       //...    
    };
``` 
    
### useItemCancelListener (event hook)

Called in case item was cancelled from ITEM_START event handler

```javascript
    import { useItemCancelListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemCancelListener((item) => {
            console.log(`item ${item.id} was cancelled`);  
        });

        //...    
    };
``` 

### useItemErrorListener (event hook)

Called in case item upload failed

```javascript
    import { useItemErrorListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemErrorListener((item) => {
            console.log(`item ${item.id} failed - `, item.uploadResponse);  
        });

        //...    
    };
``` 

### useItemAbortListener (event hook)

Called in case [abort](#abort) was called

```javascript
    import { useItemAbortListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemAbortListener((item) => {
            console.log(`item ${item.id} was aborted`);  
        });

        //...    
    };
``` 

### useRequestPreSend (event hook)

Called before a group of items is going to be uploaded
Group will contain a single item unless "grouped" option is set to true.

Handler receives the item(s) in the group and the upload options that were used.
The handler can change data inside the items and in the options by returning different data than received.
See simple example below or this more detailed [guide](../../../guides/DynamicParameters.md).

```javascript
    import { useRequestPreSend } from "@rpldy/uploady";

    const MyComponent = () => {
        useRequestPreSend(({ items, options }) => {        	
            let method = options.method;

            if (options.destination.url.startsWith("https://put-server")) {
                method = "PUT";
            }            

            return {
                options: { method } //will be merged with the rest of the options 
            };  
        });

        //...    
    };
``` 
    
### useUploadOptions

Shortcut hook to set/get upload options. 

```javascript
    const MyComponent = () => {
        const options = useUploadOptions({grouped: true, maxGroupSize: 3});
        
        //...       
    };
```

        
### useFileInput

When customInput prop is set to true. Uploady will not create its own file input element.
In this case, Uploady will wait for a ref to an existing input.

The way you pass in your own input element is by using this hook.

In case Uploady wasn't provided with a destination prop or if it doesn't have a URL property, 
Uploady will check whether the input resides in a form. It will then use the form's action and method to set the upload endpoint and method.
 
 
> In case the form's attributes were used for the upload destination, updating the form's attributes dynamically won't affect the uploader configuration once it was set.
 

```javascript
import Uploady, { useFileInput } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const MyForm = () => {
    const inputRef = useRef();
    useFileInput(inputRef);

    return <form action="/upload" method="POST">
        <input type="file" name="testFile" style={{ display: "none" }} ref={inputRef}/>
    </form>;
};

export const WithCustomFileInputAndForm = () => {
    return <section>
        <Uploady
            debug
            customInput
        >
            <MyForm />
            <UploadButton/>
        </Uploady>
    </section>
};

```