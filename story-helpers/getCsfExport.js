// @flow
export type CsfExport = {
    component: ?React$AbstractComponent<any, any>,
    title: string,
    parameters: Object,
};

const getCsfExport = (component: ?React$AbstractComponent<any, any>, title: string, readme: any, options: any = {}) : CsfExport => ({
    component,
    title,
    parameters: {
        viewMode: "story",
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
