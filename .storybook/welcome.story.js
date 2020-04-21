import React from "react";
import styled from "styled-components";

const Container = styled.section`
  background-color: #010916;
    border: 1px solid #4b5763;
    color: #b0b1b3;

    position: relative;
    left: 50%;
    transform: translateX(-50%);

    max-width: 500px;
    min-width: 350px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export const WelcomeReactUploady = () => {

    return <Container>
        <h2>Welcome to React-Uploady Storybook</h2>
    </Container>;
};

export default {
    title: "Welcome",
    // decorators: [withKnobs],
    parameters: {
    // readme: {
    //     sidebar: readme,
    // },
    options: {theme: {}}, //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
},
};
