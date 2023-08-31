import React from "react";
import styled from "styled-components";
import { DiGithubBadge, DiNpm } from "react-icons/di";
import { TiSocialTwitter, TiSocialInstagram } from "react-icons/ti";

const Container = styled.section`
  background-color: #010916;
    border: 1px solid #4b5763;
    color: #b0b1b3;

    position: relative;
    padding: 40px 10px;
    margin-bottom: 40px;

    max-width: 900px;
    width: 80%;
    min-width: 350px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: 2px 4px 8px 2px black;

    img {
      width: 80%;
      max-width: 500px;
    }

    .version {
      display: block;
      margin-bottom: 10px;
        color: #FFF;
    }
`;

const Main = styled.main`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 20px;

    ul {
        margin-bottom: 0;
        list-style-type: none;
        padding: 0;
        min-width: 300px;
        text-align: center;

        li {
            display: inline;
            font-size: 22px;
            line-height: 50px;

            svg {
                margin-right: 12px;
            }
        }
    }

    .lib-links {
        svg {
            fill: #7b7e84;

            &:hover {
                fill: #FFF;
            }
        }
    }

    .personal-links {
        svg {
            fill: #575a60;

            &:hover {
                fill: #000000;
            }
        }
    }

    .docs-link {
        color: #c5c7cc;
        font-size: 18px;

        &:hover {
            color: #FFF;
        }
    }
`;

const InfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    li {
        svg {
            fill: black;
        }
    }
`;

const WelcomeReactUploady = () => {
    return <Main>
        <Container>
            <img
                src="https://res.cloudinary.com/yoav-cloud/image/upload/q_auto,w_1200,f_auto/v1587552934/rpldy/logo/react-uploady-text-logo-light"
                alt="rpldy text logo light"/>

            <h2>Welcome to React-Uploady's Storybook</h2>

            <h3>Current Version</h3>
            {PUBLISHED_VERSIONS
                .filter(({ name }) => ["@rpldy/uploady", "@rpldy/uploader"].includes(name))
                .map(({ name, version }) =>
                    <span className="version" key={name}>{name} - <strong>{version}</strong></span>)
            }

            <br/>
            <h3>React-Uploady Documentation</h3>
            <a className="docs-link" href="https://react-uploady.org" target="_blank" rel="noreferrer noopener">https://react-uploady.org</a>
            <br/>

            <ul className="lib-links">
                <li>
                    <a href="https://github.com/rpldy/react-uploady" target="_blank" rel="noopener" title="rpldy/react-uploady">
                        <DiGithubBadge size={48}/>
                    </a>
                </li>
                <li>
                    <a href="https://www.npmjs.com/search?q=%40rpldy" target="_blank" rel="noopener" title="@rpldy">
                        <DiNpm size={48}/>
                    </a>
                </li>
            </ul>
        </Container>

        <InfoContainer>
            <h3>Created By <a href="https://react-uploady.org/docs/yoav/" target="_blank" rel="noopener">Yoav Niran</a></h3>
            <ul className="personal-links">
                <li>
                    <a href="https://twitter.com/poeticGeek" target="_blank" rel="noopener" title="@poeticGeek">
                        <TiSocialTwitter size={48}/>
                    </a>
                </li>
                <li>
                    <a href="https://www.instagram.com/literarycoder" target="_blank" rel="noopener" title="@literaryCoder">
                        <TiSocialInstagram size={48}/>
                    </a>
                </li>
                <li>
                    <a href="https://github.com/yoavniran" target="_blank" rel="noopener" title="yoavniran">
                        <DiGithubBadge size={48}/>
                    </a>
                </li>
            </ul>
        </InfoContainer>
    </Main>;
};

export {
    WelcomeReactUploady,
};
