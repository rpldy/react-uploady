<a href="https://opencollective.com/react-uploady">
    <img src="https://img.shields.io/opencollective/all/react-uploady?style=flat&logo=opencollective&label=Support%20us!&color=blue" alt="Support on Open Collective"/>
</a>
<a href="https://badge.fury.io/js/%40rpldy%2Fmock-sender">
    <img src="https://badge.fury.io/js/%40rpldy%2Fmock-sender.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/mock-sender">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/mock-sender" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.app/?path=/docs/core-mock-sender--docs">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Mock Sender

Provides a mock sender that can be used to replace a real sender for testing purposes.

It provides the same interface and events so the Uploader is unaware of its use.

On-progress events and abort functionality are supported

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/mock-sender

#NPM:
  $ npm i @rpldy/mock-sender
``` 

## Options

| Name (* = mandatory) | Type                                                                           | Default                         | Description                                                                                                                 |
|----------------------|--------------------------------------------------------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| delay                | number                                                                         | 500                             | time in ms for mocked upload to take                                                                                        |
| fileSize             | number                                                                         | undefined                       | file size of the mocked upload, used for progress calculation, by default, the actual file size, if available, will be used | 
| progressIntervals    | number[]                                                                       | [10, 25, 50, 75, 90]            | mock intervals (percentages) to emit progress events at                                                                     |
| response             | any                                                                            | {"mock": true, "success": true} | mock response for upload request                                                                                            |
| responseStatus       | number                                                                         | 200                             | upload request status code                                                                                                  |
| isSuccessfulCall     | [IsSuccessfulCall](https://react-uploady.org/docs/api/types/#issuccessfulcall) | undefined                       | callback to use to decide whether upload response is succssful or not                                                       |

## Usage

```javascript
import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import { getMockSenderEnhancer } from "@rpldy/mock-sender";

const mockSenderEnhancer = getMockSenderEnhancer({
   delay: 1500, 
   progressIntervals: [20, 40, 75, 80, 90, 99]               
});

const App = () => (
    <Uploady
        enhancer={mockSenderEnhancer}
    >
        <UploadButton />
    </Uploady>
);
```

