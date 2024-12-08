const clearTusPersistStorage = () => {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && !key.startsWith("__rpldy-tus__")) {
            localStorage.removeItem(key);
        }
    }
};

export default clearTusPersistStorage;
