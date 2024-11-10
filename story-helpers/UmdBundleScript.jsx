import React, { useState, memo } from "react";
import useScript from "./useScript"
import { UMD_NAMES } from "./consts";

const BASE = "http://localhost:8009/",
    POLYFILLS = `${BASE}polyfills-bundle.js`,
    ALL_POLYFILLS = `${BASE}polyfills-all-bundle.js`;

const UMD_BUNDLES = {
    [UMD_NAMES.CORE]: `${BASE}rpldy-core.umd.min.js`,
    [UMD_NAMES.CORE_UI]: `${BASE}rpldy-ui-core.umd.min.js`,
    [UMD_NAMES.CORE_CHUNKED_UI]: `${BASE}rpldy-ui-core-chunked.umd.min.js`,
    [UMD_NAMES.ALL]: `${BASE}rpldy-all.umd.min.js`,
};

const POLYFILLS_MAP = {
    [UMD_NAMES.CORE]: POLYFILLS,
    [UMD_NAMES.CORE_UI]: POLYFILLS,
    [UMD_NAMES.CORE_CHUNKED_UI]: POLYFILLS,
    [UMD_NAMES.ALL]: ALL_POLYFILLS,
};

export default memo(({ bundle, onLoad }) => {
    const [polyfillReady, setPolyfillReady] = useState(false);
    const [scriptReady, setScriptReady] = useState(false);

    useScript(POLYFILLS_MAP[bundle], setPolyfillReady);

    useScript(polyfillReady ? UMD_BUNDLES[bundle]: null, () => {
        setScriptReady(true);
        setTimeout(onLoad, 2000);
    });

    return <>
        <p>
            Fetching polyfill bundle from: {POLYFILLS_MAP[bundle]}
            <br/>
        </p>

        {polyfillReady && <p>polyfill ready. Fetching UMD bundle from: {UMD_BUNDLES[bundle]}</p>}
        {scriptReady && <p>script ready!!! Let's go</p>}
    </>;
});
