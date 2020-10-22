#Cloudinary

Uploading to [Cloudinary](https://cloudinary.com) can be done from the client easily.
For [unsigned](https://cloudinary.com/documentation/upload_images#unsigned_upload) uploads it's just a matter of knowing your cloud name and the name of an unsigned upload preset.

> Note that for Production accounts, it's advised to only allow [signed](https://cloudinary.com/documentation/upload_images#generating_authentication_signatures) uploads

## Code

```javascript

import React from "react";
import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const CLOUD_NAME = "<your-cloud-name>";
const UPLOAD_PRESET = "<your-upload-preset>";

const App = () => (<Uploady
    destination={{ 
        url: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        params: {
            upload_preset: UPLOAD_PRESET,
        }
    }}>
    <UploadButton/>
</Uploady>);

```