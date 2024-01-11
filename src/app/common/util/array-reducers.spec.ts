import {GroupedPair, groupIntoArray, groupIntoObject} from './array-reducers';

describe("groupIntoObject", () => {
	it("should group an array correctly", () => {
		expect([ 1, 2, 3, 4, 5 ].reduce(groupIntoObject(n => (n % 2).toString()), {}))
			.toEqual({
				"0": [ 2, 4 ],
				"1": [ 1, 3, 5 ]
			});
	});

	it("should handle a falsey initial value", () => {
		expect([ 1, 2, 3, 4, 5 ]
			.reduce(groupIntoObject(n => (n % 2).toString()), null))
			.toEqual({
				"0": [ 2, 4 ],
				"1": [ 1, 3, 5 ]
			});
	});
});

describe("groupIntoArray", () => {
	it("should group an array correctly", () => {
		expect([ 1, 2, 3, 4, 5 ].reduce(groupIntoArray(n => (n % 2).toString()), []))
			.toEqual([
				{ key: "1", values: [ 1, 3, 5 ] },
				{ key: "0", values: [ 2, 4 ] }
			]);
	});

	it("should handle a falsey initial value", () => {
		expect([ 1, 2, 3, 4, 5 ]
			.reduce(groupIntoArray(n => (n % 2).toString()), null))
			.toEqual([
				{ key: "1", values: [ 1, 3, 5 ] },
				{ key: "0", values: [ 2, 4 ] },
			]);
	});
});
