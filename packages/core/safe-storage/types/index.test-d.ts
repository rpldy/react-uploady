import { safeLocalStorage, safeSessionStorage } from "./index";

const testSafeLocalStorage = (): string | null => {

    safeLocalStorage.setItem("test", "value");
    const value = safeLocalStorage.getItem("test");
    safeLocalStorage.removeItem("test");

    return value;
};

const testSafeSessionStorage = (): string | null => {

    safeSessionStorage.setItem("test", "value");
    const value = safeSessionStorage.getItem("test");
    safeSessionStorage.removeItem("test");

    return value;
};

export {
    testSafeLocalStorage,
    testSafeSessionStorage,
};