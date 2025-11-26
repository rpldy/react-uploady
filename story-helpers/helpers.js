export const isProd = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === "production");

console.log("Storybook runtime - IS PRDD === ", isProd);
