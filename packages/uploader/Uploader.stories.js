import React, { useCallback, useState } from "react";
import { withKnobs } from "@storybook/addon-knobs";
import { UmdBundleScript, UMD_BUNDLES } from "../../story-helpers";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";


export const UMD_Core = () => {
    const [uploaderReady, setUploaderReady] = useState(false);

    const onBundleLoad = useCallback(() => {
        console.log("BUNDLE LOADED !!!! ", window.rpldy);
        setUploaderReady(true);
    }, []);

    return <div>
        <UmdBundleScript bundle={UMD_BUNDLES.CORE} onLoad={onBundleLoad}/>

    </div>
};

export default {
    title: "Uploader",
    decorators: [withKnobs],
    parameters: {
        readme: {
            sidebar: readme,
        },
        options: {
            showPanel: true,
            //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
            theme: {}
        },
    },
};
