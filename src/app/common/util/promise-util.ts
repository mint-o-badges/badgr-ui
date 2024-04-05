export function timeoutPromise(timeoutMs = 0): Promise<void> {
	return new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
}

export function animationFramePromise(): Promise<number> {
	return new Promise<number>((resolve) => requestAnimationFrame(resolve));
}

export function createPromise<T>(): PromiseOwnership<T> {
	let resolve: (data: T) => void;
	let reject: (error: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { resolve: resolve!, reject: reject!, promise };
}

export interface PromiseOwnership<T> {
	resolve: (data: T) => void;
	reject: (error: unknown) => void;
	promise: Promise<T>;
}
