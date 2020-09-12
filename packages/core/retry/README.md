<a href="https://badge.fury.io/js/%40rpldy%2Fretry">
    <img src="https://badge.fury.io/js/%40rpldy%2Fretry.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/retry">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/retry" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Retry

Adds the capability to retry failed uploads.
Retry monitors items that have failed due to error or abort.

Retry exposes an UploaderEnhancer that adds the retry extension.

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/retry

#NPM:
  $ npm i @rpldy/retry
``` 

## Usage

For usage with your React app, see [@rpldy/retry-hooks](../ui/retry-hooks).

manual usage (outside React) is less practical as it requires familiarity with the internals of this package
which is unadvisable at the moment.
