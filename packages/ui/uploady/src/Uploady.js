// @flow
import React, { useMemo, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import createUploader from "@rupy/uploader";
import type { UploaderType } from "@rupy/shared/types";
import UploadyContext from "./UploadyContext";

const FileInputFieldPortal = ({ container, children }) =>
	ReactDOM.createPortal(children, container);

const Uploady = (props: UploadyProps) => {

	console.log("!!!!!!!!!!!!! RENDERING UPLOADY !!!!!!!!!!!");

	const inputFieldContainer = document.body;
	const inputFieldRef = useRef<HTMLInputElement>();

	const uploader = useMemo<UploaderType>(() => {
		return props.uploader || createUploader({
			destination: props.destination,
		});
	}, [props.uploader]);

	//TODO: ALLOW TO CHANGE DESTINATION USING PROPS !!!!!!!!!!
	//TODO: ALLOW TO SET INPUT FIELD CONTAINER : props.inputFieldContainer

	const getInputField = () => {

		console.log("!!!!!!!!! UPLOADY - INPUT FIELD REF = ", inputFieldRef.current);
		return inputFieldRef.current;
	};

	const api = useMemo(() => ({
		uploader,
		getInputField,
	}), [uploader]);

	//TODO: FILE INPUT ATTRS  TO USE !!!!!!!!!
	// accept - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
	// multiple
	// capture - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture
	// webkitdirectory - https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory

	const onFileInputChange = useCallback((e) => {

		console.log("!!!!!!!!!! UPLOADY - FILE INPUT CHANGE !!!!", e);

		
		uploader.on("")

		uploader.add(); //TODO !!!!!!!!!!!!!! add selected files to uploader

	}, []);

	useEffect(() => {
		//
		console.log("!!!!!!!!!!! UPLOADY USE EFFECT CALLED ", inputFieldRef.current);
		//
		// 	if (inputFieldRef.current){
		// 		inputFieldRef.current.addEventListener("change", )
		// 	}
		//
		//
		// 	return ()=> {
		// 		console.log("!!!!!!!!!!! UPLOADY USE EFFECT DESTRUCTOR CALLED");
		// 	};
		//
	}, [inputFieldRef.current]);

	return <UploadyContext.Provider value={api}>
		<FileInputFieldPortal container={inputFieldContainer}>
			<input type="file"
			       onChange={onFileInputChange}
			       name={props.inputFieldName || "file"}
			       style={{ display: "none" }}
			       ref={inputFieldRef}/>
		</FileInputFieldPortal>


		{props.children}
	</UploadyContext.Provider>;
};

export default Uploady;