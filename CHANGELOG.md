# Changelog

## 0.2.1

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
- `[chunked-sender]` - CHUNK_START event  
- `[chunked-sender]` - CHUNK_FINISH event (cancellable and update options)


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