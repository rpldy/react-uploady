import React from "react";
import styled from "styled-components";
import { DiGithubBadge, DiNpm } from "react-icons/di";
import { TiSocialTwitter } from "react-icons/ti";

const Container = styled.section`
  background-color: #010916;
    border: 1px solid #4b5763;
    color: #b0b1b3;

    position: relative;
    padding: 40px 10px;
    margin-bottom: 40px;

    max-width: 500px;
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
    }
`;

const Main = styled.main`

  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 100px;

  ul {
      list-style-type: none;
      padding: 0;
      min-width: 300px;

      li {
        display: flex;
        font-size: 22px;
        line-height: 50px;

        svg {
          margin-right: 12px;
        }
      }
    }
`;

export const WelcomeReactUploady = () => {
    return <Main>
        <Container>
            <img
                src="https://res.cloudinary.com/yoav-cloud/image/upload/q_auto,w_1200,f_auto/v1587552934/rpldy/logo/react-uploady-text-logo-light"
                alt="rpldy text logo light"/>

            <h2>Welcome to React-Uploady Storybook</h2>

            <h4>Current Version</h4>
            {rpldyVersion.map((v) => <span className="version" key={v}>{v}</span>)}
        </Container>

        <h3>Useful Links:</h3>
        <ul>
            <li>
                <DiGithubBadge size={48}/>
                <a href="https://github.com/rpldy/react-uploady" target="_blank">rpldy/react-uploady</a>
            </li>
            <li>
                <DiNpm size={48}/>
                <a href="https://www.npmjs.com/search?q=%40rpldy" target="_blank">@rpldy</a>
            </li>
        </ul>

        <h3>Created By:</h3>
        <ul>
            <li>
                <TiSocialTwitter size={48}/>
                <a href="https://twitter.com/poeticGeek" target="_blank">@poeticGeek</a>
            </li>
            <li>
                <DiGithubBadge size={48}/>
                <a href="https://github.com/yoavniran" target="_blank">yoavniran</a>
            </li>
        </ul>
    </Main>;
};

export default {
    title: "Welcome",
    parameters: {
        options: { showPanel: false, theme: {} }, //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
    },
};
