<a href="https://opencollective.com/react-uploady">
    <img src="https://img.shields.io/opencollective/all/react-uploady?style=flat&logo=opencollective&label=Support%20us!&color=blue" alt="Support on Open Collective"/>
</a>
<a href="https://badge.fury.io/js/%40rpldy%2Fssimple-state">
    <img src="https://badge.fury.io/js/%40rpldy%2Fsimple-state.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/simple-state">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/simple-state" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.app/">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a>

# Simple State

> Internal package 
 
Deep proxies an object so it is only updateable through an update callback.
outside an updater, it is impossible to make changes
 
It only proxies simple objects (not maps or sets) and arrays

It doesnt create new references and doesnt copy over anything
 
Original object is changed!

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

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
   