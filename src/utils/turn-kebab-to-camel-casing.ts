export function turnKebabToCamelCasing(name: string): string {
	return name
		.split(/-+/)
		.map((part, i) => i === 0 && part.length > 1 ? part : part[0].toUpperCase() + part.slice(1))
		.join('') ?? name;
}