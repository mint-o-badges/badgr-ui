// A set of useful javascript array reducers. Could not find a library providing ones that worked nicely with reduce()
// and weren't intended primarily for dynamic javascript type code (e.g. lodash).
// Inspired from http://www.datchley.name/getting-functional-with-javascript-part-2/

export function groupIntoObject<ValueType>(
	keyFor: (ValueType) => string,
): (grouped: { [key: string]: ValueType[] }, value: ValueType) => { [key: string]: ValueType[] } {
	return (grouped: { [key: string]: ValueType[] }, value: ValueType) => {
		grouped = grouped || {};
		const key = keyFor(value);
		const group = grouped[key] || (grouped[key] = []);
		group.push(value);
		return grouped;
	};
}

export interface GroupedPair<K, V> {
	key: K;
	values: V[];
}

export function groupIntoArray<ValueType, KeyType>(
	keyFor: (ValueType) => KeyType,
): (grouped: Array<GroupedPair<KeyType, ValueType>>, value: ValueType) => Array<GroupedPair<KeyType, ValueType>> {
	return (grouped, value) => {
		grouped = Array.isArray(grouped) ? grouped : [];
		const key = keyFor(value);

		let group: GroupedPair<KeyType, ValueType> = grouped.find((g) => g.key === key);
		if (!group) {
			group = { key, values: [] } as GroupedPair<KeyType, ValueType>;
			grouped.push(group);
		}

		group.values.push(value);

		return grouped;
	};
}

export function flatten<T>(): (result: T[], value: T[]) => T[] {
	return (result: T[], value: T[]) => (result || []).concat(value);
}
