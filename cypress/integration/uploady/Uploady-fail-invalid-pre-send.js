import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { WAIT_X_SHORT } from "../specWaitTimes";

describe("Uploady - Undefined params", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-header-from-file-name&knob-destination_Upload Destination=local&knob-mock send delay_Upload Destination=1000&knob-multiple files_Upload Settings=true&knob-group files in single request_Upload Settings=&knob-max in group_Upload Settings=2&knob-auto upload on add_Upload Settings=true");
    });

    it("should fail invalid updated data from pre send - forbidden item props", () => {
        intercept("http://localhost:4000/upload");

        throw new Error("imp");
    });

    it("should fail invalid updated data from pre send - forbidden batch data", () => {
        intercept("http://localhost:4000/upload");

        throw new Error("imp");
    });
});
