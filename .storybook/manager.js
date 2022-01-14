import React from "react";
import { addons } from "@storybook/addons";
import theme from "./theme";
import VersionBadge from "./VersionBadge";

addons.setConfig({
    // isFullscreen: false,
    // showAddonsPanel: true,
    // panelPosition: 'right',
    selectedPanel: "REACT_STORYBOOK/readme/panel",
    theme,
    sidebar: {
        renderLabel: ({ name, isComponent }) => {
            //storybook doesnt pass all the CSF info for isComponent items :(
            const pkg = isComponent && window._storyToPackage?.[name]

            return (<div>
                {name}
                {pkg && <VersionBadge pkg={pkg} />}
            </div>);
        },
    }
});
