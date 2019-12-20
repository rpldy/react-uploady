import React from "react";
import { useFileProgressListener } from "@rpldy/uploady";

const StoryUploadProgress = () => {
	const [completed, setCompleted] = React.useState({});
	const fileProgress = useFileProgressListener((item) => {
		console.log(">>>>> (hook) File Progress - ", item);
	});

	if (fileProgress && fileProgress.completed) {
		const item = completed[fileProgress.id] || [0];

		if (!~item.indexOf(fileProgress.completed)) {
			item.push(fileProgress.completed);

			setCompleted({
				...completed,
				[fileProgress.id]: item,
			});
		}
	}

	const completedEntries = Object.entries(completed);

	return <div>
		{completedEntries.length ? "Upload Completed:" : ""}<br/>
		{completedEntries
			.map(([id, progress: number[]]): React.Element<'p'> =>
				// $FlowFixMe
				<p key={id}>{id} - {progress.join(", ")}</p>)}
	</div>;
};

export default StoryUploadProgress;
