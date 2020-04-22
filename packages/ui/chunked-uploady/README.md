<a href="https://badge.fury.io/js/%40rpldy%2Fchunked-uploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Fchunked-uploady.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/chunked-uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/chunked-uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/chunked-uploady--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Chunked Uploady

This package is identical to the main [Uploady](../uploady) package. It's provided as a convenient alternative
to be used in case chunked upload support is needed. 

When using Chunked-Uploady, there is no need to also use Uploady.



@rpldy/chunked-uploady

doesnt support grouped uploads (in single XHR equest) or URL uploading. 
These will be handed over to the default [@rpldy/sender]()

will enable chunked uploads only if the browser supports it.