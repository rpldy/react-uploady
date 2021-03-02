<a href="https://badge.fury.io/js/%40rpldy%2Fupload-paste">
    <img src="https://badge.fury.io/js/%40rpldy%2Fupload-paste.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/upload-paste">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/upload-paste" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/upload-paste--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Upload Paste

Its main feature is the `withPaste` HOC, which allows any component to become a trigger of paste-to-upload.
A user pasting (ctrl/cmd+v) a file while focused on the element will trigger an upload 


## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/uploady @rpldy/upload-paste 

#NPM:
   $ npm i @rpldy/uploady @rpldy/upload-paste   
``` 


## Props

| Name (* = mandatory) | Type          | Default       | Description
| --------------       | ------------- | ------------- | -------------
| id             | string            | undefined | id attribute to pass to the button element
| className      | string            | undefined | the class attribute to pass to the button element
| children       | React.Node        | undefined | child element(s) to render inside the button (replaces text)
| extraProps     | Object            | undefined | any other props to pass to the wrapped component (with spread)
| ref            | React ref         | undefined | will be passed to the button element to acquire a ref
| onUploadPaste  | [PasteUploadEventHandler](src/types.js#L8) | undefined | function called when paste to upload occurs


## Example
