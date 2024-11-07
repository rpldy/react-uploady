import React from "react";
import { addons } from "@storybook/manager-api";
import theme from "./theme";
import VersionBadge from "./VersionBadge";

addons.setConfig({
    // isFullscreen: false,
    // showAddonsPanel: true,
    // panelPosition: 'right',
    selectedPanel: "REACT_STORYBOOK/readme/panel",
    theme,
    sidebar: {
        renderLabel: ({ name }) => {
            //storybook doesnt pass all the CSF info for isComponent items :(
            const pkg = window._storyToPackage?.[name];

            //before SB7 it was possible to add the Versions through the manager's webpack build but no longer... :(
            const versions = document.getElementById("storybook-preview-iframe").contentWindow._getPackageVersions?.();

            return (<div>
                {name}
                {pkg && versions &&
                    <VersionBadge
                        pkg={pkg}
                        versions={versions}
                    />}
            </div>);
        },
    }
});
