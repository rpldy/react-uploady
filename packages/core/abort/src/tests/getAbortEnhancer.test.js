import getAbortEnhancer from "../getAbortEnhancer";
import { abortItem, abortBatch, abortAll } from "../abort";

vi.mock("../abort");

describe("getAbortEnhancer tests", () => {
    it("should enhance uploader with abort fns", () => {
       const enhancer = getAbortEnhancer();
       const uploader = { update: vi.fn() };

       const enhanced = enhancer(uploader);

       expect(uploader.update).toHaveBeenCalledWith({
           abortAll, abortBatch, abortItem
       });

       expect(enhanced).toBe(uploader);
    });
});
