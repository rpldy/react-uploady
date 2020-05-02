// import React, { useCallback, useState, useRef } from "react";
// import {
//     UmdBundleScript,
//     localDestination,
//     UMD_BUNDLES,
//     addActionLogEnhancer
// } from "../../../story-helpers";
//
// // $FlowFixMe - doesnt understand loading readme
// // import readme from "./README.md";
//
// export const UMD_CoreUI = () => {
//     const [Uploady, setUploady] = useState(null);
//
//     const onBundleLoad = useCallback(() => {
//         console.log(window.rpldy);
//         // uploaderRef.current = window.rpldy.createUploader({
//         //     destination: localDestination().destination,
//         //     enhancer: addActionLogEnhancer(),
//         // });
//         //
//         // setUploaderReady(true);
//     }, []);
//
//
//     return <div>
//         {/*<UmdBundleScript bundle={UMD_BUNDLES.CORE_UI} onLoad={onBundleLoad}/>*/}
//
//
//     </div>;
// };
// // <input type="file" ref={inputRef} style={{ display: "none" }}
// //        onChange={onInputChange}/>
// //
// // {uploaderReady && <button id="upload-button" onClick={onClick}>Upload</button>}
//
//
// export default {
//     title: "Uploady",
//     parameters: {
//         // readme: {
//         //     sidebar: readme,
//         // },
//         options: {
//             showPanel: true,
//             //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
//             theme: {}
//         },
//     },
// };
