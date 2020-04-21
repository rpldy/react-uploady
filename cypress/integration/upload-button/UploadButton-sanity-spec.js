describe("UploadButton Sanity Tests", () => {

    const fileName = "flower.jpg";

    describe("Simple", () => {

        before(() => {
            cy.visitStory("uploadButton", "simple");
        });

        it("should use uploady", () => {
            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("button")
                .should("be.visible")
                .click()
                .as("uploadButton");

            cy.get("@iframe")
                .find("input")
                .should("exist")
                .as("fInput");

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@fInput").upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

                cy.wait(2000);
                cy.storyLog().assertItemStartFinish(fileName, 1);
            });
        });
    });

    describe("With Component asButton", () => {
        before(() => {
            cy.visitStory("uploadButton", "with-component-as-button");
        });

        it("should make any custom component an upload button", () => {
            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("#div-upload")
                .should("be.visible")
                .click();

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@iframe")
                    .find("input").upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

                cy.wait(2000);
                cy.storyLog().assertItemStartFinish(fileName, 1);
            });
        });
    });

    describe("With Abort", () => {
        before(() => {
            cy.visitStory("uploadButton", "with-abort");
        });

        it("should abort upload", () => {
            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("button")
                .click()
                .as("uploadButton");

            cy.get("@iframe")
                .find("input")
                .as("fInput");

            const abortSelector = "button[data-test='story-abort-button']";

            cy.get("@iframe")
                .find(abortSelector)
                .should("not.exist");

            cy.fixture(fileName, "base64").then(async (fileContent) => {
                cy.get("@fInput").upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

                cy.wait(500).then(() => {
                    cy.get("@iframe")
                        .find(abortSelector)
                        .should("be.visible")
                        .click();
                });

                cy.storyLog().assertLogPattern(/BATCH_ABORT/);
                cy.storyLog().assertLogPattern(/ITEM_FINISH/, { times: 0 });
            });
        });
    });

    describe("With Styled Component", () => {
        before(() => {
            cy.visitStory("uploadButton", "with-styled-component");
        });

        it("should be styled with styled-components", () => {
            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("button")
                .should("be.visible")
                .should("have.css", "background-color", "rgb(1, 9, 22)")
                .should("have.css", "color", "rgb(176, 177, 179)")
                .click();

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@iframe")
                    .find("input").upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

                cy.wait(2000);
                cy.storyLog().assertItemStartFinish(fileName, 1);
            });
        });
    });

    describe("With Progress", () => {
        before(() => {
            cy.visitStory("uploadButton", "with-progress");
        });

        it("should show upload progress", () => {
            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("button")
                .click()

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@iframe")
                    .find("input").upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

                cy.wait(2000);

                cy.storyLog().assertLogPattern(/progress event uploaded: \d+, completed: \d+$/, {
                    times: 5,
                    different: true
                });
            });
        });
    });

    describe("With Event Listeners", () => {
        before(() => {
            cy.visitStory("uploadButton", "with-event-listeners");
        });

        it("should use event listeners", () => {
            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("button")
                .click();

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@iframe")
                    .find("input")
                    .upload(
                        { fileContent, fileName, mimeType: "image/jpeg" },
                        { subjectType: "input" });

                cy.wait(1000);

                cy.get("@iframe")
                    .find("ul[data-test='hooks-events']")
                    .should("be.visible")
                    .as("eventsLog");

                const eventsItems = cy.get("@eventsLog").find("li");

                eventsItems.first()
                    .should("contain", "Batch Start - batch-1 - item count = 1")
                    .next()
                    .should("contain", `Item Start - batch-1.item-1 : ${fileName}`)
                    .next()
                    .should("contain", `Item Finish - batch-1.item-1 : ${fileName}`)
                    .next()
                    .should("contain", "Batch Finish - batch-1 - item count = 1");
            });
        });
    });

    describe("With Event Hooks", () => {
        before(() => {
            cy.visitStory("uploadButton", "with-event-hooks");
        });

        it("should use event hooks", () => {
            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("button")
                .click();

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@iframe")
                    .find("input")
                    .upload(
                        { fileContent, fileName, mimeType: "image/jpeg" },
                        { subjectType: "input" });

                cy.wait(1000);

                cy.get("@iframe")
                    .find("ul[data-test='hooks-events']")
                    .should("be.visible")
                    .as("eventsLog");

                const eventsItems = cy.get("@eventsLog").find("li");

                eventsItems.first()
                    .should("contain", "hooks: Batch Start - batch-1 - item count = 1")
                    .next()
                    .should("contain", `hooks: Item Start - batch-1.item-1 : ${fileName}`)
                    .next()
                    .should("contain", `hooks: Item Finish - batch-1.item-1 : ${fileName}`)
                    .next()
                    .should("contain", "hooks: Batch Finish - batch-1 - item count = 1");
            });
        });
    });

    describe("Disabled During Upload", () => {

        before(() => {
            cy.visitStory("uploadButton", "disabled-during-upload");
        });

        it("should disable upload button during upload", () => {

            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("button")
                .should("be.visible")
                .click()
                .as("uploadButton");

            cy.get("@iframe")
                .find("input")
                .should("exist")
                .as("fInput");

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@fInput").upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

                cy.wait(100);
                cy.get("@uploadButton").should("be.disabled");

                cy.wait(2000);
                cy.storyLog().assertItemStartFinish(fileName, 1);
                cy.get("@uploadButton").should("not.be.disabled");
            });
        });
    });

    describe("Different Configuration", () => {

        before(() => {
            cy.visitStory("uploadButton", "different-configuration");
        });

        const uploadWithButton = (selector, doAssertion) => {
            cy.get("@iframe")
                .find(selector)
                .should("be.visible")
                .click()

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@iframe")
                    .find("input").upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

                doAssertion();
            });
        };

        it("should allow overriding upload options from button", () => {

            cy.iframe("#storybook-preview-iframe").as("iframe");

            //test button with autoUpload = false
            uploadWithButton("#upload-a", () => {
                cy.wait(100);
                cy.storyLog().assertLogEntryCount(1);
            });

            //test other button with custom destination header
            uploadWithButton("#upload-b", () => {
                cy.wait(100);

                cy.storyLog().assertLogEntryContains(1, {
                    destination: {
                        headers: {
                            "x-test": "1234"
                        }
                    }
                });
            });
        });
    });

    describe("With Custom File Input And Form", () => {

        before(() => {
            cy.visitStory("uploadButton", "with-custom-file-input-and-form");
        });

        it("should use form attributes ", () => {
            cy.server();

            cy.route({
                method: "POST",
                url: "http://react-uploady-dummy-server.comm",
                response: { success: true }
            }).as("uploadReq");

            cy.iframe("#storybook-preview-iframe").as("iframe");

            cy.get("@iframe")
                .find("button")
                .should("be.visible")
                .click();

            cy.fixture(fileName, "base64").then((fileContent) => {
                cy.get("@iframe")
                    .find("input").upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

                cy.wait('@uploadReq').then((xhr) => {
                    assert.isNotNull(xhr.response.body);
                });
            });
        });
    });
});
