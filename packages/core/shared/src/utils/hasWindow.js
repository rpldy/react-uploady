// @flow

const hasWindow = (): boolean => {
    return typeof window === "object" && !!window.document;
};

export default hasWindow;
