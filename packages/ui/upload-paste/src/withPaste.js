// @flow
import React, { forwardRef } from "react";
import usePasteHandler from "./usePasteHandler";

import type { ComponentType } from "react";
import type { PasteProps } from "./types";

const withPaste = (Component: ComponentType<any>): React$AbstractComponent<PasteProps, mixed> => {
    const PasteComponent = (props: PasteProps, ref) => {
        const { id, className, children, onPasteUpload, extraProps, ...uploadOptions } = props;
        const onPaste = usePasteHandler(uploadOptions, onPasteUpload);

        return <Component
            ref={ref}
            id={id}
            className={className}
            {...extraProps}
            onPaste={onPaste}
        >
            {children}
        </Component>;
    };

    return forwardRef<PasteProps, mixed | React$ElementType>(PasteComponent);
};

export default withPaste;
