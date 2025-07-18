# Changelog

## 1.11.0 (2025-07-18)

### Docs

- `all` - add support badges in readmes
  
### Internal

- `all` - upgrade several dev deps



## 1.10.0 (2025-04-18)

### Features

- `[upload-drop-zone]` - feat: allow full control over drag handling

### Bug fixes

- `[uploader]` - fix: get batchOptions from itemBatchOptions in processFinishedRequest. Fix for [#831](https://github.com/rpldy/react-uploady/issues/831) (thanks [alc0034](https://github.com/alc0034))
- `[tus-sender]` - fix: pass destination headers in tus finalize request. Fix for [#836](https://github.com/rpldy/react-uploady/836)

### Internal

- `all` - upgrade several dev deps


## 1.9.1 (2025-01-07)

### Bug fixes

- `[shared]` - __SECURITY__ protect against prototype pollution when working with objects (merge/clone)

### Docs

- `[upload-drop-zone]` - fixing minor spelling mistake. (thanks @raybooysen)

### Internal

- `all` - upgrade dev deps


## 1.9.0 (2024-12-13)

### Features

- `[mock-sender]` - feat: include url in mock-sender response data

### Bug fixes

- `[tus-sender]` - big refactor to handling parallel tus requests. Avoid 431 Request Header Fields Too Large error. Fix for [#777](https://github.com/rpldy/react-uploady/issues/777)
- `[tus-sender]` - fix: tus not handling correctly sendOnCreate with file smaller than chunk. Fix for [#759](https://github.com/rpldy/react-uploady/issues/759)
- `[chunked-sender]` - respect parallel value while including in-progress
- `[chunked-uploady]` - fix: prevent pollution batch options in requestPreSend. Fix for [#758](https://github.com/rpldy/react-uploady/issues/758)
- `[upload-paste]` - fix: typings for usePasteUpload hook

### Internal

- `all` - upgrade most dev deps
- `ci` - fix incorrect calculation of diff in bundle-size report

### Docs

- `[uploader]` - readme improvements
- `all` - modify all internal README links to point to docs site resources
- `storybook` - bring back package READMEs inside storybook
- `storybook` - upgrade to SB 8.4
- `docs` - readme: add new contributor


## 1.9.0-rc.2 (2024-12-08)

### Bug fixes

- `[tus-sender]` - big refactor to handling parallel tus requests. Avoid 431 Request Header Fields Too Large error. Fix for [#777](https://github.com/rpldy/react-uploady/issues/777)
- `[chunked-sender]` - respect parallel value while including in-progress

### Internal

- `all` - upgrade most dev deps
- `ci` - fix incorrect calculation of diff in bundle-size report 


## 1.9.0-rc.1 (2024-11-10)

### Bug fixes

- `[tus-sender]` - fix: tus not handling correctly sendOnCreate with file smaller than chunk. Fix for [#759](https://github.com/rpldy/react-uploady/issues/759)

### Docs

- `all` - modify all internal README links to point to docs site resources
- `storybook` - bring back package READMEs inside storybook
- `storybook` - upgrade to SB 8.4

### Internal

- `all` - upgrade several dev deps (security)


## 1.9.0-rc.0 (2024-11-04)

### Features

- `[mock-sender]` - feat: include url in mock-sender response data 
  
### Bug fixes

- `[chunked-uploady]` - fix: prevent pollution batch options in requestPreSend. Fix for [#758](https://github.com/rpldy/react-uploady/issues/758)
- `[upload-paste]` - fix: typings for usePasteUpload hook

### Docs

- `[uploader]` - readme improvements
- `docs` - readme: add new contributor

### Internal

- `all` - upgrade several dev deps


## 1.8.3 (2024-08-19)

### Bug fixes

- `[chunked-uploady]` - fix: typings for chunk events hooks, to accept promise return type. Fix for [#726](https://github.com/rpldy/react-uploady/issues/726)

### Internal

- `ci` - parallelize e2e test runs and create weights file based on timings for optimized future runs

 
## 1.8.2 (2024-07-30)

### Features

- `[ui-shared]` - feat: improve uploady props extendability. Fix for [#710](https://github.com/rpldy/react-uploady/issues/710).

### Internal

- `ci` - move build & PR verification from circle-ci to github
- `all` - upgrade several dev deps


## 1.8.1 (2024-05-16)

### Bug fixes

- `[tus-sender]` - for parallel send partial upload-concat header on create. Fix for [#685](https://github.com/rpldy/react-uploady/issues/685)

### Internal

- `all` - upgrade several dev deps
  

## 1.8.0 (2024-02-22)

### Features

- `[upload-preview]` - expose getPreviewsLoaderHook. ER [#646](https://github.com/rpldy/react-uploady/issues/646).

### Bug fixes

- `[upload-drop-zone]` - fix drag&drop over child elements. Fix for [#652](https://github.com/rpldy/react-uploady/issues/652).

### Internal

- `all` - upgrade most deps to latest (flow, lerna, vite, etc.)
  

## 1.8.0-rc.0 (2024-02-21)

### Features

- `[upload-preview]` - expose getPreviewsLoaderHook. ER [#646](https://github.com/rpldy/react-uploady/issues/646).

### Bug fixes

- `[upload-drop-zone]` - fix drag&drop over child elements. Fix for [#652](https://github.com/rpldy/react-uploady/issues/652).

### Internal

- `all` - upgrade most deps to latest


## 1.7.1 (2023-12-20)

### Bug fixes

- `[shared-ui]` - async callbacks TD for cancellable event hooks


## 1.7.0 (2023-12-17)

### Bug fixes

- `[mock-sender]` - align progress tracking with file size if available. Fix for [#626](https://github.com/rpldy/react-uploady/issues/626).
- `[mock-sender]` - BREAKING(ish): removed default file size field from defaults in favour of above fix

### Docs

- `storybook` - add story for mock-sender
- `storybook` - add progress story for uploader

### Internal

- `all` - upgrade vite & vitest
- `all` - upgrade flow to latest (0.223.2)
- `all` - upgrade dev deps including lerna (8.0.0)


## 1.7.0-rc.1 (2023-12-10)

### Internal

- `all` - upgrade dev deps including lerna (8.0.0)


## 1.7.0-rc.0 (2023-12-03)

### Bug fixes

- `[mock-sender]` - align progress tracking with file size if available. Fix for [#626](https://github.com/rpldy/react-uploady/issues/626).
- `[mock-sender]` - BREAKING(ish): removed default file size field from defaults in favour of above fix

### Docs

- `storybook` - add story for mock-sender

### Internal

- `all` - upgrade vite & vitest
- `all` - upgrade flow to latest (0.223.2)


## 1.6.1 (2023-11-12)

### Docs

- `docs` - fix link to guides on react-uploady.org (thanks @CanRau)
- `docs` - readme: switch links to doc site instead of gh
- `docs` - publish storybook site to netlify from GH flow

### Internal

- `[chunked-sender]` - rename internal fn 'process' so doesnt conflict with online sandbox providers
- `root` - switch to pnpm from yarn
- `root` - switch to codecov orb
- `all` - remove flow-copy-source
- `all` - remove export (flow) types


## 1.6.1-rc.2 (2023-11-11)

_PRE-RELEASE_

### Docs

- `docs` - publish storybook site to netlify from GH flow

### Internal

- `all` - remove flow-copy-source


## 1.6.1-rc.1 (2023-10-30)

_PRE-RELEASE_

### Internal

- `all` - remove export (flow) types


## 1.6.1-rc.0 (2023-10-30)

_PRE-RELEASE_

### Docs

- `docs` - fix link to guides on react-uploady.org (thanks @CanRau)

### Internal

- `[chunked-sender]` - rename internal fn 'process' so doesnt conflict with online sandbox providers
- `root` - switch to pnpm from yarn
- `root` - switch to codecov orb


## 1.6.0 (2023-10-09)

### Features

- `[chunked-sender]` - feat: expose chunk error to item response data. fix for [#597](https://github.com/rpldy/react-uploady/issues/597) -

  > Technically **breaking change** (only for ChunkedUploady / Chunked-Sender users) as item's responseData for failed chunked upload will now be different than it was.

### Internal

- `all` - upgrade dev deps (ex: flow, eslint, storybook, and more)
- `all` - removed flow-mono-cli


## 1.6.0-rc.0 (2023-10-08)

_PRE-RELEASE_

### Features

- `[chunked-sender]` - feat: expose chunk error to item response data. Fix for [#597](https://github.com/rpldy/react-uploady/issues/597) -

  > Technically **breaking change** (only for ChunkedUploady / Chunked-Sender users) as item's responseData for failed chunked upload will now be different than it was.

### Internal

- `all` - upgrade dev deps (ex: flow, eslint, storybook, and more)


## 1.5.0 (2023-09-14)

### Features

- `[uploader]` - feat: support optional user data (client-side only). Fix for [#547](https://github.com/rpldy/react-uploady/issues/547)
- `[uploader]` - feat: expose upload total size for progress event, by @rickythink

### Bug fixes

- `[uploader]` - fix: improve batch upload progress data for smoother progress. Fix for [#546](https://github.com/rpldy/react-uploady/issues/546)

### Docs

- `storybook` - upgrade to SB 7.4
- `root` - created Security.MD guideline

### Internal

- `all` - upgrade dev deps (jest, babel, flow, lerna!, and more)
- `all` - release from GH workflow
- `story-helpers` - removed unmaintained react-load-script dep


## 1.5.0-rc.5 (2023-09-10)

_PRE-RELEASE_

### Features

- `[uploader]` - feat: support optional user data (client-side only). Fix for [#547](https://github.com/rpldy/react-uploady/issues/547)
- `[uploader]` - feat: expose upload total size for progress event, by @rickythink

### Bug fixes

- `[uploader]` - fix: improve batch upload progress data for smoother progress. Fix for [#546](https://github.com/rpldy/react-uploady/issues/546)

### Docs

- `storybook` - upgrade to SB 7.4
- `root` - created Security.MD guideline

### Internal

- `all` - upgrade dev deps (jest, babel, flow, lerna!, and more)
- `all` - release from GH workflow 


## 1.4.1 (2023-03-22)

### Bug fixes

- `[ui-shared]` - add globalThis to avoid error on edge runtime. Fix for [#495](https://github.com/rpldy/react-uploady/issues/495)

### Internal

- `all` - misc upgrade dev deps


## 1.4.1-rc.0 (2023-03-18)

_PRE-RELEASE_

### Bug fixes

- `[ui-shared]` - add globalThis to avoid error on edge runtime. Fix for [#495](https://github.com/rpldy/react-uploady/issues/495)

### Internal

- `all` - misc upgrade dev deps


## 1.4.0 (2023-02-18)

### Features

- `[tus-sender]` - added new event tus RESUME_START to: cancel or update relevant props for resume
- `[tus-sender]` - accept resume headers in tus options
- `[tus-uploady]` - added useTusResumeStartListener hook to handle RESUME_START event in React
- `[upload-preview]` - added removePreview to preview methods to clear a single item preview

### Bug fixes

- `[uploader]` - fix bug with cancel from BATCH_ADD doesnt clean batch from state. Fix for [#472](https://github.com/rpldy/react-uploady/issues/472)
- `[uploader]` - fix bug with item handling after async batch start ([c5ed0dd](c5ed0dd2281d240add02db41aaa1ce10cec90d17))

### Docs

- `root` - Update gzip sizes table in readme

### Internal

- `all` - upgrade dev deps (jest, babel, flow, lerna!, and more)
- `all` - misc upgrade dev deps


## 1.4.0-rc.1 (2023-02-16)

_PRE-RELEASE_

### Bug fixes

- `[uploader]` - fix bug with cancel from BATCH_ADD doesnt clean batch from state. Fix for [#472](https://github.com/rpldy/react-uploady/issues/472)

### Internal

- `all` - misc upgrade dev deps


## 1.4.0-rc.0 (2023-02-12)

_PRE-RELEASE_

### Features

- `[tus-sender]` - added new event tus RESUME_START to: cancel or update relevant props for resume
- `[tus-sender]` - accept resume headers in tus options
- `[tus-uploady]` - added useTusResumeStartListener hook to handle RESUME_START event in React
- `[upload-preview]` - added removePreview to preview methods to clear a single item preview
- 
### Bug fixes

- `[uploader]` - fix bug with item handling after async batch start ([c5ed0dd](c5ed0dd2281d240add02db41aaa1ce10cec90d17))

### Docs

- `root` - Update gzip sizes table in readme

### Internal

- `all` - upgrade dev deps (jest, babel, flow, lerna!, and more)


## 1.3.1 (2023-01-11)

### Docs

- `[shared]` - TS: add missing options param for batch_add


## 1.3.0 (2022-11-24)

### Features

- `[upload-drop-zone]` - add getFiles helper to dropHandler callback
- `[upload-drop-zone]` - add new prop - shouldHandleDrag to control whether DnD is enabled or not
- `[upload-drop-zone]` - add new prop - enableOnContains to opt-out of contained check
  and only enable on direct drag to container element

### Bug fixes

- `[uploader]` - fix missing params for fileFilter callback. Fix for [#425](https://github.com/rpldy/react-uploady/issues/425)
- `[uploader]` - fix fileFilter called incorrectly for recycled (retry) items
- `[uploady]` - fix webkitdirectory prop accepted as boolean (not string)
- `[upload-drop-zone]` - fix how drag handling is enabled
- `[mock-sender]` - add missing props to MockOptions TS interface

### Docs

- `root` - Fix some spelling problems and typos (by @0x111)

### Internal

- `[shared]` - add isEmpty util


## 1.3.0-rc.3 (2022-11-13)

### Bug fixes

- `[uploader]` - fix missing params for fileFilter callback. Fix for [#425](https://github.com/rpldy/react-uploady/issues/425) 


## 1.3.0-rc.2 (2022-11-06)

### Bug fixes

- `[uploader]` - fix fileFilter called incorrectly for recycled (retry) items
- `[mock-sender]` - add missing props to MockOptions TS interface


## 1.3.0-rc.1 (2022-11-06)

### Features

- `[upload-drop-zone]` - add new prop - enableOnContains to opt-out of contained check
  and only enable on direct drag to container element

### Bug fixes

- `[upload-drop-zone]` - fix how drag handling is enabled


## 1.3.0-rc.0 (2022-11-05)

### Features

- `[upload-drop-zone]` - add getFiles helper to dropHandler callback
- `[upload-drop-zone]` - add new prop - shouldHandleDrag to control whether DnD is enabled or not

### Docs

- `root` - Fix some spelling problems and typos (by @0x111)

### Internal

- `[shared]` - add isEmpty util


## 1.2.0 (2022-10-24)

### Bug fixes

- `[retry-hooks]` - fix TS types for retry hooks and event. Fix for [#407](https://github.com/rpldy/react-uploady/issues/407)


## 1.1.0 (2022-08-28)

### Features

- `[uploader]` - support fast abort flow (for many items) using new threshold param: fastAbortThreshold

### Internal

- `[abort]` - new package: adds the capability to abort/cancel running & pending uploads
- `[raw-uploader]` - new package: placeholder package, containing only types


## 1.1.0-rc.1 (2022-08-23) 

_PRE-RELEASE_

### Internal

- `[abort]` - calculate fast mode based on item queue count


## 1.1.0-rc.0 (2022-08-21)

_PRE-RELEASE_

### Features

- `[uploader]` - support fast abort flow (for many items) using new threshold param: fastAbortThreshold

### Internal

- `[abort]` - new package: adds the capability to abort/cancel running & pending uploads
- `[raw-uploader]` - new package: placeholder package, containing only types

 
## 1.0.1 (2022-07-19)

### Bug fixes

- `[uploader]` - fix abort with async prepare. fix for [#379](https://github.com/rpldy/react-uploady/issues/379)

### Docs

- `[uploady]` - fix Uploady package README typo

### Internal

- `all` - upgrade dev deps (eslint, jest, babel, webpack, flow, and more)


## 1.0.0 (2022-05-23)

**YAY!**

React-Uploady is finally 1.0.0 

> No changes from previous version

## 0.18.3 (2022-05-11)

### Bug fixes

- `[upload-button]` - added missing onClick prop TS definition

### Docs
 
- `root` - add financial contributors to main readme
- `storybook` - upgrade to SB 6.4.22

### Internal

- `all` - upgraded to latest flow (0.176.3)
- `all` - updated website URL in all package.json files 


## 0.18.2 (2022-04-11)

### Features

- `[upload-drop-zone]` - new prop: shouldRemoveDragOver. Fix for [#354](https://github.com/rpldy/react-uploady/issues/354)

### Docs

- `storybook` - set canvas (preview) fav icon


## 0.18.1 (2022-04-02)

### Features

- `[mock-sender]` - new option: isSuccessfulCall to customize logic whether request was successful or not


## 0.18.0 (2022-03-12)

### Features

- `[sender]` - new option: isSuccessfulCall to customize logic whether request was successful or not

### Internal

- `all` - upgrade eslint & ts-eslint


## 0.17.5 (2022-02-18)

### Bug fixes

- `[chunked-sender]` - fix broken chunking in dev time. Fix for [#339](https://github.com/rpldy/react-uploady/issues/339)

### Internal

- `e2e` - upgrade to cypress.io latest (9.5.0) + remove cypress-file-upload


## 0.17.4 (2022-02-11)

### Docs

- `storybook` - set canvas HTML title

### Internal 

- `[chunked-sender]` - use @rpldy/simple-state for internal state
- `scripts` - upgrade typescript to latest

## 0.17.3 (2022-02-06)

### Docs

- `[uploader]` - add info about clearPendingOnAdd
- `storybook` - upgrade to latest SB 6.4.18
- `storybook` - turn welcome story into a doc page
- `storybook` - add brand link to docs site
- `storybook` - make version badge inside story link to npm

### Internal

- `all` - upgrade to webpack 5 (bundle + storybook)
- `all` - add docs site as homepage in all package.jsons

## 0.17.2 (2022-02-01)

### Bug fixes

- `[upload-url-input]` - fix ValidateMethod types
- `[uploader]` - expose FILE_STATES & BATCH_STATES constants
- `[uploady]` - expose FILE_STATES & BATCH_STATES constants

### Docs

- `all` - added link to new docs site: https://react-uploady.netlify.app
- `guides` - removed - point to docs site section: https://react-uploady.netlify.app/docs/category/guides

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
