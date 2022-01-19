export function jsonStringify(value: any): any {
	if (value && typeof value !== 'string') {
		try {
			value = JSON.stringify(value);
		} catch (e) {
		}
	}

	return value;
}