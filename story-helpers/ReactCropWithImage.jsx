// @flow
import React, { forwardRef } from "react";
import styled from "styled-components";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import type { Node } from "react";

export type CropData = {
    unit: "px" | "%",
    x: number,
    y: number,
    width: number,
    height: number,
};

type OnCropChangeMethod = (crop: CropData, percentCrop: CropData) => void

export type CropProps = {
    crop: CropData,
    onCrop: OnCropChangeMethod,
    src: ?string,
    style?: Object,
};

const StyledReactCrop = styled(ReactCrop)`
    width: 100%;
    max-width: 900px;
    height: 400px;
    max-height: 400px;
`;

const ReactCropWithImage: React.ComponentType<CropProps> = (forwardRef<CropProps, any>(({
                    crop,
                    onCrop,
                    src,
                    style,
                }: CropProps, ref: any): Node => {
        return (
            <StyledReactCrop
                crop={crop}
                onChange={onCrop}
                style={style}
            >
                <img src={src} ref={ref} className="react-crop-img"/>
            </StyledReactCrop>
        );
    }): any);

export default ReactCropWithImage;
