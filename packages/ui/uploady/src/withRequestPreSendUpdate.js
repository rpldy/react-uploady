// @flow
import React, { useContext, useState } from "react";
import { assertContext, UploadyContext } from "@rpldy/shared-ui";
import { UPLOADER_EVENTS } from "@rpldy/uploader";

type Props = {id: string};

export default (Component: React$ComponentType<any>) => {
	return (props: Props) => {
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