// @flow
export type CsfExport = {
    component: ?React$AbstractComponent<any, any>,
    title: string,
    parameters: Object,
};

const getCsfExport = (component: ?React$AbstractComponent<any, any>, title: string, readme: any, options: any = {}): CsfExport => {

    if (options.pkg) {
        //we need this coz storybook doesnt pass all the CSF info the renderLabel function
        window.top._storyToPackage = window.top._storyToPackage || {};
        window.top._storyToPackage[title] = `@rpldy/${options.pkg}`;
    }

    return {
        component,
        title: options.section ? `${options.section}/${title}` : title,
        parameters: {
            pkg: options.pkg,
            viewMode: "story",
            docs: {
                description: { component: readme },
            },
            options: {
                showPanel: true,
                // ...options
            },
        },
        excludeStories: !process.env.SB_INTERNAL ? /^TEST_|^UMD_/ : [],
    };
};

export default getCsfExport;
