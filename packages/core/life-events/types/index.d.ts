export type EventCallback = (...args: any[]) => unknown | void;

export type OffMethod = (name: unknown, cb?: EventCallback) => void;

export type OnAndOnceMethod = (name: unknown, cb: EventCallback) => OffMethod;

export interface LifeEventsOptions {
    allowRegisterNonExistent?: boolean;
    canAddEvents?: boolean;
    canRemoveEvents?: boolean;
    collectStats?: boolean;
}

export type TriggerMethod = (name: unknown, ...args: unknown[]) => unknown;

export interface WithLife {
    on: OnAndOnceMethod;
    once: OnAndOnceMethod;
    off: OffMethod;
}

export interface LifeEventsAPI<T> {
    target: T & WithLife;
    trigger: TriggerMethod;
    addEvent: (name: unknown) => void;
    removeEvent: (name: unknown) => void;
    hasEvent: (name: unknown) => boolean;
    hasEventRegistrations: (name: unknown) => boolean;
}

export const addLife: <T>(target: T, events: unknown[], options: LifeEventsOptions) => LifeEventsAPI<T>;

export interface LifePack<T> {
  resolve: () => T,
}

export const createLifePack: <T>(creator: () => T) => LifePack<T>;

export default addLife;
