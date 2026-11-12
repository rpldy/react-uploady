
export const DESTINATION_TYPES = {
    "mock": "mock",
    "cloudinary": "cloudinary",
    "url": "url",
    "local": "local",
};

export const UMD_NAMES = {
    "CORE": "CORE",
    "CORE_UI": "CORE_UI",
    "CORE_CHUNKED_UI": "CORE_CHUNKED_UI",
    "ALL": "ALL",
};

export const DEFAULT_CHUNK_SIZE = 524_288; //~500KB

//inline 50x50 gray placeholder - avoids relying on an external image service in stories & tests
export const PREVIEW_FALLBACK_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23cccccc'/%3E%3C/svg%3E";
