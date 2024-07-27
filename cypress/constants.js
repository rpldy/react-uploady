
export const UPLOAD_URL = Cypress.env("UPLOAD_URL") || "http://localhost:4000/upload";

export const DEFAULT_URL = "http://test.upload/url";

export const DEFAULT_METHOD = "POST";

export const WAIT_X_SHORT = 200;

export const WAIT_SHORT = 800;

export const WAIT_MEDIUM = 1500;

export const WAIT_LONG = 2500;

export const WAIT_X_LONG = 3000;

export const BATCH_ADD = /BATCH_ADD/;

export const BATCH_ERROR = /BATCH_ERROR/;

export const BATCH_FINALIZE = /BATCH_FINALIZE/;

export const BATCH_ABORT = /BATCH_ABORT/;

export const BATCH_PROGRESS = /BATCH_PROGRESS/;

export const ITEM_START = /ITEM_START/;

export const ITEM_ABORT = /ITEM_ABORT/;

export const ITEM_PROGRESS = /ITEM_PROGRESS/;

export const ITEM_FINISH = /ITEM_FINISH/;

export const ITEM_ERROR = /ITEM_ERROR/;

export const ITEM_CANCEL = /ITEM_CANCEL/;

export const CHUNK_START = /CHUNK_START/;

export const CHUNK_FINISH = /CHUNK_FINISH/;

export const ALL_ABORT = /ALL_ABORT/;
