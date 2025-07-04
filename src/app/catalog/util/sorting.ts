export function applySorting(data: any[], sortOption: string): void {
	const [sortBy, order] = sortOption.split('_') as ['name' | 'date', 'asc' | 'desc'];
	const multiplier = order === 'asc' ? 1 : -1;

	const sortFn = (a: any, b: any): number => {
		const nameA = a.name;
		const nameB = b.name;
		const createdOnA = new Date(a.createdAt).getTime();
		const createdOnB = new Date(b.createdAt).getTime();

		if (sortBy === 'name') {
			return multiplier * nameA.localeCompare(nameB);
		}
		if (sortBy === 'date') {
			return multiplier * (createdOnA - createdOnB);
		}
		return 0;
	};

	data.sort(sortFn);
}

export function sortUnique(array: string[]): string[] {
	let frequency = {};

	array.forEach(function (value) {
		frequency[value] = 0;
	});

	let uniques = array.filter(function (value) {
		return ++frequency[value] == 1;
	});

	return uniques.sort(function (a, b) {
		return frequency[b] - frequency[a];
	});
}
