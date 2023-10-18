import selectFiles from "./selectFiles";

const uploadFile = (fixtureName, cb, button = "button", options = { }) => {
    const selectorRoot = cy.config("spec").specType !== "component" ? "#storybook-root " : "";

    selectFiles(
        fixtureName,
        (button === false ? button : `${selectorRoot}${button}`),
        "uploadButton",
        cb,
        { ...options, force: true }
    );
};

export const uploadFileTimes = (fileName, cb, times, button = "button", options = {}, iframe) =>
    uploadFile(fileName, cb, button, { ...options, times, }, iframe);

export default uploadFile;
