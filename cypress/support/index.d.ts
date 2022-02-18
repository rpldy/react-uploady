import { Interception } from "cypress/types/net-stubbing";

interface StoryLog {
    assertFileItemStartFinish: (fileName: string, startIndex?: number) => void;
    assertUrlItemStartFinish: (fileName: string, startIndex?: number) => void;
    assertLogEntryCount: (count: number, obj: any) => void;
    assertLogEntryContains: (index: number) => void;
    customAssertLogEntry: (event: string, asserter: (logLine: any[], env: string) => void, options?: { index?: number, all?: boolean }) => void;
    assertLogPattern: (pattern: RegExp, options: { times?: number, index?: number, different?: boolean }) => void;
    resetStoryLog: () => void;
}

declare namespace Cypress {
    interface Chainable {
        storyLog: () => StoryLog,
        visitStory: (component: string, storyName: string, options?: { canvas?: boolean, useMock?: boolean, uploadUrl?: boolean }) => void;
        pasteFile: (fixtureName: string, times?: number, mimeType?: string) => Chainable;
        setUploadOptions: (options: Object) => void;
        setPreSendOptions: (options: Object) => void;
    }

    interface Chainable<Subject = Interception> {
        interceptFormData(cb: (formData: Record<string, any>) => void): Chainable<Subject>;
    }
}
