test
# Cloudinary

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

### Production 

For Production environment, you should only allow signed uploads. 
Below is an example of signed upload flow:

```javascript

import React from "react";
import Uploady, { useRequestPreSend } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const CLOUD_NAME = "<cloud-name>",
  UPLOAD_PRESET = "<signed-upload-preset>",
  API_KEY = "<cloud-api-key>";

const SignedUploadButton = () => {
  useRequestPreSend(async ({ options }) => {
    const timestamp = Date.now();

    const response = await fetch("https://my-signing-service/sign", {
      method: "POST",
      body: {
        ...options.destination.params,
        timestamp
      }
    });

    const responseJson = await response.json();

    return {
      options: {
        destination: {
          params: {
            signature: responseJson.signature,
            timestamp,
            api_key: API_KEY
          }
        }
      }
    };
  });

  return <UploadButton>Signed Upload to Cloudinary</UploadButton>;
};

export default function App() {
  return (
    <div className="App">
      <Uploady
        destination={{
          url: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
          params: {
            upload_preset: UPLOAD_PRESET,
            folder: "upload-folder"
            //additional cloudinary upload params can be defined here
          }
        }}
      >
        <SignedUploadButton />
      </Uploady>
    </div>
  );
}

```

check out this [sandbox](https://codesandbox.io/s/react-uploady-cloudinary-signed-sample-8tw8d) with the same code.
