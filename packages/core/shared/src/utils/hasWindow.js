// @flow

const hasWindow = () => (typeof window === "object" && !!window.document);

export default hasWindow;
