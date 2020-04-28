# Different Configurations

The [Uploady](../packages/ui/uploady) component accepts all upload options which are either used to initialize the file input or to initialize the [Uploader](../packages/uploader) instance.

To be able to use UI components from this library or any of the hooks it provides, you need to surround the relevant components with an <Uploady> component.

It's recommended that you use a single Uploady component for your entire app. 
You can configure it with parameters that are relevant for all uploads from your client.

If you need to then override certain options closer to where the actual upload takes place (in your app), you can do that with the provided UI components.

## Example

### Multiple upload button with different overrides

In this example, the first upload button overrides the 'autoUpload' param.
The second upload button adds a header just for uploads initiated by it.

```javascript
import React from "react";
import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const MyApp = () => {
 return <Uploady
           autoUpload
            destination={{url: "https://my-server.com/upload"}}>

            <UploadButton autoUpload={false}>
                autoUpload = false
            </UploadButton>
            <br/>
            <UploadButton destination={{headers: {"x-test": "1234"}}}>
                add 'x-test' header
            </UploadButton>
        </Uploady>;
};

```

You can see this in action [here](https://react-uploady-storybook.netlify.app/?path=/story/upload-button--different-configuration).

### Multiple drop zone with different overrides

```javascript
import React from "react";
import Uploady from "@rpldy/uploady";
import UploadDropZone from "@rpldy/upload-drop-zone"
;
 return <Uploady autoUpload
                 destination={{url: "https://my-server.com/upload"}}>

        <UploadDropZone autoUpload={false}>
            <h2>autoUpload = false</h2>
        </UploadDropZone>

        <UploadDropZone destination={{headers: {"x-test": "1234"}}}>
            <h2>add 'x-test' header</h2>
        </UploadDropZone>
    </Uploady>;

```

You can see this in action [here](https://react-uploady-storybook.netlify.app/?path=/story/upload-drop-zone--different-configuration).
