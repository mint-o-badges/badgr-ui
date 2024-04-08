export function throwExpr(error: Error | string): never {
	if (error instanceof Error) {
		throw error;
	} else {
		throw new Error(error);
	}
}
