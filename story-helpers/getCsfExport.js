// @flow
import storyArgs from "./storySetupControls/args";

export type CsfExport = {
    component: ?React$AbstractComponent<any, any>,
    title?: string,
    parameters: Object,
    excludeStories: RegExp | Array<any>,
};

export type ExportOptions = {
    pkg: string,
    section: string,
    useControls?: boolean,
    args?: any,
    argTypes?: any,
    parameters?: any
};

const getCsfExport = (component: ?React$AbstractComponent<any, any>, title: string, readme: any, options: ExportOptions): CsfExport => {

    if (options.pkg) {
        //we need this coz storybook doesnt pass all the CSF info to the renderLabel function
        window.top._storyToPackage = window.top._storyToPackage || {};
        window.top._storyToPackage[title] = `@rpldy/${options.pkg}`;
    }

    const useControls = options?.useControls !== false;

    return {
        component,
        parameters: {
            pkg: options.pkg,
            viewMode: "story",

            //TODO: bring back when https://github.com/storybookjs/storybook/issues/26820 is sorted!
            // docs: {
            //     description: { component: readme },
            // },

            options: {
                showPanel: true,
            },

            ...options?.parameters,
        },

        excludeStories: !process.env.SB_INTERNAL ? /^TEST_|^UMD_/ : [],

        //Replacing Knobs
        args: useControls ? { ...storyArgs.args, ...options?.args } : {},
        argTypes: useControls ? { ...storyArgs.argTypes, ...options?.argTypes } : {},
    };
};

export default getCsfExport;
