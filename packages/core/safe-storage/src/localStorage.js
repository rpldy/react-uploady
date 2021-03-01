// @flow
import createSafeStorage from "./safeStorageCreator";
import type { SafeStorage } from "./types";

export default (createSafeStorage("localStorage"): SafeStorage);
