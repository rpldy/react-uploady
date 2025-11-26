import React, { useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import { useArgs } from "storybook/preview-api";
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

// Get PUBLISHED_VERSIONS from either global or process.env (for Storybook 10 compatibility)
const getPublishedVersions = () => {
    // Try process.env first (Storybook 10 preferred method)
    if (typeof process !== 'undefined' && process.env && process.env.PUBLISHED_VERSIONS) {
        try {
            return JSON.parse(process.env.PUBLISHED_VERSIONS);
        } catch (e) {
            console.warn('Failed to parse PUBLISHED_VERSIONS from process.env', e);
        }
    }
    // Fallback to global variable (for DefinePlugin)
    if (typeof PUBLISHED_VERSIONS !== 'undefined') {
        return typeof PUBLISHED_VERSIONS === 'string' 
            ? JSON.parse(PUBLISHED_VERSIONS) 
            : PUBLISHED_VERSIONS;
    }
    return [];
};

const VERSIONS = getPublishedVersions();

// Use bracket notation to avoid TypeScript errors (Babel/Flow compatible)
window['_getPackageVersions'] = () => VERSIONS;

const UploadyStoryDecorator = (Story, context) => {
    const pkg = context.parameters.pkg;
    const fullPkgName = `@rpldy/${pkg}`;
    const [{ }, updateArgs] = useArgs();

    //get query string param uploadUrl value into a variable:
    const uploadUrl = new URLSearchParams(window.location.search).get("_uploadUrl");

    useEffect(() => {
        if (uploadUrl) {
            console.log("...Setting uploadUrl from query string:", uploadUrl, context);
            //we have to do it ourselves because the SB parsing of URL args filters unsafe characters doesnt work in Canvas mode!!!
            updateArgs({ uploadUrl });
        }
    }, [uploadUrl]);

    return (
        <Container>
            <InfoContainer>
                {pkg &&
                    <StoryVersionBadge
                        className=""
                        withUrl
                        pkg={fullPkgName}
                        preText={fullPkgName + " "}
                        versions={VERSIONS}
                    />}
            </InfoContainer>

            <Story/>
        </Container>
    );
};

export default UploadyStoryDecorator;
