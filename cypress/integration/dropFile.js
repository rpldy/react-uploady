import selectFiles from "./selectFiles";

const dropFile = (fixtureName, cb, dropZone = "#upload-drop-zone", options = {}) => {
    selectFiles(
        fixtureName,
        dropZone,
        "uploadDropZone",
        cb,
        { ...options, action: "drag-drop", aliasAsInput: true }
    );
};

export const dropFiles = (fixtureName, times, cb, dropZone = "#upload-drop-zone", options = {}) =>
    dropFile(fixtureName, cb, dropZone, { ...options, times });

export default dropFile;
