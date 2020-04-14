import { css } from "styled-components";

const uploadButtonCss = css`
	min-width: 100px;
	height: 50px;
	background-color: #010916;
	border: 1px solid #4b5763;
	color: #b0b1b3;
	font-size: 20px;
	display: block;
	margin: 10px 0;
    cursor: pointer;

	&:disabled {
	  background-color: rgba(61,71,88,0.54);
	  color: #afb4b0;
	  cursor: default;
	}
`;

const uploadUrlInputCss = css`
  width: 300px;
	font-size: 18px;
	line-height: 20px;
	height: 20px;
`;

export {
    uploadButtonCss,
    uploadUrlInputCss,
}
