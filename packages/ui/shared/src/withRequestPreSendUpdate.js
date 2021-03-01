// @flow
import React, { useLayoutEffect, useState } from "react";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import useUploadyContext from "./useUploadyContext";

import type { Node } from "React";

type Props = { id: string };

export default (Component: React$ComponentType<any>): ((props: Props) => Node) =>
	(props: Props) => {
		const context = useUploadyContext();
		const { id } = props;

		const [updater, setUpdater] = useState({
			update: null,
			data: null,
		});

		//need layout effect to register for REQUEST_PRE_SEND in time (block)
		useLayoutEffect(() => {
			const handleRequestPreSend = (requestData) =>
				requestData.items.find((item) => item.id === id) &&
				new Promise((resolve) => {
					setUpdater(() => ({
						update: (data) => {
							//unregister handler so this instance doesnt continue listening unnecessarily
							context.off(UPLOADER_EVENTS.REQUEST_PRE_SEND, handleRequestPreSend);
							resolve(data);
						},
						data: requestData,
					}));
				});

			if (id) {
				context.on(UPLOADER_EVENTS.REQUEST_PRE_SEND, handleRequestPreSend);
			}

			return () => {
				if (id) {
					context.off(UPLOADER_EVENTS.REQUEST_PRE_SEND, handleRequestPreSend);
				}
			};
		}, [context, id]);

		return <Component {...props}
						  updateRequest={updater.update}
						  requestData={updater.data}
		/>;
	};
