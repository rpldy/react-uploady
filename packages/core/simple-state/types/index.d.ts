
export interface SimpleState<T> {
    state: T;
    update: (updater: (state: T) => void) => T;
    unwrap: (proxy?: Record<string, any>) => T | Record<string, any>;
}

declare const createState: <T>(obj: Record<string, any>) => SimpleState<T>;

export const unwrap: (proxy: unknown) => unknown;

export const isProxy: (proxy: unknown) => boolean;

export const isProxiable: (obj: unknown) => boolean;

export default createState;
