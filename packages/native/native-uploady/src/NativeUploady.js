// @flow
import React from "react";
import { NoDomUploady } from "@rpldy/shared-ui";

import type { Node } from "react";
import type { NativeUploadyProps } from "./types";

const NativeUploady = (props: NativeUploadyProps): Node => <NoDomUploady {...props} />;

export default NativeUploady;
