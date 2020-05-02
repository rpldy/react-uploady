import React, { useCallback, useState, memo } from "react";
import Script from "react-load-script";

const BASE = "http://localhost:8009/",
    POLYFILLS = `${BASE}polyfills-bundle.js`;

export const UMD_BUNDLES = {
    "CORE": `${BASE}rpldy-core.umd.min.js`,
    "CORE_UI": `${BASE}rpldy-ui-core.umd.min.js`,
};

export default memo(({ bundle, onLoad }) => {
    const [polyfillReady, setPolyfillReady] = useState(false)

    const onPolyfillLoaded = useCallback(() => {
        setPolyfillReady(true);
    }, []);

    return <>
        <Script url={POLYFILLS} onLoad={onPolyfillLoaded}/>
        {polyfillReady && <Script key="secondScript" url={bundle} onLoad={onLoad}/>}
    </>;
});
