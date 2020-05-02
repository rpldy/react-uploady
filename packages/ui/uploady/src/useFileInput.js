// @flow
import { useContext, useEffect } from "react";
import { logger } from "@rpldy/shared";
import { UploadyContext, assertContext } from "@rpldy/shared-ui";
import type { Destination } from "@rpldy/shared";
import type { InputRef } from "@rpldy/shared-ui";

type DestinationShape = $Shape<Destination>;

//https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm
const getUrl = (form) => {
    const loc = window.location;
    let url = form.getAttribute("action") || "";
    url = url.replace(/\s/g, "");
    let path;

    // eslint-disable-next-line default-case
    switch (true) {
        //if empty, use same url as page
        case url === "":
            url = loc.href;
            break;
        //starts with "/", make it absolute
        case url.startsWith("/"):
            url = `${loc.protocol}//${loc.host}${url}`;
            break;
        //not an http(s) and doesnt start with "/", make it relative
        case !(/:\/\//.test(url)):
            path = loc.pathname.split("/")
                .slice(0, -1).concat("").join("/");

            url = `${loc.protocol}//${loc.host}${path}${url}`;
            break;
    }

    return url;
};

const getDestinationFromInput = (input: HTMLInputElement): ?DestinationShape => {
    const form = input.closest("form");

    let destination = {
        filesParamName: input.getAttribute("name"),
        method: undefined,
        url: undefined,
    };

    if (form) {
        const method = form.getAttribute("method"),
            url = getUrl(form);

        destination.method = method ? method.toUpperCase() : undefined;
        destination.url = url;

        logger.debugLog(`Uploady.useFileInput: using custom input's parent form url ${destination.url} and method ${destination.method || ""}`);
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
