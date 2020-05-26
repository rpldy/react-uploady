const safeSessionStorage = jest.genMockFromModule("../../sessionStorage").default;
const safeLocalStorage = jest.genMockFromModule("../../localStorage").default;

jest.doMock("@rpldy/safe-storage", () => ({
	safeSessionStorage,
	safeLocalStorage
}));

export {
	safeSessionStorage,
	safeLocalStorage
};