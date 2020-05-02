import React, { useCallback, useState, memo } from "react";
import Script from "react-load-script";

const BASE = "http://localhost:8009/",
    POLYFILLS = `${BASE}polyfills-bundle.js`,
    ALL_POLYFILLS = `${BASE}polyfills-all-bundle.js`;

export const UMD_NAMES = {
    "CORE": "CORE",
    "CORE_UI": "CORE_UI",
    "CORE_CHUNKED_UI": "CORE_CHUNKED_UI",
    "ALL": "ALL",
}

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
    const [polyfillReady, setPolyfillReady] = useState(false)

    const onPolyfillLoaded = useCallback(() => {
        setPolyfillReady(true);
    }, []);

    return <>

        <p>
            Fetching polyfill bundle from: {POLYFILLS_MAP[bundle]}
            <br/>
            Fetching UMD bundle from: {UMD_BUNDLES[bundle]}
        </p>

        <Script url={POLYFILLS_MAP[bundle]} onLoad={onPolyfillLoaded}/>
        {polyfillReady && <Script key="secondScript" url={UMD_BUNDLES[bundle]} onLoad={onLoad}/>}
    </>;
});
