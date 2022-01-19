export const isPrimitive = (val: any) => {
	return /number|string|bigint|boolean|symbol/.test(typeof val)
}