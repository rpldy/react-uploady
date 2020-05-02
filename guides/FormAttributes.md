# Form Attributes

By default, Uploady wil create its own file input which will be used internally for file uploads from the user's file system.
In this case, the way to tell Uploady where to upload files to is by setting the [Destination](../README.md#destination) upload option.

If however, you wish to use an existing file input, that is also an option.
Furthermore, when using your file input and not passing a destination, Uploady will check if the input element resides in a form element.
In this case, Uploady will use the form's attributes (action and method) to populate a destination.

If you with to use your own file input (which is in a form) but don't want Uploady to use the form's attributes, make sure to set the destination prop.

## Example

Using a custom file input and its parent form's attributes can loo something like this:\

> Notice the use of "customInput" prop (passed to \<Uploady\>) and then the call to useFileInput hook.
> 
```javascript

import React from "react";
import Uploady, { useFileInput } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const ExampleForm = () => {
    const inputRef = useRef();
    useFileInput(inputRef);

    return <form action="/upload" method="POST">
        <input type="file" name="testFile" style={{ display: "none" }} ref={inputRef}/>
    </form>;
};

export const MyApp = () => {
    return <Uploady
            debug
            customInput
        >
            <ExampleForm/>
            <UploadButton/>
        </Uploady>;
};

``` 

