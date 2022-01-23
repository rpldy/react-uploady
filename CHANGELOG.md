# Changelog

## 0.17.1 (2022-01-23)

### Bug fixes

- `[uploady]` - fix useBatchStartListener TS type signature

### Docs

- `storybook` - added two fields story to @rpldy/upload-preview

### Internal

- `all` - added funding info to package.json(s)  
- `scripts` - reworked release script and added more tasks (GH release, PR branch)


## 0.17.0 (2022-01-16)

### Features

- `[uploader]` - support async fileFilter

### Bug fixes

- `[tus-sender]` - remove content range header from parallel tus create request

### Docs

- `storybook` - upgrade to SB 6.4.10
- `storybook` - show released package versions in menu and stories

### Internal

- `all` - upgraded to latest flow (0.169.0)
- `all` - upgraded to Lerna 4.0.0

## 0.16.2 (2022-01-08)

### Bug fixes

- `[uploader]` - dev-time batch-progress event didn't update completed & loaded values 

## 0.16.1 (2022-01-01)

### Features

- `[uploady]` - allow stateful event hooks to use scope without callback

## 0.16.0 (2021-12-29)

### Features

- `[uploader]` - new events: BATCH_ERROR, BATCH_FINALIZE
- `[uploader]` - BATCH_START now accepts changes to items/options (similar to REQUEST_PRE_SEND event)
- `[uploady]` - new event hooks: useBatchErrorListener, useBatchFinalizeListener
- `[uploady]` - new HOC: withBatchStartUpdate
- `[upload-preview]` - ability to customize UploadPreview batch items method
- `[uploader]` - added new prop to Batch: additionalInfo
 
### Bug fixes

- `[uploader]` - fix concurrent uploads waiting for async event callbacks
- `[uploader]` - fix: correctly catch pre-req errors and process in queue

### Docs

- `guides` - new guide: Multi Crop
- `[upload-preview]` - add getUploadPreviewForBatchItemsMethod documentation
- `storybook` - exclude test purposes stories in external build
- `storybook` - use --modern for sb to use es modules
- `storybook` - upgrade to SB 6.3.12

## 0.15.0 (2021-11-22)

### Features

- `[uploady]` - introduce new prop: `formDataAllowUndefined` (default: false) to change new default to send undefined params in formData

### Bug fixes

- `[sender]` - stop sending (by default) undefined params as part of formData. Fix for [#263](https://github.com/rpldy/react-uploady/issues/263)

### Internal

- `all` - upgraded to latest flow (0.164.0), babel, and most other deps


## 0.14.2 (2021-11-04)

### Bug fixes

- `[upload-drop-zone]` - fix drop zone flickering when over child elements. Fix for [#256](https://github.com/rpldy/react-uploady/issues/256)

## 0.14.1 (2021-10-16)

### Bug fixes

- `[uploader]` - fix batch data potentially not having completed values when finished


## 0.13.6 (2021-10-07)

### Bug fixes

- `[tus-sender]` - fix bug in upload url when destination url is origin-less. Fix for [#246](https://github.com/rpldy/react-uploady/issues/246)


## 0.13.5 (2021-09-28)

### Bug fixes

- `[tus-sender]` - fix bug in upload url concatenate of absolute location header. Fix for [#242](https://github.com/rpldy/react-uploady/issues/242)

### Docs

- `storybook` - force story view mode


## 0.13.4 (2021-09-09)

### Bug fixes

- `[uploader]` - fix bug in deep proxy unwrap before trigger. Fix for [#232](https://github.com/rpldy/react-uploady/issues/232)

### Internal

- `all` - upgraded to latest flow (0.159.0)


## 0.13.3 (2021-07-29)

### Bug fixes

- `[chunked-sender]` - fix progress data calculation & add progress event on chunk finish. Fix for [#203](https://github.com/rpldy/react-uploady/issues/203) 

### Storybook

- `[chunked-sender]` - added first story with item, chunk-start,chunk-finish events logging

### Docs

- `root` - fix link to destination type & typo in README.md 

### Internal

- `all` - upgraded to latest flow (0.156.0)


## 0.13.2 (2021-06-26),
## 0.13.1 (2021-06-26)

### Bug fixes

- `[shared]` - fix "ReferenceError: process is not defined" error. [Fix for #199](https://github.com/rpldy/react-uploady/issues/199)


## 0.13.0 (2021-06-11)

### Features

- `[chunked-sender]` - BREAKING! - rename CHUNK_START event's `chunkCount` param to `remainingCount` 
  Also added `totalCount` param


## 0.12.1 (2021-05-28)

### Bug fixes

- `[uploady]` - fix typings for useFileInput (no params). Fix for [#181](https://github.com/rpldy/react-uploady/issues/181)

## 0.12.0 (2021-05-12)

### Features

- `[uploady]` - useFileInput hook now returns internal input

### Docs

- `guides` - new guide: CustomInput

### Internal

- `all` - upgraded to latest flow (0.150.1)
- `e2e` - upgrade to cypress.io latest (7.3.0)

## 0.11.6 (2021-05-01)

### Bug fixes

- `[shared-ui]` - fix useRequestPreSend typing to support return type: Promise<PreSendResponse | boolean>

## 0.11.5 (2021-04-29)

### Bug fixes

- `[shared-ui]` - fix useRequestPreSend typing to support boolean return. Fix for [#164](https://github.com/rpldy/react-uploady/issues/164)

### Docs

- `[uploady]` - fix useItemProgressListener description
- `[uploady]` - fix item event hooks descriptions

### Internal

- `all` - upgraded deps: flow (0.147.0), storybook (6.2.2), cypress (6.8.0), babel (7.13.14)

## 0.11.4 (2021-03-25)

### Bug fixes

- `[shared-ui]` - added typing to support async version of hook. Fix for [#158](https://github.com/rpldy/react-uploady/issues/158)

### Internal

- `all` - upgraded to lastest flow 0.146.0
- `storybook` - upgraded to SB 6.1.21

## 0.11.3 (2021-03-08)

### Bug fixes

- `[shared-ui]` - Warn about uploady context version mix (provider/consumer different versions)

## 0.11.2 (2021-03-07)

### Bug fixes

- `[chunked-sender]` - ensure offset is added to the loaded calculation so resume is also reflected in progress

## 0.11.1 (2021-03-05)

### Bug fixes

- `[shared]` - handle `prcoess.env` not available. Fix for [#149](https://github.com/rpldy/react-uploady/issues/149) 

## 0.11.0 (2021-03-04)

### Features

- `[upload-paste]` - NEW PACKAGE! easily add paste-to-upload to React components

### Docs

- `guides` - new guide: DragAndPaste

### Internal

- `all` - upgraded to lastest flow 0.145.0
- `storybook` - upgraded to SB 6.1.20

## 0.10.0 (2021-02-27)

### Features

- `[uploady]` - expose more TS types (shared, uploader, useFileInput, file&batch states)
- `[uploader]` - add server status code to batch item
- `[sender]` - new formatServerResponse option to customize uploadResponse added to batch item   

### Docs

- `[uploady]` - SendMethod link fix

### Bug fixes

- `[uploader]` - batch and items state corrupted. Fix for [#144](https://github.com/rpldy/react-uploady/issues/144)

### Internal

- `e2e` - upgrade to cypress.io latest (6.5.0)
- `e2e` - use cypress-intercept-formdata package

## 0.9.0 (2021-01-14)

### Features

- `[uploady]` - added _clearPending()_ to Uploady Context

### Bug fixes

- `[uploader]` - abort works for pending files and batches. Fix for [#119](https://github.com/rpldy/react-uploady/issues/119)

### Internal

- `[uploader]` - move pending batches into queue state
- `e2e` - added specs for pending uploads

### Removed

- `[uploader]` - removed _uploader.getPending()_

## 0.8.3 (2021-01-07)

### Bug fixes

- `[uploader]` - respect filesParamName in upload options. Fix for [#117](https://github.com/rpldy/react-uploady/issues/117)

### Internal

- `[retry]` - use item finalize event instead of error & abort
- `e2e` - added uploady custom filesParamName spec

## 0.8.2 (2020-12-09)

### Features

- `[uploader]` - new event ALL_ABORT
- `[uploady]` - new hook: useAllAbortListener

### Bug fixes

- `[chunked-sender]` - fixed abort flow for chunked sender. Fix for [#109](https://github.com/rpldy/react-uploady/issues/109)

### Internal

- `e2e` - added chunked abort spec

## 0.8.1 (2020-12-01)

## Bug fixes

- `[simple-state]` - fix: File object not available in ssr. Fix for [#106](https://github.com/rpldy/react-uploady/issues/106)

## 0.8.0 (2020-11-28)

### Features

- `[uploady]` - hook alias: useUploady for useUploadyContext
- `[sender]` - add file/url to form data last (after params). Fix for [#103](https://github.com/rpldy/react-uploady/issues/103)

### Docs

- `root` - fix typos in README.md

## 0.7.4 (2020-11-16)

### Bug fixes

- `all` - revert use of exports field (doesn't seem to play nice yet. Not until npm@7 at least probably)

## 0.7.3 (2020-11-16)

### Bug fixes

- `all` - fix exports field

## 0.7.2 (2020-11-14)

### Features

- `[sender]` - add extensibility capabilities to xhrSender
- `[sender]` - moved throw error on no URL to xhrSender (from uploader)

### Docs

- `[shared]` - improve fileFilter doc
- `[native-uploady]` - fix mistake in readme
- `all` - add exports field to all packages

## 0.7.1 (2020-10-22)

### Bug fixes

- `[uploader]` - recover from sender exception 
- `[chunked-sender]` - handle 0 byte file size. Fix for [#91](https://github.com/rpldy/react-uploady/issues/91) 

### Docs

- `[uploady]` - clarify file input options only affect uploads from FS selection dialog [#92](https://github.com/rpldy/react-uploady/issues/92)
- `guides` - new guide: Cloudinary

## 0.7.0 (2020-10-01)

### Features

- `[uploady]` - new hook: useUploadyContext
- `[uploady]` - processPending context method now accepts options
- `[uploader]` - new upload option - clearPending - clears pending batches when new is added
- `[chunked-sender]` - change chunked upload data to include results array inside response object (instead of response being the results array)

### Bug fixes

- `[tus-sender]` - location header inaccessible
- `[simple-state]` - unwrap issues

### Internal

- `[uploader]` - safer cleanUpFinishedBatch in batch helpers  
- `[tus-sender]` - remove async/await
- `[uploader]` - ensure all data exposed from events is unwrapped (in dev)
- `[life-events]` - introduce life-pack concept
- `build` - use minify-dead-code-elimination babel plugin
- `all` - moved umd bundle into lib/
- `all` - upgrade dev dependencies

### Docs

- `guides` - new guide: Submit Form

## 0.6.0 (2020-09-19)

### Features

#### Highlight: **SSR**

- `[uploader]` - SSR: dont use _window_ if not available
- `[shared]` - SSR: dont use _window_ if not available
- `[chunked-sender]` - SSR: dont use _window_ if not available
- `[safe-storage]` - SSR: dont use _window_ if not available
- `[uploady]` - SSR: _noPortal_ prop - Dont render Uploady's file input in a portal

- `all` - esm and cjs are both available in npm 

### Bug fixes

- `[uploader]` - fixed bug preventing retry item while its batch is still in progress

### Docs

- `[upload-button]` - clarified use of forwardRef for asUploadButton

### Internal

- `storybook` - upgraded to SB 6
- `misc` - removed use of async/await = no dependency on regenerator-runtime

## 0.5.0 (2020-09-13)

### Features

#### Highlight: **React Native**

- `[native-uploady]` - react-native: 📱 - new package.
- `[sender]` - react-native: work with FormData without set 
- `[shared]` - react-native: don't expect window to be there
- `[simple-state]` - react-native: don't proxy File-like object in RN
- `[uploader]` - react-native: don't expect window to be there
- `[shared-ui]` - react-native: NoDomUploady - Uploady without react-dom

- `[shared-ui]` - moved withRequestPreSendUpdate from ui/uploady
- `[shared-ui]` - moved useUploader from ui/uploady
 
### Bug fixes

- `[shared-ui]` - dont import code from @rpldy/uploady

### Internal

- moved non-ui packages to packages/core dir
- upgraded lerna

## 0.4.1 (2020-08-03)

### Bug fixes

- `[simple-state]` - unwrap doesn't handle nullish props

## 0.4.0 (2020-07-22)

### Features

- `[mock-sender]` - mock sender for testing purposes (moved out of sender)

### Bug fixes

- `[shared]` - getMerge with _withSymbols_
- `[simple-state]` - unwrap with symbol props

## 0.3.2 (2020-07-18)

### Features

- `[upload-drop-zone]` - UploadDropZone extraProps prop

## 0.3.1 (2020-07-06)

### Bug fixes

- `[upload-preview]` - isFallback isnt passed to preview
- `[tus-sender]` - include custom headers from destination

### Docs

- `[tus-sender]` - clarify params. explain headers override
- `[tus-uploady]` - clarify params. explain headers override

## 0.3.0 (2020-07-04)

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
- `e2e` - added queue-retry spec

### Docs

- `[uploady]` - document withRequestPreSendUpdate 
- `[simple-state]` - package readme
- `guides` - Crop guide
- `storybook` - added upload-preview with crop story
- `internal packages` - added "internal" note 

## 0.2.4 (2020-06-10)

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

## 0.2.3 (2020-06-05)

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

## 0.2.2 (2020-06-02)

### Features

- `[upload-preview]` - added rememberPreviousBatches prop

### Bug fixes

- `[sender]` - fixed missing item abort event

## 0.2.1 (2020-06-01)

### Features

- `[uploady]` - useAbortItem hook
- `[uploady]` - useAbortBatch hook
- `[uploady]` - useAbortAll hook

## 0.2.0 (2020-06-01)

### Features

#### Highlight: **Resumable Uploads**

- `[tus-sender]` - Resumable: An Uploady sender implementation of the TUS protocol.
- `[tus-uploady]` -  Resumable: Wrapper&context component to expose and provide react-uploady functionality with TUS protocol support

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

## 0.1.12 (2020-05-21)

### Features

- `[shared-ui]` added _[processPending](packages/ui/uploady#processpending)_ function to UploadyContext ([#42](https://github.com/rpldy/react-uploady/pull/42))

### Chore & Maintenance

- `all` added description to all package.json files 

## 0.1.11 (2020-05-04)

**EVERYTHING**
