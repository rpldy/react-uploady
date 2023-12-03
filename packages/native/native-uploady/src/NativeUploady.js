// @flow
import React from "react";
import { NoDomUploady } from "@rpldy/shared-ui";

import type { NativeUploadyProps } from "./types";

const NativeUploady = (props: NativeUploadyProps): React$Element<typeof NoDomUploady> => <NoDomUploady {...props} />;

export default NativeUploady;
