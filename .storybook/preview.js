import { addDecorator } from "@storybook/react";
import { addReadme } from "storybook-readme";
import cypressDecorator from "./cypressAddon/cypressDecorator";

addDecorator(addReadme);
addDecorator(cypressDecorator);