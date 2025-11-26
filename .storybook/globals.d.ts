export {};

declare var PUBLISHED_VERSIONS: string | any[] | undefined;

declare global {
    interface Window {
        _getPackageVersions?: () => any[];
    }
}

