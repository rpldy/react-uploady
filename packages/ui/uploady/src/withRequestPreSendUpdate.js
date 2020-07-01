// @flow
import React, { useContext, useLayoutEffect, useState } from "react";
import { assertContext, UploadyContext } from "@rpldy/shared-ui";
import { UPLOADER_EVENTS } from "@rpldy/uploader";

type Props = { id: string };

export default (Component: React$ComponentType<any>) =>
	(props: Props) => {
		const context = assertContext(useContext(UploadyContext));
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