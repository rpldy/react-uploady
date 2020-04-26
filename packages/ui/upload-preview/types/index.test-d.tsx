import * as React from "react";
import UploadPreview, { PreviewComponentProps } from "./index";

const CustomImagePreview = (props: PreviewComponentProps): JSX.Element => {
    return <img src={props.url}/>;
};

const TestUploadPreview: React.FC = () => {
    return <UploadPreview
        fallbackUrl="fallback.com"
        PreviewComponent={CustomImagePreview}
        maxPreviewImageSize={1111}
        maxPreviewVideoSize={9999}/>;
};

const testUploadPreview = (): JSX.Element => {
    return <TestUploadPreview/>;
};

export {
    testUploadPreview,
};
