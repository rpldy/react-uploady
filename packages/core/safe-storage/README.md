<a href="https://opencollective.com/react-uploady">
    <img src="https://img.shields.io/opencollective/all/react-uploady?style=flat&logo=opencollective&label=Support%20us!&color=blue" alt="Support on Open Collective"/>
</a>
<a href="https://badge.fury.io/js/%40rpldy%2Fssafe-storage">
    <img src="https://badge.fury.io/js/%40rpldy%2Fsafe-storage.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/safe-storage">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/safe-storage" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.app/">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a>
   
   
# Safe Storage

> Internal package 

provides safe versions of localStorage and sessionStorage that don't throw because
of browser issues like safari in private mode.

exposes the same storage API as the browser's API - 

- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage

In case storage isn't supported, the same API is available but will be replaced with no-op versions.

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/safe-storage

#NPM:
   $ npm i @rpldy/safe-storage
``` 

## Important!

**All exports of this package are considered internal API and may change/disappear in any version: patch/minor/major**


## Example

```javascript
import { safeLocalStorage } from "@rpldy/safe-storage";

safeLocalStorage.setItem("test", "value");

const stored = safeLocalStorage.getItem("test");

safeLocalStorage.removeItem("test");
```
