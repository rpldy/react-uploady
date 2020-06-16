
interface Updateable<T> {
    state: T;
    update: (updater: (state: T) => void) => T;
    unwrap: (proxy?: Record<string, any>) => T | Record<string, any>;
}

declare const makeUpdateable: <T>(obj: Record<string, any>) => Updateable<T>;

export const unwrap: (proxy: Record<string, any>) => Record<string, any>;

export default makeUpdateable;