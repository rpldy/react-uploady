<a href="https://opencollective.com/react-uploady">
    <img src="https://img.shields.io/opencollective/all/react-uploady?style=flat&logo=opencollective&label=Support%20us!&color=blue" alt="Support on Open Collective"/>
</a>
<a href="https://badge.fury.io/js/%40rpldy%2Fnative-uploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Fnative-uploady.svg" alt="npm version" height="20"></a>
<a href="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml">
        <img src="https://github.com/rpldy/react-uploady/actions/workflows/pr.yml/badge.svg" alt="Build Status"/></a>
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/native-uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/native-uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.app/?path=/docs/react-native-native-uploady--docs">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Native Uploady

This is the main UI package for React-Native. Its role is to initialize and expose the [uploader](https://react-uploady.org/docs/packages/rpldy-uploader/) functionality.
It contains the Provider that all other UI packages rely on.

It provides multiple hooks that enable more advanced features and data for client apps.

> The difference between this package and the main [Uploady](https://react-uploady.org/docs/api/) is that this one doesn't use react-dom (for obvious reasons) and doesn't create a file input element.

**The best place to get started is at our: [React-Uploady Documentation Website](https://react-uploady.org)**

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/native-uploady

#NPM:
   $ npm i @rpldy/native-uploady
``` 

## Props

This package is just about identical to the main [Uploady](https://react-uploady.org/docs/api/) package. 
See Props documentation in the main readme.

> All props are identical besides the ones related to file input (ex: multiple, accept, etc.), which cannot be used with the native flavor.

## Example

To be able to use one of the [UI Components](https://react-uploady.org/docs/category/components/) or one of the hooks, you need to wrap them with Uploady.
This will give them access to the UploadyContext.

```javascript
import React, { useCallback } from "react";
import { View, Button } from "react-native";
import DocumentPicker from "react-native-document-picker/index";
import NativeUploady from "@rpldy/native-uploady";

const Upload = () => {

  const pickFile = useCallback(async () => {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });

      uploadyContext.upload(res);
  }, [uploadyContext]);

    return <View>
               <Button title="Upload File" onPress={pickFile} />
          </View>;
};

const App = () => (<NativeUploady    
    grouped
    maxGroupSize={2}
    method="PUT"
    destination={{url: "https://my-server", headers: {"x-custom": "123"}}}>
    
    <Upload/>
    <RestOfMyApp/>
</NativeUploady>)

```

## Documentation

> See documentation for [events](https://react-uploady.org/docs/api/events/)/[hooks](https://react-uploady.org/docs/category/hooks/) and more in the main Uploady readme