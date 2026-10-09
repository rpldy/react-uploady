import { CHUNK_EVENTS } from "@rpldy/chunked-sender";
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import "../chunkEventListenerHooks";

vi.mock("@rpldy/shared-ui");

// calls made on module import - captured before mocks are cleared for each test
const hookCalls = [...generateUploaderEventHook.mock.calls];

describe("eventListenerHooks tests", () => {
	describe("generateUploaderEventHook tests", () => {
		it.each([
			CHUNK_EVENTS.CHUNK_START,
			CHUNK_EVENTS.CHUNK_FINISH,
		])("should generate chunk event hooks for: %s", (event) => {
			expect(hookCalls).toContainEqual([event, false]);
		});
	});
});
