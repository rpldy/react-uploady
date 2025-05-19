<a href="https://opencollective.com/react-uploady">
    <img src="https://img.shields.io/opencollective/all/react-uploady?style=flat&logo=opencollective&label=Support%20us!&color=blue" alt="Support on Open Collective"/>
</a>
<a href="https://badge.fury.io/js/%40rpldy%2Fuploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Fuploady.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.app/?path=/docs/ui-uploady--docs">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

<details>
    <summary>Contents</summary>
    
* [Intro](#uploady)
* [Installation](#installation)
* [Props](#props)
* [Example](#example)
* [Context](#context)
* [Hooks](#hooks)
* [HOCs](#hocs)
* [Contribute](#contribute)

</details>

# Uploady

This is the main UI package. Its role is to initialize and expose the [uploader](https://react-uploady.org/docs/packages/rpldy-uploader/) functionality.
It contains the Provider that all other UI packages rely on.

It provides multiple hooks that enable more advanced features and data for client apps.

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav">         
        <img width="700" alt="uploady-buy-me-coffee" src="https://github.com/user-attachments/assets/3a22cd82-94f8-4b79-8b1b-c783be5ecb88"/>
    </a>
</p>

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady

#NPM:
   $ npm i @rpldy/uploady
``` 

## Props

| Name (* = mandatory) | Type                                                                                               | Default       | Description                                                                                                                                                                                                         |
|----------------------|----------------------------------------------------------------------------------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Uploader Options** |                                                                                                    |               |                                                                                                                                                                                                                     |
| autoUpload           | boolean                                                                                            | true          | automatically upload files when they are added                                                                                                                                                                      |
| destination          | [Destination](https://react-uploady.org/docs/api/types/#destination)                               | undefined     | configure the end-point to upload to                                                                                                                                                                                |
| inputFieldName       | string                                                                                             | "file"        | name (attribute) of the file input field (requires sendWithFormData = true)                                                                                                                                         |
| grouped              | boolean                                                                                            | false         | group multiple files in a single request                                                                                                                                                                            |
| maxGroupSize         | number                                                                                             | 5             | maximum of files to group together in a single request                                                                                                                                                              |
| formatGroupParamName | (number, string) => string                                                                         | undefined     | determine the upload request field name when more than file is grouped in a single upload                                                                                                                           |
| fileFilter           | (File &#124; string, index: number, File[] &#124; string[]) => boolean                             | undefined     | return false to exclude from batch                                                                                                                                                                                  |
| method               | string                                                                                             | "POST"        | HTTP method in upload request                                                                                                                                                                                       |
| params               | Object                                                                                             | undefined     | collection of params to pass along with the upload (requires sendWithFormData = true)                                                                                                                               |
| forceJsonResponse    | boolean                                                                                            | false         | parse server response as JSON even if no JSON content-type header received                                                                                                                                          |
| withCredentials      | boolean                                                                                            | false         | set XHR withCredentials to true                                                                                                                                                                                     |
| enhancer             | [UploaderEnhancer](https://react-uploady.org/docs/api/types/#uploaderenhancer)                     | undefined     | uploader [enhancer](https://react-uploady.org/docs/api/types/#uploaderenhancer) function                                                                                                                            |
| concurrent           | boolean                                                                                            | false         | issue multiple upload requests simultaneously                                                                                                                                                                       |
| maxConcurrent        | number                                                                                             | 2             | maximum allowed simultaneous requests                                                                                                                                                                               |
| send                 | [SendMethod](https://react-uploady.org/docs/api/types/#sendmethod)                                 | @rpldy/sender | how to send files to the server                                                                                                                                                                                     |
| sendWithFormData     | boolean                                                                                            | true          | upload is sent as part of [formdata](https://developer.mozilla.org/en-US/docs/Web/API/FormData) - when true, additional params can be sent along with uploaded data                                                 |
| formatServerResponse | [FormatServerResponseMethod](https://react-uploady.org/docs/api/types/#formatserverresponsemethod) | undefined     | function to create the batch item's uploadResponse from the raw xhr response                                                                                                                                        |
| clearPendingOnAdd    | boolean                                                                                            | false         | whether to clear pending batch(es) when a new one is added                                                                                                                                                          |
| isSuccessfulCall     | [IsSuccessfulCall](https://react-uploady.org/docs/api/types/#issuccessfulcall)                     | undefined     | callback to use to decide whether upload response is succssful or not                                                                                                                                               |
| fastAbortThreshold   | number                                                                                             | 100           | the pending/active item count threshold from which to start using the performant abort mechanism                                                                                                                    |
| userData             | any                                                                                                | undefined     | metadata set by the user and isn't used by the upload process in any way, provided as a convenience to pass data around                                                                                             |
| **Uploady Options**  |                                                                                                    |               |                                                                                                                                                                                                                     |
| debug                | boolean                                                                                            | false         | enable console logs from uploady packages                                                                                                                                                                           |
| listeners            | Object                                                                                             | undefined     | map of [event](https://react-uploady.org/docs/api/events/) name and event handler                                                                                                                                   |
| customInput          | boolean                                                                                            | false         | whether to use a custom file input (see: [useFileInput](#useFileInput)                                                                                                                                              |
| inputFieldContainer  | HTMLElement                                                                                        | document.body | html element to place the file input element inside                                                                                                                                                                 |
| children             | React.Node                                                                                         | undefined     | any part of your React app that will require access to the upload flow  (components, hooks, etc.)                                                                                                                   |
| capture              | string                                                                                             | null          | [input/file#capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture) - affects file input only. for example, drag&drop or programmatic uploads will not be affected by this setting   |
| multiple             | boolean                                                                                            | true          | [input/file#multiple](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple) - affects file input only. for example, drag&drop or programmatic uploads will not be affected by this setting |
| accept               | string                                                                                             | null          | [input/file#accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept) - affects file input only. for example, drag&drop or programmatic uploads will not be affected by this setting     |
| webkitdirectory      | boolean                                                                                            | false         | [webkitdirectory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory) - affects file input only. for example, drag&drop or programmatic uploads will not be affected by this setting |
| fileInputId          | string                                                                                             | undefined     | the value to use for the internal file input element                                                                                                                                                                |
| noPortal             | boolean                                                                                            | false         | Dont render Uploady's file input in a portal. (default: false) For SSR, noPortal = false causes a React warning in DEV.                                                                                             |

## Example

To be able to use one of the [UI Components](https://react-uploady.org/docs/category/components/) or one of the hooks, you need to wrap them with Uploady.
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
import React from "react";
import Uploady, { useUploady } from "@rpldy/uploady";

const MyComponent = () => { 
    const uploady = useUploady();

    const onClick = ()=> {
            uploady.showFileUpload();
        };

    return <button onClick={onClick}>Custom Upload Button</button>
};

const App = () => (<Uploady>
    <MyComponent/>
</Uploady>);

```

### UploadyContext API

#### showFileUpload 

_(?UploadOptions) => void_
    
Show the native file selection dialog. Optionally Pass options as a parameter to override options set as props on the Uploady component. 

#### upload 

_(files: UploadInfo | UploadInfo[], addOptions: ?UploadOptions) => void_

Upload file(s). Optionally Pass options as the second parameter to override options set as props on the Uploady component.

#### processPending

_(uploadOptions?: UploadOptions) => void_

Start uploading batches that were added with autoUpload = false

Upload Options can be added here to be (deep) merged with the options the batch(es) was added with.
    
#### clearPending 

_() => void_

Remove all batches that were added with autoUpload = false, and were not uploaded yet.

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

register for an [event](https://react-uploady.org/docs/api/events/)
 
#### once 

_(name: any, cb: EventCallback) => OffMethod_
 
register once for an [event](https://react-uploady.org/docs/api/events/)
    
#### off

_(name: any, cb?: EventCallback) => void_

unregister an event handler

## Hooks

Uploady provides hooks for all [uploader events](https://react-uploady.org/docs/api/events/), as well as a few other useful ones.

### useBatchAddListener (event hook)

Called when a new batch is added.

> This event is _[cancellable](https://react-uploady.org/docs/api/events/#cancellable-events)_

```javascript
    import { useBatchAddListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchAddListener((batch, options) => {
            console.log(`batch ${batch.id} was just added with ${batch.items.length} items`);  
        });

        //...    
    };
```

### useBatchStartListener (event hook)

Called when batch items start uploading

> This event is _[cancellable](https://react-uploady.org/docs/api/events/#cancellable-events)_

> This event can be scoped to a specific batch by passing the batch id as a second parameter

> The callback function can be `async` or return a promise when needed

```javascript
    import { useBatchStartListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchStartListener((batch) => {
            console.log(`batch ${batch.id} started uploading`);  
        });

        //or scoped:
        useBatchStartListener((batch) => {
            console.log(`batch ${batch.id} started uploading`);  
        }, "b-123");
        //...    
    };
```

The callback passed to the hook may also return an object containing items and/or options
in order to update the request dynamically, similar to [useRequestPreSend](#userequestpresend-event-hook) only for the entire batch.
See [withBatchStartUpdate](#withbatchstartupdate) HOC below for more details.

### useBatchProgressListener (event hook)

Called every time progress data is received from the upload request(s)

> This event can be scoped to a specific batch by passing the batch id as a second parameter

```javascript
    import { useBatchProgressListener } from "@rpldy/uploady";

   const MyComponent = () => {
        const batch = useBatchProgressListener((batch) => {});
    
        console.log(`batch ${batch.id} is ${batch.completed}% done and ${batch.loaded} bytes uploaded`)

       //...    
   };
``` 

Scoping to an id can be done like so:

```javascript
    //...
    const { completed: batchCompleted } = useBatchProgressListener("batch-id") || { completed: 0 };
    //...
```
        
### useBatchFinishListener (event hook)

Called when batch items finished uploading 

> This event can be scoped to a specific batch by passing the batch id as a second parameter

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

> This event can be scoped to a specific batch by passing the batch id as a second parameter

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

> This event can be scoped to a specific batch by passing the batch id as a second parameter

```javascript
    import { useBatchAbortListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchAbortListener((batch) => {
            console.log(`batch ${batch.id} was aborted`);  
        });

        //...    
    };
```

### useBatchErrorListener (event hook)

Called in case batch failed with an error. These errors will most likely occur due to invalid event handling.
For instance, by a handler (ex: BATCH_START) throwing an error. 

> This event can be scoped to a specific batch by passing the batch id as a second parameter

```javascript
    import { useBatchErrorListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchErrorListener((batch) => {
            console.log(`batch ${batch.id} had an error: ${batch.additionalInfo}`);  
        });

        //...    
    };
```

### useBatchFinalizeListener (event hook)

Called for batch when all its items have finished uploading or in case the batch was cancelled(abort) or had an error 

> This event can be scoped to a specific batch by passing the batch id as a second parameter

```javascript
    import { useBatchFinalizeListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useBatchFinalizeListener((batch) => {
            console.log(`batch ${batch.id} finished uploading with status: ${batch.state}`);  
        });

        //...    
    };
```

### useItemStartListener (event hook)

Called when item starts uploading (just before)
For grouped uploads (multiple files in same xhr request) ITEM_START is triggered for each item separately

> This event is _[cancellable](https://react-uploady.org/docs/api/events/#cancellable-events)_

> This event can be scoped to a specific item by passing the item id as a second parameter

> The callback function can be `async` or return a promise when needed

```javascript
    import { useItemStartListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemStartListener((item) => {
            console.log(`item ${item.id} started uploading`);  
        });
    
        //or scoped:
        useItemStartListener((item) => {
            console.log(`item ${item.id} started uploading`);  
        }, "i-123");

        //...    
    };
```
   
### useItemFinishListener (event hook)

Called when item finished uploading

> This event can be scoped to a specific item by passing the item id as a second parameter

```javascript
    import { useItemFinishListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemFinishListener((item) => {
            console.log(`item ${item.id} finished uploading, response was: `, item.uploadResponse, item.uploadStatus);  
        });

        //...    
    };
```
    
### useItemProgressListener (event hook)

Called every time progress data is received for this file upload

> This event can be scoped to a specific item by passing the item id as a second parameter

```javascript
    import { useItemProgressListener } from "@rpldy/uploady";

    const MyComponent = () => {
        const item = useItemProgressListener((item) => {
        	//callback is optional for this hook
        });
		
        console.log(`item ${item.id} is ${item.completed}% done and ${item.loaded} bytes uploaded`)
    
       //...    
    };
``` 

Scoping to an id can be done like so:

```javascript
    //...
    const { completed: itemCompleted } = useItemProgressListener("item-id") || { completed: 0 };
    //...
```


### useItemCancelListener (event hook)

Called in case item was cancelled from ITEM_START event handler

> This event can be scoped to a specific item by passing the item id as a second parameter

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

> This event can be scoped to a specific item by passing the item id as a second parameter

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

Called in case [abort](#abort) was called for an item

> This event can be scoped to a specific item by passing the item id as a second parameter

```javascript
    import { useItemAbortListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemAbortListener((item) => {
            console.log(`item ${item.id} was aborted`);  
        });

        //...    
    };
``` 

### useItemFinalizeListener (event hook)

Called for item when uploading is done due to: finished, error, cancel or abort

> This event can be scoped to a specific item by passing the item id as a second parameter

```javascript
    import { useItemFinalizeListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useItemFinalizeListener((item) => {
            console.log(`item ${item.id} is done with state: ${item.state}`);  
        });

        //...    
    };
``` 

### useRequestPreSend (event hook)

Called before a group of items is going to be uploaded
Group will contain a single item unless "grouped" option is set to true.

Handler receives the item(s) in the group and the upload options that were used.
The handler can change data inside the items and in the options by returning different data than received.
See simple example below or this more detailed [guide](https://react-uploady.org/docs/guides/DynamicParameters/).

> This event is _[cancellable](https://react-uploady.org/docs/api/events/#cancellable-events)_

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

### useAllAbortListener (event hook)

Called in case [abort](#abort) was called for all running uploads  

```javascript
    import { useAllAbortListener } from "@rpldy/uploady";

    const MyComponent = () => {
        useAllAbortListener(() => {
            console.log("abort all was called");
        });
    };
```

### useUploadyContext (alias: _useUploady_)

Shortcut hook to get the [Uploady Context](#context) instance

> Will throw in case used outside of Uploady render tree

```javascript
    import { useUploady } from "@rpldy/uploady";

    const MyComponent = () => {
        const uploady = useUploady();
        
        const onClick = () => {
            uploady.showFileUpload();
        }

        //...       
    };

    const App = () => (
        <Uploady destination={{...}}>
            <MyComponent/>
        </Uploady>
    );
```

### useUploadOptions

Shortcut hook to set/get upload options. 

```javascript
    import { useUploadOptions } from "@rpldy/uploady";

    const MyComponent = () => {
        const options = useUploadOptions({ grouped: true, maxGroupSize: 3 });
        
        //...       
    };
```
        
### useAbortItem

Returns abort item method 

```javascript
    import { useAbortItem } from "@rpldy/uploady";
    
    const MyComponent = () => {
        const abortItem = useAbortItem();
        
        return <button onClick={() => abortItem("i-123")}>Abort Item</button>       
    };
```

### useAbortBatch

Returns abort batch method
   
```javascript
    import { useAbortBatch } from "@rpldy/uploady";
    
    const MyComponent = () => {
        const abortBatch = useAbortBatch();
        
        return <button onClick={() => abortBatch("b-123")}>Abort Batch</button>       
    };
```

### useAbortAll        

Returns abort all method
       
```javascript
  import { useAbortAll } from "@rpldy/uploady";
  
  const MyComponent = () => {
      const abortAll = useAbortAll();
      
      return <button onClick={() => abortAll()}>Abort All</button>       
  };
```      
        
### useFileInput

When customInput prop is set to true, Uploady will not create its own file input element.
In this case, Uploady will wait for a ref to an existing input.

The way you pass in your own input element is by using this hook.

In case Uploady wasn't provided with a destination prop or if it doesn't have a URL property, 
Uploady will check whether the input resides in a form. It will then use the form's action and method to set the upload endpoint and request method.
 
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

This hook can also be used to retrieve Uploady's internal file input. Calling the hook without parameters will return the ref.

```javascript

const inputRef = useFileInput();

if (inputRef.current) {
    inputRef.current.setAttribute("webkitdirectory", "true");
}

```

__NOTE!__ This isn't the recommended, or the 'Reacty' way to do things. It is still recommended to pass along a ref to an input that you render.
In the future, accessing the internal input may have other consequences related to opting to interact with it directly instead of passing props to the Uploady component.


Check out the [Custom Input guide](https://react-uploady.org/docs/guides/CustomInput/) for more details and examples.

## HOCs

### withRequestPreSendUpdate

HOC to enable components to interact with the upload data and options just-in-time before the request is sent.
This is a hatch point to introduce custom logic that may affect the upload data.

A good example use-case for this is applying [crop](https://react-uploady.org/docs/guides/Crop/) to selected image before it is uploaded.

When rendering the HOC's output, the id of the batch-item must be provided as a prop. 
This ensures the HOC only re-renders for a specific item and not for all.
The id of the batch-item can be obtained from a hook (ex: [useItemStartListener](#useitemstartlistener-event-hook) or [useBatchStartListener](#usebatchstartlistener-event-hook))

```javascript
    import React, { useState, useCallback } from "react";
    import Cropper from "react-easy-crop";
	import Uploady, { withRequestPreSendUpdate } from "@rpldy/uploady";
	import UploadButton from "@rpldy/upload-button";
    import cropImage from "./my-image-crop-code";

    const ItemCrop = withRequestPreSendUpdate((props) => {
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [cropPixels, setCropPixels] = useState(null);
        
        const { url, updateRequest, requestData } = props;
         
        const onUploadCrop = useCallback(async() => {
            if (updateRequest && cropPixels) {
                //replace the file data with the cropped result
                requestData.items[0].file = await cropImage(url, requestData.items[0].file, cropPixels);
                //resume the upload flow with the updated file data			    
                updateRequest({ items: requestData.items });
            }
        }, [url, requestData, updateRequest, cropPixels]);
    
        const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
            setCropPixels(croppedAreaPixels);
        }, []);

        return <>            
            <Cropper
                image={url}
                crop={crop}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
            />           
            <button style={{ display: updateRequest && cropPixels ? "block" : "none" }}
                    onClick={onUploadCrop}>
                Upload Cropped
            </button>
        </>;
    });

    const MyApp = () => {
        return <Uploady destination={{ url: "my-server.com/upload" }}>
            <UploadButton />
            <ItemCrop id="batch-item-1" />
        </Uploady>
    }
```

See the [Crop Guide](https://react-uploady.org/docs/guides/Crop/) for a full example.


### withBatchStartUpdate

HOC to enable components to interact with the upload data and options of the batch just-in-time before the items
are processed and requests are being sent.

This makes it possible to create a UI that will allow the user to interact and possible make changes to different or all items
within the batch before a single request is made.
For example: cropping multiple items prior to upload.

When rendering the HOC's output, the id of the batch must be provided as a prop.
The id of the batch can be obtained from the [useBatchAddListener](#usebatchaddlistener-event-hook)

```javascript
    import React, { useState, useCallback } from "react";
    import Cropper from "react-easy-crop";
    import Uploady, { withBatchStartUpdate } from "@rpldy/uploady";
    import UploadButton from "@rpldy/upload-button";
    import UploadPreview from "@rpldy/upload-preview";
    import cropImage from "./my-image-crop-code";
    
    const CropperForMultiCrop = ({ item, url, setCropForItem }) => {
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [cropPixels, setCropPixels] = useState(null);
		
        const onSaveCrop = async () => {
            const cropped = await cropImage(url, item.file, cropPixels);
            setCropForItem(item.id, cropped);
        };

        const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
            setCropPixels(croppedAreaPixels);
        }, []);
		
        return (<div>
            <Cropper
                image={url}
                crop={crop}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
            />
            {cropPixels && 
                <Button onClick={onSaveCrop} id="save-crop-btn">Save Crop</Button>}
        </div>);
    };

    const BatchCrop = withBatchStartUpdate((props) => {
	    const { id, updateRequest, requestData } = props;
        const [cropped, setCropped] = useState({});
        const hasData = !!(id && requestData);
		
        const setCropForItem = (id, data) => {
            setCropped((cropped) => ({ ...cropped, [id]: data }));
        };
		
        const onUploadAll = () => {
            if (updateRequest) {
                const readyItems = requestData.items
                    .map((item) => {
                        item.file = cropped[item.id] || item.file;
                        return item;
                    });

				//update the items in the batch with the cropped files
                updateRequest({ items: readyItems });
            }
        };

        const getPreviewCompProps = useCallback((item) => {
            return ({
                onPreviewSelected: setSelected,
                isCroppedSet: cropped[item.id],
            });
        }, [cropped, setSelected]);

        return (<div>
            {hasData &&
                <button onClick={onUploadAll}>Upload All</button>}

            <UploadPreview
                rememberPreviousBatches
                PreviewComponent={ItemPreviewThumb}
                fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
                previewComponentProps={getPreviewCompProps}
            />

            {selectedItem && hasData &&
                <CropperForMultiCrop
                    {...selected}
                    item={selectedItem}
                    setCropForItem={setCropForItem}
                />}
        </div>);
    });
	
    const MultiCropQueue = () => {
        const [currentBatch, setCurrentBatch] = useState(null);
    
        useBatchAddListener((batch) => setCurrentBatch(batch.id));
    
        return <BatchCrop id={currentBatch} />;
    };
	
    export const MyApp = () => {
        return <Uploady destination={{ url: "my-server.com/upload" }}>
            <UploadButton />
            <MultiCropQueue  />
        </Uploady>;
    };
```

See the [Multi Crop Guide](https://react-uploady.org/docs/guides/MultiCrop/) for a full example.

## Contribute

Show Uploady your support by giving us a [⭐](https://github.com/rpldy/react-uploady/stargazers).

If you'd like to help Uploady grow & improve, take a look at the [Contributing](https://github.com/rpldy/react-uploady/blob/master/CONTRIBUTING.md) doc.

The [Discussions](https://github.com/rpldy/react-uploady/discussions) page is a great place to ask questions, raise ideas and interact with Uploady maintainer, users and contributors.

Already using Uploady in Production? Let us know how & where in this open [discussion](https://github.com/rpldy/react-uploady/discussions/131).

### Financial Contributors

Want to help sustain and grow Uploday? You can become a financial backer on OpenCollective.

Become a financial contributor and help us sustain our community.

> You can make a one-time contribution or on a monthly basis

<a href="https://opencollective.com/react-uploady" target="_blank"><img src="https://images.opencollective.com/static/images/become_backer.svg"></a>
