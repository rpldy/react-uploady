// @flow
import { useContext } from "react";
import UploadyContext from "../UploadyContext";
import assertContext from "../assertContext";

import type { UploadyContextType } from "../types.js";

const useUploadyContext = (): UploadyContextType =>
    assertContext(useContext(UploadyContext));

export default useUploadyContext;
