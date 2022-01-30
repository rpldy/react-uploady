<a href="https://badge.fury.io/js/%40rpldy%2Fmock-sender">
    <img src="https://badge.fury.io/js/%40rpldy%2Fmock-sender.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/mock-sender">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/mock-sender" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Mock Sender

Provides a mock sender that can be used to replace a real sender for testing purposes.

It provides the same interface and events so the Uploader is unaware of its use.

On-progress events and abort functionality are supported

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/mock-sender

#NPM:
  $ npm i @rpldy/mock-sender
``` 

## Options

| Name (* = mandatory) | Type    | Default       | Description  |
| -------------- | ------------- | ------------- | -------------|
| delay          | number        | 500           | time in ms for mocked upload to take|
| fileSize       | number        | 1e+6          | file size of the mocked upload, used for progress calculation| 
| progressIntervals | number[]   | [10, 25, 50, 75, 100] | mock intervals (percentages) to emit progress events at|
| response       | any           |  {"mock": true, "success": true} | mock response for upload request|
| responseStatus | number        | 200           | upload request status code|

## Usage

```javascript
import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import { getMockSenderEnhancer } from "@rpldy/mock-sender";

const mockSenderEnhancer = getMockSenderEnhancer({
   delay: 1500, 
   progressIntervals: [20, 40, 75, 80, 90, 99]               
});

const App = () => <Uploady 
         destination={{ url: "mock-url"}}            
         enhancer={mockSenderEnhancer}
        >
            <UploadButton />
        </Uploady>;
```

