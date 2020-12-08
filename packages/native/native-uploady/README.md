<a href="https://badge.fury.io/js/%40rpldy%2Fnative-uploady">
    <img src="https://badge.fury.io/js/%40rpldy%2Fnative-uploady.svg" alt="npm version" height="20"></a>
<a href="https://circleci.com/gh/rpldy/react-uploady">
    <img src="https://circleci.com/gh/rpldy/react-uploady.svg?style=svg" alt="circleci status"/></a>  
<a href="https://codecov.io/gh/rpldy/react-uploady">
    <img src="https://codecov.io/gh/rpldy/react-uploady/branch/master/graph/badge.svg" alt="codecov status"/></a> 
<a href="https://bundlephobia.com/result?p=@rpldy/native-uploady">
    <img src="https://badgen.net/bundlephobia/minzip/@rpldy/native-uploady" alt="bundlephobia badge"/></a>
<a href="https://react-uploady-storybook.netlify.com/?path=/story/native-uploady--simple">
   <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="rpldy storybook"/></a> 

# Native Uploady

This is the main UI package for React-Native. Its role is to initialize and expose the [uploader](../../core/uploader) functionality.
It contains the Provider that all other UI packages rely on.

It provides multiple hooks that enable more advanced features and data for client apps.

> The difference between this package and the main [Uploady](../../uploady) is that this one doesn't use react-dom (for obvious reasons) and does't create a file input element.

## Installation

```shell
#Yarn: 
   $ yarn add @rpldy/native-uploady

#NPM:
   $ npm i @rpldy/native-uploady
``` 

## Props

This package is just about identical to the main [Uploady](../../uploady) package. 
See Props documentation in the main readme.

> All props are identical besides the ones related to file input (ex: multiple, accept, etc.), which cannot be used with the native flavor.

## Example

To be able to use one of the [UI Components](../../../README.md#ui-packages) or one of the hooks, you need to wrap them with Uploady.
This will give them access to the UploadyContext.

```javascript
import React, { useCallback, useContext } from "react";
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

> See documentation for [events](../../ui/uploady#events)/[hooks](../../ui/uploady#hooks) and more in the main Uploady readme