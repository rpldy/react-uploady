import { Interception } from "cypress/types/net-stubbing";

type PATTERN_MATCH = { index: number };

type LogEntry = {
    args: any[];
};

declare namespace Cypress {
    interface StoryLog {
        assertFileItemStartFinish: (fileName: string, startIndex?: number, after?: boolean) => Promise<{ start: LogEntry, finish: LogEntry }>;
        assertUrlItemStartFinish: (url: string, startIndex?: number) => Promise<{ start: LogEntry, finish: LogEntry }>;
        assertLogEntryCount: (count: number, obj: any) => void;
        assertLogEntryContains: (index: number, obj: any) => void;
        customAssertLogEntry: (event: string | RegExp, asserter: (logLine: any[], env: string) => void, options?: { index?: number, all?: boolean }) => void;
        assertLogPattern: (pattern: RegExp, options: { times?: number, index?: number, different?: boolean }) => Promise<PATTERN_MATCH[]>;
        assertNoLogPattern: (pattern: RegExp, options: { index?: number, different?: boolean }) => Promise<PATTERN_MATCH[]>;
        resetStoryLog: () => void;
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

    interface Chainable {
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

    interface Chainable<Subject = Interception> {
        interceptFormData(cb: (formData: Record<string, any>) => void): Chainable<Subject>;
    }
}
