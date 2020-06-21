// import { addons } from "@storybook/addons";
// import { STORY_RENDERED } from "@storybook/core-events";
//
// addons.register("rpldy/cypress-addon", (api) => {
//     if (window.Cypress) {
//         api.on(STORY_RENDERED, () => {
//
//             window.__cypressResults = window.__cypressResults || { storyLog: []};
//
//             //clear story log on each story render
//             window.__cypressResults.storyLog = [];
//         });
//     }
// });
// api.on(STORY_CHANGED, (...args) => {
// const channel = api.getChannel();
