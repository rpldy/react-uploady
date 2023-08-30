import { useState } from "react";

const useExternalUploadOptionsProvider = () => {
    const [cyOptions, setCyOptions] = useState(() => {
        return window.__extUploadOptions || window.parent.__extUploadOptions  || null;
    });

    window._setUploadOptions = setCyOptions;

    return cyOptions;
};

export {
    useExternalUploadOptionsProvider,
};
