import getAbortEnhancer from "../getAbortEnhancer";
import { abortItem, abortBatch, abortAll } from "../abort";

jest.mock("../abort");

describe("getAbortEnhancer tests", () => {
    it("should enhance uploader with abort fns", () => {
       const enhancer = getAbortEnhancer();
       const uploader = { update: jest.fn() };

       const enhanced = enhancer(uploader);

       expect(uploader.update).toHaveBeenCalledWith({
           abortAll, abortBatch, abortItem
       });

       expect(enhanced).toBe(uploader);
    });
});
