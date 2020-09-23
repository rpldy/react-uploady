// @flow
import { useContext } from "react";
import UploadyContext from "./UploadyContext";
import assertContext from "./assertContext";

const useUploadyContext = () =>
    assertContext(useContext(UploadyContext));

export default useUploadyContext;
