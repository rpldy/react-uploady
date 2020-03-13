// @flow
import { useContext, useEffect } from "react";
import { logger } from "@rpldy/shared";
import { UploadyContext, assertContext } from "@rpldy/shared-ui";
import type { Destination } from "@rpldy/shared";
import type { InputRef } from "@rpldy/shared-ui";

type DestinationShape = $Shape<Destination>;

const getDestinationFromInput = (input: HTMLInputElement): ?DestinationShape => {
    const form = input.closest("form");

    let destination = {
        filesParamName: input.getAttribute("name"),
        method: undefined,
        url: undefined,
    };

    if (form) {
        const method = form.getAttribute("method"),
            url = form.getAttribute("action");

        destination.method = method ? method.toUpperCase() : undefined;
        destination.url = url || undefined;

        logger.debugLog(`Uploady.useFileInput: using custom input's parent form url ${destination.url || ""} and method ${destination.method || ""}`);
    }

    return destination;
};

export default (fileInputRef: InputRef) => {
    const context = assertContext(useContext(UploadyContext));

    context.setExternalFileInput(fileInputRef);

    useEffect(() => {
            //uses Element.prototype.closest so no IE11 support - use polyfill
            if (fileInputRef.current && fileInputRef.current.closest) {
                const input = fileInputRef.current;
                const uploaderOptions = context.getOptions();

                //if no destination was passed, try and get from input's parent form
                if (!uploaderOptions.destination || !uploaderOptions.destination.url) {
                    const domDestination = getDestinationFromInput(input);

                    context.setOptions({ destination: domDestination });
                }
            }
        },
        [fileInputRef, context]);
};
