import React from "react";
import styled, { ThemeProvider } from "styled-components";
import VersionBadge from "./VersionBadge";

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px 40px;
    box-sizing: border-box;
    position: relative;
`;

const InfoContainer = styled.div`
    position: absolute;
    top: -4px;
    right: 0;
`;

const StoryVersionBadge = styled(VersionBadge)`
    font-size: 12px;
`;

const UploadyStoryDecorator = (Story, context) => {
    const pkg = context.parameters.pkg;
    const fullPkgName = `@rpldy/${pkg}`;

    return (
        <Container>
            <InfoContainer>
                {pkg &&
                    <StoryVersionBadge pkg={fullPkgName} preText={fullPkgName + " "} withUrl/>}
            </InfoContainer>

            <Story/>
        </Container>
    );
};

export default UploadyStoryDecorator;
