// @flow
import React, { forwardRef } from "react";
import styled from "styled-components";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import type { Ref, Node } from "react";

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
`;

const ReactCropWithImage: React$AbstractComponent<CropProps, ?HTMLImageElement> =
    forwardRef(({
                    crop,
                    onCrop,
                    src,
                    style,
                }: CropProps, ref: Ref<"img">): Node => {
        return (
            <StyledReactCrop
                crop={crop}
                onChange={onCrop}
                style={style}
            >
                <img src={src} ref={ref} className="react-crop-img"/>
            </StyledReactCrop>
        );
    });

export default ReactCropWithImage;
