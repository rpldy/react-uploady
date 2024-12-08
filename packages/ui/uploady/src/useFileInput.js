// @flow
import { useEffect } from "react";
import { logger } from "@rpldy/shared";
import { useUploadyContext } from "@rpldy/shared-ui";
import type { Destination } from "@rpldy/shared";
import type { InputRef } from "@rpldy/shared-ui";

type DestinationShape = Partial<Destination>;

//https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm
const getUrl = (form: Element) => {
    const loc = window.location;
    let url = form.getAttribute("action") || "";
    url = url.replace(/\s/g, "");
    let path;

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

const getNewDestination = (input: HTMLInputElement, form?: Element): DestinationShape => {
    const method = form?.getAttribute("method"),
        url = form && getUrl(form);

    return {
        filesParamName: input.getAttribute("name"),
        method: method ? method.toUpperCase() : undefined,
        url: url,
    };
};

const retrieveDestinationFromInput = (input: HTMLInputElement, onUpdate: (destination: DestinationShape) => void): {
    stopObserving: ?() => void,
} => {
    let destination, stopObserving;
    const form = input.closest("form");

    if (form) {
        destination = getNewDestination(input, form);
        logger.debugLog(`Uploady.useFileInput: using custom input's parent form url ${destination.url || ""} and method ${destination.method || ""}`);

        let observer: ?MutationObserver = new MutationObserver((records) => {
            if (records[0]?.attributeName === "action") {
                const newDestination = getNewDestination(input, form);
                if (newDestination.url) {
                    logger.debugLog(`Uploady.useFileInput: form action attribute changed to ${newDestination.url}`);
                    onUpdate(newDestination);
                }
            }
        });

        observer?.observe(form, { attributes: true, attributeFilter: ["action"] });

        stopObserving = () => {
            observer?.disconnect();
            observer = null;
        };
    }

    onUpdate(destination || getNewDestination(input));

    return { stopObserving };
};

const useFileInput = (fileInputRef?: InputRef): ?InputRef => {
    const context = useUploadyContext();
    const inputGiven = !!fileInputRef;

    if (fileInputRef) {
        context.setExternalFileInput(fileInputRef);
    }

    useEffect(() => {
            let stopObservingCallback;

            //uses Element.prototype.closest so no IE11 support - use polyfill
            if (fileInputRef?.current && "closest" in fileInputRef.current) {
                const input = fileInputRef.current;
                const uploaderOptions = context.getOptions();

                //if no destination was passed, try and get from input's parent form
                if (!uploaderOptions.destination || !uploaderOptions.destination.url) {
                    const { stopObserving } = retrieveDestinationFromInput(input,
                        (newDestination) => {
                            context.setOptions({ destination: newDestination });
                        });

                    stopObservingCallback = stopObserving;
                }
            }

            return () => {
                stopObservingCallback?.();
            };
        },
        [fileInputRef, context]);

    return inputGiven ? fileInputRef : context.getInternalFileInput();
};

export default useFileInput;
