# Crop

Cropping an image before its uploaded is a common task but not necessarily easy to accomplish.
With Uploady, its actually quite simple. This guide shows how to do this by tapping into the upload flow of Uploady.
After the user chooses the file(s) to upload, the [REQUEST_PRE_SEND](../packages/uploader#uploader_eventsrequest_pre_send) event can be used to augment/change the data that will be set to the server.
This is the perfect time to allow the user to crop their image and replace the selected file with the crop action result.

For this guide, we use [@rpldy/upload-preview](../packages/ui/upload-preview) together with the [withRequestPreSendUpdate](../packages/ui/uploady/README.md#withRequestPreSendUpdate) HOC.
_upload-preview_ allows us to use a custom preview component and _withRequestPreSendUpdate_ makes it easy to intercept the upload data and change it when we're ready.

Use of upload-preview isn't mandatory of course. It's simply makes it easier as it loads a preview of the uploaded image for us.
It also provides the batch item id which is needed for _withRequestPreSendUpdate_.

First we define our preview with crop component:

```javascript




```   