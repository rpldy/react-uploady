import { useRef, useEffect } from "react";

const useScript = (url, onLoad) => {
    const finalizedRef = useRef(false);

    useEffect(() => {
        let script, onScriptEvent;

        if (url && !finalizedRef.current) {
            script = document.querySelector(`script[src="${url}"]`) ||
                document.createElement("script");

            if (!script.src) {
                onScriptEvent = (e) => {
                    finalizedRef.current = true;

                    if (e.type === "load") {
                        onLoad?.(true);
                    }
                };

                script.src = url;
                script.async = true;
                script.addEventListener("load", onScriptEvent);
                script.addEventListener("error", onScriptEvent);

                document.body.appendChild(script);
            }
        }

        return () => {
            if (onScriptEvent) {
                script.removeEventListener("load", onScriptEvent);
                script.removeEventListener("error", onScriptEvent);
            }
        };
    }, [url, onLoad]);
};

export default useScript;
