export function MemoizedProperty() {
	return (target: {}, propertyKey: string, descriptor: PropertyDescriptor) => {
		if (descriptor.get) {
			const oldGet = descriptor.get;

			descriptor.get = function () {
				const value = oldGet.apply(this);
				delete descriptor.get;
				delete descriptor.set;
				Object.defineProperty(this, propertyKey, {
					...descriptor,
					value,
				});
				return value;
			};
		}
	};
}
