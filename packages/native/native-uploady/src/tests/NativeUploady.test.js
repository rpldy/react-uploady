import React from "react";
import { NoDomUploady } from "@rpldy/shared-ui";
import NativeUploady from "../index";

jest.mock("@rpldy/shared-ui", () => ({
    NoDomUploady: () => <div/>,
}));

describe("NativeUploady tests", () => {

    it("should render NativeUploady", () => {

        const wrapper = mount(<NativeUploady debug autoUpload/>);

        expect(wrapper.find(NoDomUploady)).toHaveProp("debug", true);
        expect(wrapper.find(NoDomUploady)).toHaveProp("autoUpload", true);
    });
});
