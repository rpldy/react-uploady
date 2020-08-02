# Changelog

## 0.4.0

### Features

- `[mock-sender]` - mock sender for testing purposes (moved out of sender)

### Bug fixes

- `[shared]` - getMerge with _withSymbols_
- `[simple-state]` - unwrap with symbol props

## 0.3.2

### Features

- `[upload-drop-zone]` - UploadDropZone extraProps prop

## 0.3.1

### Bug fixes

- `[upload-preview]` - isFallback isnt passed to preview
- `[tus-sender]` - include custom headers from destination

### Docs

- `[tus-sender]` - clarify params. explain headers override
- `[tus-uploady]` - clarify params. explain headers override

## 0.3.0

### Features

- `[uploady]` - withRequestPreSendUpdate HOC
- `[uploader]` - made REQUEST_PRE_SEND event cancellable
- `[upload-preview]` - exposed PREVIEW_TYPES  
- `[upload-preview]` - added isFallback prop for preview component
- `[shared]` - batch items can be recycled (ex: retry)  
- `all` - event data is unwrapped (un-proxied) before sent out with trigger

### Bug fixes

- `[shared]` - fix merge/clone mistreating arrays

### Internal

- `[simple-state]` - new package to handle internal state (uploader/retry/tus-sender)
- `[e2e]` - added queue-retry spec

### Docs

- `[uploady]` - document withRequestPreSendUpdate 
- `[simple-state]` - package readme
- `guides` - Crop guide
- `storybook` - added upload-preview with crop story
- `internal packages` - added "internal" note 

## 0.2.4

### Features

- `[upload-preview]` - preview methods: clear (previewMethodsRef)
- `[upload-preview]` - access to preview items array (onPreviewsChanged)
- `[chunked-uploady]` - chunk event hooks (start/finish)

### Internal

- `[shared]` - updateable - proxy only in dev. proxy additions to state

### Docs

- `[chunked-uploady]` - document chunk event hooks
- `[chunked-sender]` - document chunk events
- `guides` - Upload Queue guide

## 0.2.3

### Features

- `[uploady]` - item/batch event hooks can now be scoped to a specific item
 
### Bug fixes

- `[retry]` - retry sends failed batch item to be retried (not just data)
- `[uploader]` - retried items are added as recycled items (keeping their original id)
- `[uploader]` - abort now runs un-started aborted items through same processing pipeline
- `[uploader]` - handles abort during item start event hander
- `[uploader]` - better handling of data cleanup inside internals
- `[upload-preview]` - rememberPreviousBatches merges items, not just concating
- `[upload-preview]` - upload preview provides item id and file name as part of PreviewComponent props

## 0.2.2

### Features

- `[upload-preview]` - added rememberPreviousBatches prop

### Bug fixes

- `[sender]` - fixed missing item abort event

## 0.2.1

### Features

- `[uploady]` - useAbortItem hook
- `[uploady]` - useAbortBatch hook
- `[uploady]` - useAbortAll hook

## 0.2.0

### Features

__Resumable Uploads__

- `[tus-sender]` _NEW_ - An Uploady sender implementation of the TUS protocol.
- `[tus-uploady]` _NEW_ - Wrapper&context component to expose and provide react-uploady functionality with TUS protocol support

__Misc__

- `[uploader]` - ITEM_FINALIZE event

- `[uploady]` - useItemFinalizeListener hook

- `[chunked-sender]` - startByte send option
- `[chunked-sender]` - createChunkedSender export
- `[chunked-sender]` - CHUNK_START event  (cancellable and update options)
- `[chunked-sender]` - CHUNK_FINISH event 

- `[safe-storage]` _NEW_ - safe (don't throw) versions of local and session storage

- `[shared]` - generic (xhr) request export
- `[shared]` - getMerge (undefinedOverwrites config) export
- `[shared]` - pick helper export 

- `[sender]` - sendWithFormData option


### Docs

- `[chunked-sender]` - added options to README

## 0.1.12

### Features

- `[shared-ui]` added _[processPending](packages/ui/uploady#processpending)_ function to UploadyContext ([#42](https://github.com/rpldy/react-uploady/pull/42))

### Chore & Maintenance

- `all` added description to all package.json files 

## 0.1.11

**EVERYTHING**
