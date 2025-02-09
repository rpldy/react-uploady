<a href="https://badge.fury.io/js/%40rpldy%2Fretry-hooks">
    <img src="https://badge.fury.io/js/%40rpldy%2Fretry-hooks.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/retry-hooks">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/retry-hooks" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/retry-hooks--with-retry">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 
   
# Retry-Hooks

This package exposes useful hooks for the [@rpldy/retry](https://react-uploady.org/docs/packages/rpldy-retry/) package which adds upload retry capabilities to the uploader.
 
It makes it easy to use retry from a React UI application.

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

<p align="center">
    <a href="https://www.buymeacoffee.com/yoav"> 
        <img width="700" alt="uploady-buy-me-coffee" src="https://github.com/user-attachments/assets/3a22cd82-94f8-4b79-8b1b-c783be5ecb88">
    </a>
</p>

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/retry-hooks

#NPM:
   $ npm i @rpldy/uploady @rpldy/retry-hooks
``` 

## Enabling Retry

To enable retries for your Uploady instance, you need to use the provided (uploader enhancer): `retryEnhancer`.

```javascript
import Uploady from "@rpldy/uploady";
import retryEnhancer from "@rpldy/retry-hooks";
import UploadButton from "@rpldy/upload-button";

const App = () => {
    return <Uploady 
              destination={{ url: "my-server.com/upload" }}
              enhancer={retryEnhancer}
           >
              <UploadButton/>
           </Uploady>;               
};

```

This will add the retry capability for failed uploads. 

See below how to use hooks in order to trigger a retry

## Events

Retry related events.

Registering to handle events can be done using the uploader's _on()_ and _once()_ methods.
Unregistering can be done using _off()_ or by the return value of both _on()_ and _once()_.

### RETRY_EVENT

Triggered when files are re-added to the queue for retry.

- Parameters: _({ uploads: BatchItem[], options?: UploadOptions })_  

> uploads is an array of batch items.
> options are the (optional) upload options that are passed to the retry call

## Hooks

### useRetry

Returns a retry function.

When called without a parameter, will attempt retry all failed uploads.
When called with a (id) parameter, will attempt retry for the failed batch-item identified by the id.

```javascript
import React from "react";
import { useRetry } from "@rpldy/retry-hooks";

const MyComponent = ( ) => {
    const retry = useRetry();

    const onClick = () => {
        retry("i-123");
    };

    return <button onClick={onClick}>retry item</button>;
};
```

### useBatchRetry 

Returns a batch retry function.

When called with a batch id, will attempt retry for all failed items in that batch.

```javascript
import React from "react";
import { useBatchRetry } from "@rpldy/retry-hooks";

const MyComponent = ( ) => {
    const retryBatch = useBatchRetry();

    const onClick = () => {
        retryBatch("b-123");
    };

    return <button onClick={onClick}>retry batch</button>;
};
```

### useRetryListener

Called when items are sent to be re-uploaded (retry)

see [RETRY_EVENT](#retry_event)

```javascript
import React from "react";
import { useRetryListener } from "@rpldy/retry-hooks";

const MyComponent = ( ) => {
    
    useRetryListener(({ items }) => {
        console.log("##### RETRY EVENT - retrying items: ", items);
    });

    return <div/>;
};
```

