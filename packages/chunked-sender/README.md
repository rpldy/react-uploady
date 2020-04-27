<a href="https://badge.fury.io/js/%40rpldy%2Fchunked-sender">
    <img src="https://badge.fury.io/js/%40rpldy%2Fchunked-sender.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/chunked-sender">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/chunked-sender" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Chunked Sender

Adds chunked upload capabilities on top of the regular XHR [@rpldy/sender](../sender)
Exposes an UploaderEnhancer that replaces the default send method the [uploader](../uploader) uses.

For usage with your React app, see [@rpldy/chunked-uploady](../ui/chunked-uploady).

Doesnt support grouped uploads (in single XHR equest) or URL uploading. 
These will be handed over to the default [@rpldy/sender]()

## Installation

```shell
#Yarn:
  $ yarn add @rpldy/chunked-sender

#NPM:
  $ npm i @rpldy/chunked-sender
``` 
