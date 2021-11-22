import { useState } from "react";

const useExternalUploadOptionsProvider = () => {
    const [cyOptions, setCyOptions] = useState(() => {
        return window.parent.__extUploadOptions || null;
    });

    window.parent._setUploadOptions = setCyOptions;

    return cyOptions;
};

export {
    useExternalUploadOptionsProvider,
};
