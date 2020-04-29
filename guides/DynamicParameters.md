# Dynamic Parameters

Uploady allow's you to inject upload related parameters/options dynamically.
This is useful when different headers or parameters are needed based on the uploaded data.

The relevant event for this is: [REQUEST_PRE_SEND](../packages/uploader#uploader_eventsrequest_pre_send) and the relevant hook: 
[useRequestPreSend](../packages/ui/uploady#userequestpresend-event-hook).

The handler (event or hook) receives an object:  _{items, options}_

The _items_ array contains the (batch) items that are going to be uploaded in the next request.
The array will contain more than one item when grouping is configured (by default grouping is turned off).
 
The values in the item object can be changed except for the id and batchId properties.
See BatchItem [type definition](../packages/shared/src/types.js#67). 

> it's hard to find a use case for changing the items, except perhaps to modify the _url_ property of URL uploads.

The _options_ object contains the upload options attached to the batch the items belong to.
Options related to the upload can be changed, for example destination headers or params.
See Upload Options [documentation](../packages/ui/uploady#props). 

The handler should return an object with either _items_ or _options_ or both,
in case a change was made. In case no change/addition was made the handler doesnt have to return anything.

For the _options_, the returned object will be merged into the data held by the uploader.
Therefore, it's possible to only return the new props.

_items_ must be returned fully.

## Using event handler

```javascript

import React from "react";
import Uploady, { UPLOADER_EVENTS } from "@rpldy/uploady";

const MyApp = () => {
    const listeners = useMemo(() => ({

        //add a param (request field) that will be sent to the serve alongside the uploaded file
        [UPLOADER_EVENTS.REQUEST_PRE_SEND]: () => {
            return { 
            	    options: {
                        params: {
                            clientTime: Date.now()
                        }           
                     }
                 }; 
        }
    }, []));

    return <Uploady
                destination={{url: "https://my-server.com/upload"}}
                listeners={listeners}>
        {/* rest of my app */}
    </Uploady>
};
```

## Using hook

```javascript
    import { useRequestPreSend } from "@rpldy/uploady";

    const MyComponent = () => {
        //dynamically changed the HTTP method
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