import { triggerCancellable, invariant, utils } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { mockTrigger, createLifePack } from "@rpldy/life-events/src/tests/mocks/rpldy-life-events.mock";
import getAbortEnhancer from "@rpldy/abort";
import mockCreateProcessor from "../processor";
import createUploader from "../uploader";
import { deepProxyUnwrap, getMandatoryOptions } from "../utils";

jest.mock("../processor");
jest.mock("../utils");
jest.mock("@rpldy/abort");

describe("uploader tests", () => {
    const mockProcess = jest.fn(),
        mockAbort = jest.fn(),
        mockAbortBatch = jest.fn(),
        mockAddNewBatch = jest.fn(),
        mockRunCancellable = jest.fn(),
        mockProcessPendingBatches = jest.fn(),
        mockClearPendingBatches = jest.fn();

    beforeAll(()=>{
        getMandatoryOptions.mockImplementation((options) => options);

        getAbortEnhancer.mockReturnValue((uploader) => uploader);
    });

    beforeEach(() => {
        clearJestMocks(
            mockProcess,
            mockAbort,
            triggerCancellable,
            invariant,
            utils,
            mockRunCancellable,
            mockAddNewBatch,
            deepProxyUnwrap,
            mockProcessPendingBatches,
            mockClearPendingBatches,
            mockCreateProcessor,
            mockTrigger,
            createLifePack
        );
    });

    const getTestUploader = (options) => {
        options = {
            destination: { url: "aaa" },
            ...options,
        };

        mockCreateProcessor.mockReturnValueOnce({
            process: mockProcess,
            abort: mockAbort,
            abortBatch: mockAbortBatch,
            addNewBatch: mockAddNewBatch,
            runCancellable: mockRunCancellable,
            processPendingBatches: mockProcessPendingBatches,
            clearPendingBatches: mockClearPendingBatches,
        });

        return createUploader(options);
    };

    describe("getOptions tests", () => {
        it("should return combination of passed options with defaults", () => {
            const uploader = createUploader({
                multiple: false,
                autoUpload: false,
            });

            const options = uploader.getOptions();

            expect(options.multiple).toBe(false);
            expect(options.autoUpload).toBe(false);
        });

        it("should get a deep clone", () => {
            const uploader = createUploader({
                multiple: false,
                autoUpload: false,
                destination: {
                    url: "test-url"
                },
            });

            const options = uploader.getOptions();

            options.multiple = true;
            options.destination.url = "test2";

            const options2 = uploader.getOptions();

            expect(options2.multiple).toBe(false);
            expect(options2.destination.url).toBe("test-url");
        });
    });

    describe("updateOptions tests", () => {
        it("should update options", () => {
            const uploader = getTestUploader({ autoUpload: false, clearPendingOnAdd: true });

            uploader.update({ autoUpload: true });
            expect(uploader.getOptions().autoUpload).toBe(true);
            expect(uploader.getOptions().clearPendingOnAdd).toBe(true);
        });
    });

    describe("upload tests", () => {
        it("should not process if no pending", () => {
            triggerCancellable
                .mockReturnValueOnce(() => Promise.resolve(true));

            const uploader = getTestUploader({ autoUpload: false });

            uploader.upload();
            expect(mockProcess).not.toHaveBeenCalled();
        });

        it("should process with merged upload options", async () => {
            mockRunCancellable.mockResolvedValueOnce(false);

            mockAddNewBatch
                .mockResolvedValueOnce({ items: [1, 2] });

            const uploader = getTestUploader({ autoUpload: false });

            const newOptions = { process: true };
            await uploader.add([], { test: 1 });
            uploader.upload(newOptions);

            expect(mockProcessPendingBatches).toHaveBeenCalledWith(newOptions);
        });

        it("should clear previous pending", async () => {
            mockRunCancellable
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false);

            const uploader = getTestUploader({ autoUpload: false, clearPendingOnAdd: true });

            const batch1 = { items: [1, 2] },
                batch2 = { items: [3] };

            mockAddNewBatch
                .mockResolvedValueOnce(batch1)
                .mockResolvedValueOnce(batch2);

            await uploader.add([], { test: 1 });
            await uploader.add([], { test: 2 });

            uploader.upload();

            expect(mockClearPendingBatches).toHaveBeenCalledTimes(2);
            expect(mockProcessPendingBatches).toHaveBeenCalledTimes(1);
        });
    });

    describe("add uploads tests", () => {
        it("should add new batch", async () => {
            const uploader = getTestUploader({ autoUpload: true });

            mockAddNewBatch.mockResolvedValueOnce({ items: [] });
            await uploader.add([1, 2], { test: 1 });

            expect(mockAddNewBatch).toHaveBeenCalledWith([1, 2], expect.objectContaining({
                autoUpload: true
            }));
        });

        it("should clear pending with clearPendingOnAdd in uploader options",async() => {
            const uploader = getTestUploader({ clearPendingOnAdd: true });

            mockAddNewBatch.mockResolvedValueOnce({ items: [] });
            await uploader.add([1, 2], { test: 1 });

            expect(mockClearPendingBatches).toHaveBeenCalledTimes(1);
        });

        it("should clear pending with clearPendingOnAdd in addOptions", async() => {
            const uploader = getTestUploader({  });

            mockAddNewBatch.mockResolvedValueOnce({ items: [] });
            await uploader.add([1, 2], { clearPendingOnAdd: true });

            expect(mockClearPendingBatches).toHaveBeenCalledTimes(1);
        });
    });

    describe("abort tests", () => {
        it("should call processor.abort", () => {
            const uploader = getTestUploader();
            uploader.abort("u1");
            expect(mockAbort).toHaveBeenCalledWith("u1");
        });

        it("should call processor.abortBatch", () => {
            const uploader = getTestUploader();
            uploader.abortBatch("u1");
            expect(mockAbortBatch).toHaveBeenCalledWith("u1");
        });
    });

    describe("enhancer tests", () => {
        it("should create with enhancer", () => {
            const enhancer = jest.fn((uploader, trigger) => {
                trigger();
                expect(mockTrigger).toHaveBeenCalled();
                uploader.test = true;

                return uploader;
            });

            const uploader = getTestUploader({ enhancer });

            expect(uploader.test).toBe(true);
        });

        it("should create with enhancer that doesnt return uploader", () => {
            getAbortEnhancer.mockReturnValueOnce((uploader) => {
                uploader.test = true;
            });

            const uploader = getTestUploader({  });

            expect(uploader.test).toBe(true);
        });
    });

    describe("registerExtension tests", () => {
        it("should register extension successfully", () => {
            const methods = { foo: "bar" };

            const uploader = getTestUploader({
                enhancer: (uploader) => {
                    uploader.registerExtension("ext", methods);
                    return uploader;
                }
            });

            const extMethods = uploader.getExtension("ext");
            expect(extMethods).toEqual(methods);
        });

        it("should fail to register outside enhancer time", () => {
            const uploader = getTestUploader();

            uploader.registerExtension("ext");

            expect(invariant).toHaveBeenNthCalledWith(1, false, "Uploady - uploader extensions can only be registered by enhancers");
        });

        it("should fail to register existing name", () => {
            getTestUploader({
                enhancer: (uploader) => {
                    uploader.registerExtension("ext", {});
                    uploader.registerExtension("ext", {});
                }
            });

            expect(invariant).toHaveBeenNthCalledWith(4, false, "Uploady - uploader extension by this name [%s] already exists", "ext");
        });
    });

    it("should clear pending", async () => {
        mockRunCancellable
            .mockResolvedValueOnce(false);

        mockAddNewBatch
            .mockResolvedValueOnce({ items: [1, 2] });

        const uploader = getTestUploader({ autoUpload: false });
        await uploader.add([], { test: 1 });

        uploader.clearPending();
        expect(mockClearPendingBatches).toHaveBeenCalledTimes(1);
    });

    it("should trigger with unwrap", () => {
        getTestUploader({});

        const triggerWithUnwrap = mockCreateProcessor.mock.calls[0][0];
        const data = {};

        triggerWithUnwrap("test", data);

        expect(createLifePack).toHaveBeenCalled();

        createLifePack.mock.calls[0][0]();
        expect(deepProxyUnwrap).toHaveBeenCalledWith(data, 0, [data]);
    });
});
