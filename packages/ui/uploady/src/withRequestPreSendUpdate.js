// @flow
import React, { useContext, useState } from "react";
import { assertContext, UploadyContext } from "@rpldy/shared-ui";
import { UPLOADER_EVENTS } from "@rpldy/uploader";

export default (Component) => {
	return (props) => {
		const context = assertContext(useContext(UploadyContext));

		const [updater, setUpdater] = useState({
			update: null,
			data: null,
		});

		if (props.id) {
			context.on(UPLOADER_EVENTS.REQUEST_PRE_SEND, (data) => {
				if (data.items[0].id === props.id) {
					return new Promise((resolve) => {
						setUpdater(() => ({
							update: resolve,
							data,
						}));
					});
				}
			});
		}

		return <Component {...props}
						  updateRequest={updater.update}
						  requestData={updater.data}
		/>;
	};
};

//
// export default () => {
// 	const [intercept, setIntercept] = useState(true);
// 	const [updaters, setUpdaters] = useState([]);
//
// 	const context = assertContext(useContext(UploadyContext));
//
// 	context.on(UPLOADER_EVENTS.REQUEST_PRE_SEND, (data) => {
// 		return intercept ? new Promise((resolve) => {
// 			const updater = async (cb) => {
// 				const result = await cb(data);
// 				resolve(result);
// 			};
//
// 			setUpdaters(() => updaters.concat(updater));
// 		}) : undefined;
// 	});
//
// 	return {
// 		updaters,
// 		setIntercept
// 	};
// };