import processChunkProgressData from "../processChunkProgressData";

describe("processChunkProgressData test", () => {

    it("should return loaded sum for chunks", () => {
        const { loaded, total } = processChunkProgressData({
            uploaded: {
                c1: 200,
                c2: 400,
            },
            startByte: 1,
        }, {
            file: { size: 3000 }
        }, "c3", 1000);

        expect(loaded).toBe(1601);
        expect(total).toBe(3000);
    });

    it("should return total if loaded sum is bigger", () => {
        const { loaded, total } = processChunkProgressData({
            uploaded: {
                c1: 1000,
                c2: 1000,
            },
            startByte: 1,
        }, {
            file: { size: 3000 }
        }, "c3", 1000);

        expect(loaded).toBe(3000);
        expect(total).toBe(3000);
    });

    it("should not add chunk loaded if state value bigger", () => {
        const { loaded, total } = processChunkProgressData({
            uploaded: {
                c1: 1000,
                c2: 1000,
                c3: 999,
            },
            startByte: 0,
        }, {
            file: { size: 3000 }
        }, "c3", 998);

        expect(loaded).toBe(2999);
        expect(total).toBe(3000);
    });
});
