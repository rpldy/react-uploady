import { css } from "styled-components";

const uploadButtonCss = css`
	min-width: 100px;
	height: 50px;
	background-color: #1d724d;
	color: #fff;
	font-size: 20px;
	display: block;
	margin: 10px 0;
    cursor: pointer;

	&:disabled {
	  background-color: rgba(97,114,107,0.8);
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
