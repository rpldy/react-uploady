
interface SimpleState<T> {
    state: T;
    update: (updater: (state: T) => void) => T;
    unwrap: (proxy?: Record<string, any>) => T | Record<string, any>;
}

declare const createState: <T>(obj: Record<string, any>) => SimpleState<T>;

export const unwrap: (proxy: Record<string, any>) => Record<string, any>;

export default createState;