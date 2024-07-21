// @flow
import createSafeStorage from "./safeStorageCreator";
import type { SafeStorage } from "./types";

const safeLocalStorage = (createSafeStorage("localStorage"): SafeStorage);
const safeSessionStorage = (createSafeStorage("sessionStorage"): SafeStorage);

export {
    safeLocalStorage,
    safeSessionStorage,
};

