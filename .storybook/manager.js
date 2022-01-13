import React from "react";
import styled from "styled-components";
import { addons } from "@storybook/addons";
import theme from "./theme";

const Badge = styled.span`

    margin: 0 2px;
    font-weight: bold;
    background-color: aqua;
    border-radius: 6px;
    padding: 4px;
`;

addons.setConfig({
    // isFullscreen: false,
    // showAddonsPanel: true,
    // panelPosition: 'right',
    selectedPanel: "REACT_STORYBOOK/readme/panel",
    theme,
    sidebar: {
        renderLabel: ({ name, isComponent }) => {
            const pkg = isComponent && window._storyToPackage?.[name]

            const info = pkg && PUBLISHED_VERSIONS
                .find(({ name }) => name === pkg);

            console.log("FOUND PKG FOR STORY: ", pkg, info);

            return (<div>
                {name}
                {info && <Badge title="current version">{info.version}</Badge>}
            </div>);
        },
    }
});
