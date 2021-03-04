// @flow
import React, { forwardRef } from "react";
import { getIsUploadOptionsComponent } from "@rpldy/shared-ui";
import usePasteHandler from "./usePasteHandler";

import type { ComponentType } from "react";
import type { PasteProps } from "./types";

const withPasteUpload = (Component: ComponentType<any>): React$AbstractComponent<PasteProps, mixed> => {
    const PasteComponent = (props: PasteProps, ref) => {
        const { id, className, children, onPasteUpload, extraProps, ...uploadOptions } = props;

        const onPaste = usePasteHandler(uploadOptions, onPasteUpload);
        const isUploadyComp = getIsUploadOptionsComponent(Component);

        const compExtraProps = isUploadyComp ?
            //when wrapping an Uploady component (ex: UploadButton), need pass it all upload options
            { ...uploadOptions, extraProps: { ...extraProps, onPaste } } :
            { ...extraProps, onPaste };

        return <Component
            ref={ref}
            id={id}
            className={className}
            {...compExtraProps}
        >
            {children}
        </Component>;
    };

    return forwardRef<PasteProps, mixed | React$ElementType>(PasteComponent);
};

export default withPasteUpload;
