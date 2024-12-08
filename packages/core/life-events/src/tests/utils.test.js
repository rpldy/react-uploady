import { isUndefined, validateFunction } from "../utils";

describe("utils tests", () => {

    describe("validateFunction tests", () => {
       it.each([
        [()=>{}, false],
           [{}, true],
           [123, true],
           [true, true],
       ])("should validate as function - %s", (val, shouldThrow) =>{
          const exResult = expect(()=>{
              validateFunction(val, "test");
          });

          if (shouldThrow){
              exResult.toThrow("'test' is not a valid function");
          }
          else{
              exResult.not.toThrow();
          }
       });

        describe("isUndefined tests", () => {
            it.each([
                [undefined, true],
                [void 0, true],
                [0, false],
                ["", false],
                [true, false],
                [false, false],
            ])("isUndefined for %s should return %s", (val, expected) =>{
                expect(isUndefined(val)).toBe(expected);
            });
        });
    });

});
