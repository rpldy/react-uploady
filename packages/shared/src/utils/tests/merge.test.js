import merge, { getMerge } from "../merge";

describe("merge (deep) tests", () => {

    describe("default merge tests", () => {
        it("should return target if not sources", () => {

            const a = { foo: "bar" };
            const result = merge(a);

            expect(result).toBe(a);
        });

        it("should merge two simple-flat objects", () => {

            const a = {
                foo: "bar",
                a: 1,
                b: [1, 2, 3],
                c: { test: true },
                d: "stay"
            };

            const b = {
                foo: "zar",
                a: 2,
                b: [4, 5],
                c: "no object",
                e: "new"
            };

            const result = merge(a, b);

            expect(result).toBe(a);

            expect(a).toEqual({
                foo: "zar",
                a: 2,
                b: [4, 5],
                c: "no object",
                d: "stay",
                e: "new"
            });
        });

        it("should ignore undefined", () => {
            const a = {};
            const b = {
                a: undefined,
                b: void 0,
                c: undefined,
            };

            const result = merge(a, b);

            expect(result).toBe(a);
            expect(a).toEqual({});
        });

        it("should merge multiple simple objects", () => {

            const a = {
                foo: "bar",
                a: 1,
                b: [1, 2, 3],
                c: { test: true },
                d: "stay"
            };

            const b = {
                foo: "zar",
                e: "new"
            };

            const c = {
                foo: "car",
                c: "no object",
                d: "override"
            };

            const d = {
                a: 2,
                b: undefined,
                c: { back: true },
                d: undefined,
            };

            const result = merge(a, b, c, d);

            expect(result).toBe(a);

            expect(a).toEqual({
                b: [1, 2, 3],
                e: "new",
                foo: "car",
                d: "override",
                a: 2,
                c: { back: true },
            });
        });

        it("should merge multiple levels from multiple objects", () => {

            const a = {
                lll: "aaaa",

                level1: {
                    a: "1",
                    level2: {
                        level3: {
                            d: 123,
                        },
                        level3_1: {
                            f: "aaa",
                            g: "123",
                        }
                    },
                    b: "2",
                }
            };

            const b = {
                lll: "bbb",
                level1: {
                    level2: {
                        level3: undefined,
                        level3_1: {
                            g: "123123",
                            h: 444,
                        },
                        c: 222,
                    },
                    level2_1: {
                        z: "xxx"
                    }
                }
            };

            const c = {
                level1: {
                    level2: {
                        jj: "kk"
                    }
                }
            };

            const result = merge({}, a, b, c);

            expect(result).not.toBe(a);
            expect(result).not.toBe(b);

            expect(result).toEqual({
                lll: "bbb",

                level1: {
                    a: "1",
                    level2: {
                        level3: {
                            d: 123,
                        },
                        level3_1: {
                            f: "aaa",
                            g: "123123",
                            h: 444,
                        },
                        c: 222,
                        jj: "kk",
                    },
                    level2_1: {
                        z: "xxx"
                    },
                    b: "2",
                }
            });
        });

        it("should ignore __proto__", () => {

            const a = {
                a: "b"
            };

            const b = {
                __proto__: {
                    b: "ccc"
                },
                c: "d"
            };

            merge(a, b);

            expect(a).toEqual({
                a: "b",
                c: "d"
            });

            expect(a["__proto__"].b).toBeUndefined();

            expect(a.b).toBeUndefined();
        });

        it("should ignore empty sources", () => {

            const a = {
                foo: "bar",
            };

            const b = {
                test: true,
            };

            merge(a, b, undefined, null);

            expect(a).toStrictEqual({
                foo: "bar",
                test: true,
            });
        });
    });

    describe("undefinedOverwrites tests", () => {

        it("should overwrite with undefined", () => {
            const a = {};
            const b = {
                a: undefined,
                b: void 0,
                c: undefined,
            };

            const result = getMerge({undefinedOverwrites: true})(a, b);

            expect(result).toBe(a);
            expect(a).toEqual(b);
        });

        it("should overwrite with undefined deep", () => {

            const a = {
                lll: "aaaa",

                level1: {
                    a: "1",
                    level2: {
                        level3: {
                            d: 123,
                        },
                        level3_1: {
                            f: "aaa",
                            g: "123",
                        }
                    },
                    b: "2",
                }
            };

            const b = {
                lll: "bbb",
                level1: {
                    level2: {
                        level3: undefined,
                        level3_1: {
                            g: "123123",
                            h: 444,
                        },
                        c: 222,
                    },
                    level2_1: {
                        z: "xxx"
                    }
                }
            };

            const c = {
                level1: {
                    level2: {
                        jj: "kk"
                    },
                    b: undefined
                }
            };

            const result = getMerge({undefinedOverwrites: true})({}, a, b, c);

            expect(result).toEqual({
                lll: "bbb",

                level1: {
                    a: "1",
                    level2: {
                        level3: undefined,
                        level3_1: {
                            f: "aaa",
                            g: "123123",
                            h: 444,
                        },
                        c: 222,
                        jj: "kk",
                    },
                    level2_1: {
                        z: "xxx"
                    },
                    b: undefined,
                }
            });
        });

    });
});
