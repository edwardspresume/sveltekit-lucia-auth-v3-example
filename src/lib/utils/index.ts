export function logError(
	error: unknown,
	context = 'General context',
	extraInfo: Record<string, unknown> = {}
) {
	const errorObject = error instanceof Error ? error : new Error(String(error));

	console.error({
		timestamp: new Date().toISOString(),
		context,
		error: {
			name: errorObject.name ?? 'No name available',
			message: errorObject.message ?? 'No message available',
			stack: errorObject.stack ?? 'No stack trace available'
		},
		extraInfo
	});
}
