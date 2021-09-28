# Submit Form

A times we need to handle a form that contains multiple fields and a file input. 
In this use-case, submitting the form should upload the file, but also send the fields' content.

This guide will show you how to handle this very use-case.

## Example

### Custom Upload Field

First we define the upload field. We don't need to handle input with type="file". We let Uploady do that. 
We can create a simple div that will both act as the file browse trigger and show the selected file name:

```javascript
import React, { forwardRef, useState } from "react";
import { useBatchAddListener, useBatchFinishListener } from "@rpldy/uploady";

const MyUploadField = asUploadButton(
    forwardRef(({ onChange, ...props }, ref) => {
        const [text, setText] = useState("Select file");

        useBatchAddListener((batch) => {
            setText(batch.items[0].file.name);
            onChange(batch.items[0].file.name);
        });

        useBatchFinishListener(() => {
            setText("Select file");
            onChange(null);
        });

        return (
            <div {...props} ref={ref} id="form-upload-button">
                {text}
            </div>
        );
    })
);

```

The button uses the [useBatchAddListener](../packages/ui/uploady#usebatchaddlistener-event-hook) and [useBatchFinishListener](../packages/ui/uploady#usebatchfinishlistener-event-hook) to set and clear the file name from the field respectively.

### The Form

Next, we define our form with our custom upload field and additional inputs:

```javascript
import React, { useState, useCallback, useMemo } from "react";
import { useUploadyContext } from "@rpldy/uploady";

const MyForm = () => {
    const [fields, setFields] = useState({});
    const [fileName, setFileName] = useState(null);
    const uploadyContext = useUploadyContext();

    const onSubmit = useCallback(() => {
        uploadyContext.processPending({ params: fields });
    }, [fields, uploadyContext]);

    const onFieldChange = useCallback((e)=> {
        setFields({
            ...fields,
            [e.currentTarget.id]: e.currentTarget.value,
        })
    }, [fields, setFields]);

    const buttonExtraProps = useMemo(() => ({
        onChange:setFileName
    }), [setFileName]);

    return (
        <form>
            <MyUploadField autoUpload={false} extraProps={buttonExtraProps}/>
            <br/>
            <input onChange={onFieldChange} id="field-name" type="text" placeholder="your name"/>
            <br/>
            <input onChange={onFieldChange} id="field-age" type="number" placeholder="your age"/>
            <br/>
            <button id="form-submit" type="button" onClick={onSubmit} disabled={!fileName}>Submit Form</button>
        </form>
    );
};

```

Notice that our submit button uses the [processPending](../packages/ui/uploady#processpending) context api method to initiate the upload.
The additional form fields are passed as `params`, which will be added to the form data sent as part of the request.

We also pass `autoUpload` as false in order for the uploader mechanism to wait until we're ready to upload. This allows the user to select a file and fill the other fields independently.
Only calling `processPending` will initiate the upload. 

### Tying it all together

Finally, we render our form inside the <Uploady> provider so it all works:

```jsx
const App = () => {
    return (
        <Uploady
            clearPendingOnAdd
            multiple={false}
            destination={{ url: "my-server.com/upload" }}
        >                
                <h3>Using a Form with file input and additional fields</h3>
                <MyForm/>         
        </Uploady>
    );
};
```

We pass multiple = false so user can only select one file at a time. 
And pass `clearPendingOnAdd` as true. This will make the uploader "forget" previously added uploads. Since we use `autoUpload`, we want to replace the pending file rather than add to it.
Once `processPending` is called, only one file will be uploaded.

---

Code is available in this [sandbox](https://codesandbox.io/s/react-uploady-inside-form-ys1wx?file=/src/App.js).
