//keeps this file a module, so the helper types below stay local and the Cypress namespace is declared global
export {};

type PATTERN_MATCH = { arg: string, index: number };

type LogEntry = {
    args: any[];
};

type START_FINISH = { start: LogEntry, finish: LogEntry };

declare global {
    namespace Cypress {
        //yielded by cy.storyLog(): a query that re-reads the log on every retry. the assert commands retry until they pass or time out
        interface StoryLog extends Chainable<LogEntry[]> {
            assertFileItemStartFinish: (fileName: string, startIndex?: number, after?: boolean) => Chainable<START_FINISH>;
            assertUrlItemStartFinish: (url: string, startIndex?: number, after?: boolean) => Chainable<START_FINISH>;
            assertLogEntryCount: (count: number) => Chainable<LogEntry[]>;
            assertLogEntryContains: (index: number, obj: Record<string, any>) => Chainable<LogEntry[]>;
            //only the lookup retries, the asserter runs once and may call cy.*. logLine is the event's args (string event), matching entries (RegExp), or every matching entry's args ({ all: true })
            customAssertLogEntry: (event: string | RegExp, asserter: (logLine: any, env: string) => void, options?: { all?: boolean }) => Chainable<unknown>;
            assertLogPattern: (pattern: RegExp, options?: { times?: number, between?: [number, number], index?: number, different?: boolean }) => Chainable<PATTERN_MATCH[]>;
            assertNoLogPattern: (pattern: RegExp) => Chainable<PATTERN_MATCH[]>;
            resetStoryLog: () => Chainable<LogEntry[]>;
        }

        type StoryOptions = {
            canvas?: boolean;
            useMock?: boolean;
            multiple?: boolean;
            group?: boolean;
            uploadUrl?: boolean;
            chunkSize?: number;
            mockDelay?: boolean;
            tusResumeStorage?: boolean;
            uploadParams?: Record<string, unknown>;
            tusSendOnCreate?: boolean;
            tusIgnoreModifiedDateInStorage?: boolean;
            tusSendWithCustomHeader?: boolean;
            customArgs?: Record<string, any>;
        };

        interface Chainable<Subject = any> {
            storyLog: () => StoryLog,
            visitStory: (component: string, storyName: string, options?: StoryOptions) => void;
            pasteFile: (fixtureName: string, times?: number, mimeType?: string) => Chainable;
            setUploadOptions: (options: Object) => void;
            setPreSendOptions: (options: Object) => void;
            waitExtraShort: () => void;
            waitShort: () => void;
            waitMedium: () => void;
            waitLong: () => void;
            waitExtraLong: () => void;
        }

        interface Chainable<Subject = any> {
            interceptFormData(cb: (formData: Record<string, any>) => void): Chainable<Subject>;
        }
    }
}
