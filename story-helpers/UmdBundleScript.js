import React, { useCallback, useState, memo } from "react";
import Script from "react-load-script";
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

    const onPolyfillLoaded = useCallback(() => {
        setPolyfillReady(true);
    }, []);

    const onScriptLoaded = useCallback(() => {
        setScriptReady(true);
        onLoad();
    }, [onLoad]);

    return <>
        <p>
            Fetching polyfill bundle from: {POLYFILLS_MAP[bundle]}
            <br/>
        </p>

        {polyfillReady && <p>polyfill ready. Fetching UMD bundle from: {UMD_BUNDLES[bundle]}</p>}
        {scriptReady && <p>script ready!!! Let's go</p>}

        <Script url={POLYFILLS_MAP[bundle]} onLoad={onPolyfillLoaded}/>
        {polyfillReady && <Script key="secondScript" url={UMD_BUNDLES[bundle]} onLoad={onScriptLoaded}/>}
    </>;
});
