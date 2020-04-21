//https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/

const command = (selector) =>
    cy.get(selector, { log: false })
        .its("0.contentDocument.body", { log: false })
        .should("not.be.empty")
        .then((iframeBody)=>{

            cy.window().then((appWindow) => {
                iframeBody.ownerDocument.defaultView
                    .XMLHttpRequest = appWindow.XMLHttpRequest
            });

            return cy.wrap(iframeBody);
        });

Cypress.Commands.add("iframe",command);

// const iframe = cy.get(selector);
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
// .then(async ($frame) => {
// // const iframe = $frame.get(0);
//
// // console.log("!!!!!!!!! 1111 ", $frame.get(0));
// await waitForIframe($frame.get(0));
//
// //need to wait some more for iframe content to load (cy.wait doesnt work !!!!! :| )
// await doSleep();

// console.log("!!!!!!!!! 2222", $frame.find("contentWindow document"));

// console.log("------------ iframe = ", iframe.get(0));

// return cy.wrap(Cypress.$(iframe.contentWindow.document));
// return Cypress.$($frame[0].contentWindow.document)  //cy.wrap(Cypress.$($frame[0].contentWindow.document)); //.get(0).contentWindow.document);

// iframe.debug().find("contentWindow.document.body")
//     .then(cy.wrap);
// return cy.wrap($frame.get(0).contentWindow.document)
// });
// const waitForIframe = (iframe) => {
//     return new Promise((resolve) => {
//         const frameState = iframe.contentWindow.document.readyState;
//         let resolved = false;
//
//         const resolvePromise = () => {
//             if (!resolved) {
//                 cy.log("RESOLVING = ", iframe.contentWindow.document.readyState);
//                 resolved = true;
//                 resolve();
//             }
//         };
//
//         cy.log("IFRAME state =", frameState);
//
//         if (frameState === "complete") {
//             resolvePromise();
//         } else {
//             setTimeout(() => {
//                 //fallback in case load event isnt called...
//                 resolvePromise();
//             }, 1500);
//             iframe.contentWindow.addEventListener("load", () => {
//                 resolvePromise();
//             });
//         }
//     });
// };
//
// const doSleep = (time) => new Promise(resolve => setTimeout(resolve, time));
