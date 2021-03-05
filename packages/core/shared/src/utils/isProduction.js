// @flow

const isProduction = (): boolean => process?.env?.NODE_ENV === "production";

export default isProduction;
