// const fs = require("fs"),
//     MarkDownIt = require("markdown-it");
//
// const extractChangelogNotesForVersion = (version) => {
//     console.log(`Extracting changes from changelog for version ${version}`);
//
//     let versionLog;
//
//     return new Promise((resolve) => {
//         fs.readFile("./CHANGELOG.md", { encoding: "UTF-8" }, (err, data) => {
//             const md = new MarkDownIt();
//             const tokens = md.parse(data);
//
//             let startIndex = -1,
//                 endIndex = undefined;
//
//             for (let i = 0; i < tokens.length; i++) {
//                 if (!~startIndex && tokens[i].tag === "h2"
//                     //use space so pre-release isn't matched against non-pre-release
//                     && tokens[i + 1]?.content.startsWith(version + " ")) {
//                     startIndex = i
//                 } else if (!!~startIndex && tokens[i].tag === "h2" && tokens[i].type === "heading_open") {
//                     endIndex = i - 1;
//                     break;
//                 }
//             }
//
//             if (!!~startIndex) {
//                 const relevantTokens = tokens.slice(startIndex, (endIndex));
//
//                 versionLog = relevantTokens.map((t) =>
//                     (t.type === "heading_open" ? "\n" : "") +
//                     (!["list_item_close", "heading_close", "bullet_list_open", "bullet_list_close"].includes(t.type) ? t.markup : "") +
//                     (t.content && ` ${t.content}\n`) +
//                     (t.type === "heading_close" ? "\n" : "")
//                 ).join("");
//
//                 console.log(`___ Version (${version}) Changelog ___\n\n${versionLog}\n\n`);
//             }
//
//             resolve(versionLog);
//         });
//     });
// };
//
// const extractChangelogNotesForCurrentVersion = async () => {
//     const lernaJson = require("../lerna.json");
//     const version = lernaJson.version;
//
//     const versionLog = await extractChangelogNotesForVersion(version);
//
//     return { version, versionLog };
// };
//
// module.exports = {
//     extractChangelogNotesForCurrentVersion,
//     extractChangelogNotesForVersion,
// };
//
