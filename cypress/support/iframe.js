const waitForIframe = (iframe) => {
    return new Promise((resolve) => {
        const frameState = iframe.contentWindow.document.readyState;
        let resolved = false;

        const resolvePromise = () => {
            if (!resolved) {
                cy.log("RESOLVING = ", iframe.contentWindow.document.readyState);
                resolved = true;
                resolve();
            }
        };

        cy.log("IFRAME state =", frameState);

        if (frameState === "complete") {
            resolvePromise();
        } else {
            setTimeout(() => {
                //fallback in case load event isnt called...
                resolvePromise();
            }, 1500);
            iframe.contentWindow.addEventListener("load", () => {
                resolvePromise();
            });
        }
    });
};

const doSleep = (time) => new Promise(resolve => setTimeout(resolve, time));

const command = (selector) => cy.get(selector)
    .then(async ($frame) => {
        const iframe = $frame.get(0);

        await waitForIframe(iframe);

        //need to wait some more for iframe content to load (cy.wait doesnt workd !!!!! :| )
        await doSleep();

        return cy.wrap(Cypress.$(iframe.contentWindow.document));
    });

Cypress.Commands.add("iframe",command);
//
// const frameLoaded = (selector) => {
//     // if (selector === undefined) {
//     //     selector = DEFAULT_IFRAME_SELECTOR
//     // } else if (typeof selector === 'object') {
//     //     opts = selector
//     //     selector = DEFAULT_IFRAME_SELECTOR
//     // }
//
//     // const fullOpts: Cypress.IframeOptions = {
//     //     ...DEFAULT_OPTS,
//     //     ...opts,
//     // }
//     // const log = fullOpts.log ? Cypress.log({
//     //     name: 'frame loaded',
//     //     displayName: 'frame loaded',
//     //     message: [selector],
//     // }).snapshot() : null
//
//     return cy.get(selector, { log: false }).then(async ($frame) => {
//
//         const contentWindow = $frame.prop('contentWindow')
//         // const hasNavigated = fullOpts.url
//         //     ? () => typeof fullOpts.url === 'string'
//         //         ? contentWindow.location.toString().includes(fullOpts.url)
//         //         : fullOpts.url?.test(contentWindow.location.toString())
//         //     : () => contentWindow.location.toString() !== 'about:blank'
//         // while (!hasNavigated()) {
//         //     await sleep(100)
//         // }
//         // if (contentWindow.document.readyState === 'complete') {
//         //     return $frame
//         // }
//         // const loadLog = Cypress.log({
//         //     name: 'Frame Load',
//         //     message: [contentWindow.location.toString()],
//         //     event: true,
//         // } as any).snapshot()
//
//         await new Promise(resolve => {
//             Cypress.$(contentWindow).on('load', resolve)
//         })
//         // loadLog.end()
//         // log?.finish()
//         return $frame
//     })
// }
// Cypress.Commands.add('frameLoaded', frameLoaded)
