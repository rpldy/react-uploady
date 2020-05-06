# Uploader Enhancers

Upload Enhancers are the way to extend the Uploader with custom functionality.

Current examples of their use can be found in these packages:

- [@rpldy/retry](../packages/retry)
- [@rpldy/chunked-sender](../packages/chunked-sender)

Enhancers receive an instance of the Uploader and may change its options (or modify it - no recommended).
They can also register to events and register [extensions](#extensions)
For example, the chunked-sender enhancer updates the uploader options with a different send method.

Enhancer is passed as an uploader option to the createUploader method: 

```javascript
    import createUploader from "@rpldy/uploader";
    
    const uploader = createUploader({
        enhancer: (uploader) => uploader,
    });
```

Or as a prop to Uploady:

```javascript
    import Uploady from "@rpldy/uploady";

    const myEnhancer = (uploader) => uploader;

    const MyApp = () => {
        return <Uploady enhancer={myEnhancer}>
 
        </Uploady>;
    };
```

## Composition 

Multiple enhancers can be registered by using the _composeEnhancers_ utility method:

Enhancers should be written so they aren't dependent on the order in which they are registered

```javascript

import Uploady, { composeEnhancers } from "@rpldy/uploady";
import retryEnhancer from "@rpldy/retry-hooks";

const myEnhancer = (uploader) => uploader;

const enhancer = composeEnhancers(retryEnhancer, myEnhancer);

 const MyApp = () => {
        return <Uploady enhancer={enhancer}>
 
        </Uploady>;
    };
```

## Extensions

Enhancers are also the only time when external code register an extension. 
Extensions are objects that are added to an uploader instance under a specific name and can later be retrieved.
That's all currently.

Extensions are the safe way to add custom code to the uploader.

```javascript

    const myEnhancer = (uploader) => {
        uploader.registerExtension("ext-name", {
            foo: "bar",
            myMethod: () => {}        
        });
    
        return uploader;
    };
``` 

## Example

Let's build a storybook actions logging enhancer.

```javascript
import { actions } from "@storybook/addon-actions";
import Uploady from "@rpldy/uploady";

const actionLogEnhancer = (uploader) => {
    const events = actions("ITEM_START", "ITEM_FINISH", "BATCH_ADD", "BATCH_FINISH");
  
    uploader.on(UPLOADER_EVENTS.BATCH_ADD, (batch) => {
        events.BATCH_ADD(batch.id, "added");
    });

    uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
        events.ITEM_START(item.id, item.file ? item.file.name : item.url);
    });

    uploader.on(UPLOADER_EVENTS.ITEM_FINISH, (item) => {
        events.ITEM_FINISH(item.id, item.file ? item.file.name : item.url);
    });
    
    uploader.on(UPLOADER_EVENTS.BATCH_FINISH, (batch) => {
        events.BATCH_FINISH(batch.id, "finished");
    });

    return uploader;
};

const MyApp = () => {
    return <Uploady enhancer={actionLogEnhancer}>
    </Uploady>;
};
```
