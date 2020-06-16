<a href="https://badge.fury.io/js/%40rpldy%2Fsupdateable">
    <img src="https://badge.fury.io/js/%40rpldy%2Fupdateable.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/updateable">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/updateable" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a>

# Updateable

> Internal package 
 
Deep proxies an object so it is only updateable through an update callback.
outside an updater, it is impossible to make changes
 
It only proxies simple objects (not maps or sets) and arrays

It doesnt create new references and doesnt copy over anything
 
Original object is changed!
 
## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/updateable 

#NPM:
   $ npm i @rpldy/updateable
``` 

## Example

```javascript
import makeUpdateable from "@rpldy/updateable"

const { state, update } = makeUpdateable({
    arr: [1,2,3]
});

state.arr.push(4);
console.log(state.arr); // print [1,2,3]

update((state) => {
    state.arr.push(4);
});

console.log(state.arr); // print [1,2,3,4]

```
   