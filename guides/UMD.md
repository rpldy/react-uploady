# UMD

In case you're not using webpack, rollup, etc, to bundle your app and you need access to react-uploady functionality, 
you can use a script tag.

While that's not the recommended way, in case you have to use a script tag the examples below how the different bundles may be used.

**Polyfills**

The UMD bundles aren't bundled with core-js and regenerator polyfills. So it's up to you to either load Uploady bundle in an environment that provides the required polyfills
or use the provided polyfill bundle. 

See examples below, which polyfill bundle corresponds to which UMD bundle.

## Examples

### Core

```html

<html>
    <head>
        <script defer src="https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/polyfills-bundle.js"/>
        <script defer src="https://cdn.jsdelivr.net/npm/@rpldy/uploader/umd/rpldy-core.umd.min.js"/>
    </head>
    <body>
        <input type="file" id="fileInput"/>


        <script>
            //should wait for DOMContentLoaded before executing script below

            const uploader = window.rpldy.createUploader({
                         destination: {url: "https://my-server"},                             
                     });
                            
            const fileInput = document.getElementById("fileInput");
    
            fileInput.addEventHandler("change", () => {
                   uploader.add(fileInput.files);
            });      
        </script>
    </body>
</html>
```

### Core + UI  Bundle

```html

<html>
    <head>
        <script defer src="https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/polyfills-bundle.js"/>
        <script defer src="https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/rpldy-ui-core.umd.min.js"/>
    </head>
    <body>
               
        <main id="app"></main>

        <script>
            //should wait for DOMContentLoaded before executing script below

            const MyUploadButton = () => {                
                const uploadyContext = react.useContext(rpldy.UploadyContext);
        
                const onClick = react.useCallback(()=>{
                    uploadyContext.showFileUpload();
                });
        
                return react.createElement("button", {id: "upload-button", onClick: onClick, children: "Upload"});
            };
        
            const uploadyProps = {                
                destination: {url: "https://my-server"},                                             
            };
        
            ReactDOM.render(
                react.createElement(                      
                    rpldy.Uploady,
                    uploadyProps,
                    [react.createElement(MyUploadButton)]
                );
                document.getElementById("app")
            );
        </script>
    </body>
</html>
```

### Core + UI + Chunked Bundle

```html

<html>
    <head>
        <script defer src="https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/polyfills-bundle.js"/>
        <script defer src="https://cdn.jsdelivr.net/npm/@rpldy/chunked-uploady/umd/rpldy-ui-core-chunked.umd.min.js"/>
    </head>
    <body>
               
        <main id="app"></main>

        <script>
            //should wait for DOMContentLoaded before executing script below

            const MyUploadButton = () => {       
                rpldy.uploady.useRequestPreSend(() => {
                        return {
                            options: {
                                destination: {
                                    headers: {
                                        "X-Unique-Upload-Id": `umd-test-${Date.now()}`,
                                    }
                                }
                            }
                        };
                    });
         
                const uploadyContext = react.useContext(rpldy.UploadyContext);
        
                const onClick = react.useCallback(()=>{
                    uploadyContext.showFileUpload();
                });
        
                return react.createElement("button", {id: "upload-button", onClick: onClick, children: "Upload"});
            };
        
            const uploadyProps = {
                destination: {url: "https://my-server"},   
                chunkSize: 1000000, 
            };
        
            ReactDOM.render(
                react.createElement(                      
                    rpldy.chunkedUploady.ChunkedUploady,
                    uploadyProps,
                    [react.createElement(MyUploadButton)]
                );
                document.getElementById("app")
            );
        </script>
    </body>
</html>
```

### Everything Bundle

> note that the "Everything" bundle requires a different polyfill bundle

```html

<html>
    <head>
        <script defer src="https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/polyfills-all-bundle.js"/>
        <script defer src="https://cdn.jsdelivr.net/npm/@rpldy/uploady/umd/rpldy-all.umd.min.js"/>
    </head>
    <body>
               
        <main id="app"></main>

        <script>
            //should wait for DOMContentLoaded before executing script below

            const uploadButton = react.createElement(rpldy.uploadButton.UploadButton, {id: "upload-button"});
        
            const uploadPreview = react.createElement(rpldy.uploadPreview.UploadPreview, {
                id: "upload-preview",
                previewComponentProps:{"data-test": "upload-preview"},
            });

            const uploadyProps = {
                destination: {url: "https://my-server"},                   
            };
        
            ReactDOM.render(
                react.createElement(                      
                    rpldy.uploady.Uploady,
                    uploadyProps,
                    [uploadButton, uploadPreview]
                );
                document.getElementById("app")
            );
        </script>
    </body>
</html>
```
