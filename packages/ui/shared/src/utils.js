// @flow
import { useEffect, useContext } from "react";
import { UploadyContext } from "@rupy/uploady";
import assertContext from "./assertContext";

const generateUploaderEventHook = (event: string) => {
	return (fn: Function) => {
		const context = assertContext(useContext(UploadyContext));
		const { uploader } = context;

		useEffect(() => {
			uploader.on(event, fn);

			return () => {
				console.log(`########## destructing ${event} hook !!!!!!!!!!`);
				uploader.off(event, fn);
			}
		}, [fn]);
	};
};


export {
	generateUploaderEventHook,
}