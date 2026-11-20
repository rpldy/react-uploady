// flow-typed signature: 4daa25492655417e7c0763d1d0b30fbb
// flow-typed version: c6154227d1/invariant_v2.x.x/flow_>=v0.104.x
// modified: assertion signature, since flow 0.338 no longer special-cases invariant

declare module invariant {
  declare module.exports: (condition: unknown, message: string, ...args: Array<unknown>) => asserts condition;
}
