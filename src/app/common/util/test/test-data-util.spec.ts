import { randomNames } from './test-data-util';

describe('test-data-util', () => {
	it('should not generate duplicate random names', () => {
		let seed = 0;
		const names = randomNames(
			10,
			// By taking the floor and only adding .5, we ensure every other generated name is a duplicate
			() => 'Name' + Math.floor((seed += 0.5)),
		);

		const nameSet = new Set(names);

		expect(nameSet.size).toEqual(10);
	});

	it('should error if it cannot generate enough unique names', () => {
		const seed = 0;
		expect(() => randomNames(10, () => 'Same')).toThrow();
	});
});
