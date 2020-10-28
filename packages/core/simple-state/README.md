<a href="https://badge.fury.io/js/%40rpldy%2Fssimple-state">
    <img src="https://badge.fury.io/js/%40rpldy%2Fsimple-state.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/simple-state">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/simple-state" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a>

# Simple State

> Internal package 
 
Deep proxies an object so it is only updateable through an update callback.
outside an updater, it is impossible to make changes
 
It only proxies simple objects (not maps or sets) and arrays

It doesnt create new references and doesnt copy over anything
 
Original object is changed!
 
## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/simple-state 

#NPM:
   $ npm i @rpldy/simple-state
``` 

## Important!

**All exports of this package are considered internal API and may change/disappear in any version: patch/minor/major**

## Example

```javascript
import createState from "@rpldy/simple-state"

const { state, update } = createState({
    arr: [1,2,3]
});

state.arr.push(4);
console.log(state.arr); // print [1,2,3]

update((state) => {
    state.arr.push(4);
});

console.log(state.arr); // print [1,2,3,4]

```
   