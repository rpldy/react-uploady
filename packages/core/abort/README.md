<a href="https://opencollective.com/react-uploady">
    <img src="https://img.shields.io/opencollective/all/react-uploady?style=flat&logo=opencollective&label=Support%20us!&color=blue" alt="Support on Open Collective"/>
</a>
<a href="https://badge.fury.io/js/%40rpldy%2Fabort">
    <img src="https://badge.fury.io/js/%40rpldy%2Fabort.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/abort">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/abort" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.app">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Abort

Adds the capability to abort/cancel running & pending uploads

This is an internal package the uploader consumes.

Abort exposes an UploaderEnhancer that adds the abort methods to the Uploader Options.

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/abort

#NPM:
  $ npm i @rpldy/abort
```

## Normal vs. Fast Abort

When the number of pending/active uploads is less than the configured threshold (fastAbortThreshold param) or when the threshold is turned off (equals 0), _normal_ abort flow will be used.

In case the threshold is configured and the item count is equal or larger, the _fast_ abort flow will be used.

For All Abort, the threshold is compared against the total number of pending/active items
For Batch Abort, the threshold is compared against the number of pending/active items in the batch. 

In both cases, finished items are ignored in the comparison.

### Normal

**Normal** flow means that every item whether its already uploading or still pending will be individually aborted and an "ITEM_ABORT" event will be fired. 
For abort all, "BATCH_ABORT" event will also be fired respectively. 


### Fast

**Fast** flow means that only active uploads are cancelled (typically very few as concurrent count is set to 1 by default). 

Pending items are ignored and are simply removed from the queue by the uploader. 
For abort all, "BATCH_ABORT" events will not be fired and no "ITEM_ABORT" event will be fired for pending items. 

