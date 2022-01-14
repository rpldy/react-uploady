import React from "react";
import styled from "styled-components";

const Badge = styled.span`
    font-weight: bold;
    background-color: #0a173c;
    border-radius: 6px;
    padding: 2px 4px;
    font-size: 10px;
    top: -2px;
    position: relative;
    color: #ffffff;
    margin-left: 4px;
`;


const VersionBadge = ({ pkg }) => {
    const info = pkg && PUBLISHED_VERSIONS
        .find(({ name }) => name === pkg);

    return info ? <Badge
        className="version-badge"
        title="released version">
        {info.version}
    </Badge> : null;
};

export default VersionBadge;
