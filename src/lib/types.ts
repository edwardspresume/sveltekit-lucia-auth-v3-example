export type AlertMessageType = {
	alertType: 'success' | 'error' | 'warning' | 'info';
	alertText: string;
};

export type EnterKeyHintType =
	| 'search'
	| 'enter'
	| 'done'
	| 'go'
	| 'next'
	| 'previous'
	| 'send'
	| null
	| undefined;

// Type for prettifying an object type
export type PrettifyType<T> = {
	[K in keyof T]: T[K];
} & Record<string, never>;
