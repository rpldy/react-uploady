# Custom Input

At times, you may wish to have complete control over the [file input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file) Uploady uses to initiate the file selector.
Or perhaps you have one already configured the way you want it and would like Uploady to use that.

This is possible, using the combination of the `customInput` prop, and the [useFileInput](https://github.com/rpldy/react-uploady/tree/master/packages/ui/uploady#useFileInput) hook.

Using these will make Uploady wait for you to pass a ref to the file input you render instead of rendering one on its own.

## Examples

### Simple 

```javascript
import Uploady, { useFileInput } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const ExampleForm = () => {
    const inputRef = useRef();
    useFileInput(inputRef);

    return <form action="my-server.com/upload" method="POST">
        <input type="file" name="testFile" style={{ display: "none" }} ref={inputRef}/>
    </form>;
};

const App = () => {
    return <section>
        <Uploady customInput>
            <ExampleForm/>
            <UploadButton/>
        </Uploady>
    </section>
};
```

The example above shows how to use a custom input while everything else about Uploady's usage remains the same.

> Notice the `customInput` prop passed to the Uploady component.
> `useFileInput` is called inside the form component, passing it the ref to the custom input.

### With Custom Button

In case you need more control. For example: to change the file input's attributes prior to upload beginning, see the code below:

```javascript
import Uploady, { useUploady, useFileInput } from "@rpldy/uploady";

const ExampleFormWithCustomButton = () => {
    const { showFileUpload } = useUploady();
    const [selectDir, setSelectDir] = useState(false);
    const inputRef = useRef();
    useFileInput(inputRef);

    const onSelectChange = useCallback((e) => {
        setSelectDir(e.target.value === "dir");
    }, []);

    const onClick = useCallback(() => {
        showFileUpload();
    }, []);

    return <>
        <form action="my-server.com/upload" method="POST">
            <input
                type="file"
                name="testFile"
                style={{ display: "none" }}
                ref={inputRef}
                webkitdirectory={selectDir ? "true" : undefined}
            />
        </form>
        <select onChange={onSelectChange}>
            <option value="file">File</option>
            <option value="dir">Directory</option>
        </select>
        <button onClick={onClick}>Upload</button>
    </>;
};

export const App = () => {
    return <section>
        <Uploady customInput>
            <ExampleFormWithCustomButton/>
        </Uploady>
    </section>
};
```

The code above will change the `webkitdirectory` based on user selection. 
This should be useful for applications where something about the file input should change based on user interaction or any other kind of business logic.  

### Access Uploady's File Input

In case you don't want to create your own file input but still want to directly influence the input in your own code, useFileInput can be used as well.
When useFileInput is called without parameters, it will return a ref to the internal input Uploady renders when its created.

> Note: This isn't the recommended, or the 'Reacty' way to do things. It is still recommended to pass along a ref to an input that you render

```javascript
import Uploady, { useFileInput } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const UploadFormWithInternalInput = () => {
    const inputRef = useFileInput();

    const onSelectChange = useCallback((e) => {
        if (e.target.value === "dir") {
            inputRef.current.setAttribute("webkitdirectory", true);
        } else {
            inputRef.current.removeAttribute("webkitdirectory");
        }
    }, []);

    return <>
        <select id="select-input-type" onChange={onSelectChange}>
            <option value="file">File</option>
            <option value="dir">Directory</option>
        </select>
        <UploadButton/>
    </>;
};

export const App = () => {
    return <section>
        <Uploady>
            <UploadFormWithInternalInput/>
        </Uploady>
    </section>
};
```