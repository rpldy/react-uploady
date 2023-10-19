import { CHUNK_EVENTS } from "@rpldy/chunked-sender";
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import "../chunkEventListenerHooks";

vi.mock("@rpldy/shared-ui");

describe("eventListenerHooks tests", () => {
	describe("generateUploaderEventHook tests", () => {
		it.each([
			CHUNK_EVENTS.CHUNK_START,
			CHUNK_EVENTS.CHUNK_FINISH,
		])("should generate chunk event hooks for: %s", (event) => {
			expect(generateUploaderEventHook).toHaveBeenCalledWith(event, false);
		});
	});
});
