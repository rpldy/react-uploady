// @flow
export type CsfExport<T> = {
    component: ?T,
    title: string,
    parameters: Object,
};

const getCsfExport = <T>(component: ?T, title: string, readme: any, options: any = {}) : CsfExport<T> => ({
    component,
    title,
    parameters: {
        docs: {
            description: { component: readme },
        },
        options: {
            showPanel: true,
            ...options
        },
    },
});

export default getCsfExport;
