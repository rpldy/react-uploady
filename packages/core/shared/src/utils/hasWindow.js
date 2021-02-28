// @flow

const hasWindow = (): any | boolean => (typeof window === "object" && !!window.document);

export default hasWindow;
