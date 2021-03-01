// @flow

const hasWindow = (): boolean => (typeof window === "object" && !!window.document);

export default hasWindow;
