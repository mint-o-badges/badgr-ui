import {inject} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
// TODO: Replace with appropriate new testing stuff
//import {MockBackend, MockConnection} from '@angular/http/testing';
import {HttpClientModule} from '@angular/common/http';
// TODO: Replace with appropriate HttpClientModule stuff
//import {RequestMethod, Response, ResponseOptions} from '@angular/http';

export function setupMockResponseReporting() {
	beforeEach(inject([ MockBackend ], (mockBackend: MockBackend) => {
		MockConnectionHelperManager.managerFor(mockBackend).reset();
	}));

	afterEach(inject([ MockBackend ], (mockBackend: MockBackend) => {
		MockConnectionHelperManager.managerFor(mockBackend).report();
	}));
}

export function expectRequestAndRespondWith(
	mockBackend: MockBackend,
	method: RequestMethod,
	url: RegExp | string,
	response: unknown,
	responseCode = 200
): Promise<unknown> {
	return expectRequest(mockBackend, method, url)
		.then(c => c.respondWithJson(response, responseCode));
}

export function expectRequest(
	mockBackend: MockBackend,
	method: RequestMethod,
	url: RegExp | string
): Promise<MockConnectionHelper> {
	let resolvePromise, rejectPromise;
	const promise: Promise<MockConnectionHelper> = new Promise((resolve, reject) => {
		resolvePromise = resolve;
		rejectPromise = reject;
	});

	// We only want to match the first request
	let requestHandled = false;

	const helperSet = new Set<MockConnectionHelper>();
	const manager = MockConnectionHelperManager.managerFor(mockBackend);
	manager.patternRequestMap.set([ method, url ], helperSet);

	mockBackend.connections.subscribe(
		(connection: MockConnection) => {
			manager.seenConnections.add(connection);

			if ((url instanceof RegExp && url.exec(connection.request.url))
				|| (String(url) === connection.request.url)
			) {
				if (!requestHandled && connection.request.method === method) {
					requestHandled = true;

					const helper = manager.helperFor(connection);

					helperSet.add(helper);
					resolvePromise(helper);
				}
			}
		},
		error => rejectPromise(error)
	);

	return promise;
}

class MockConnectionHelperManager {
	static managerMap = new Map<MockBackend, MockConnectionHelperManager>();

	seenConnections = new Set<MockConnection>();
	connectionHelperMap = new Map<MockConnection, MockConnectionHelper>();
	patternRequestMap = new Map<[RequestMethod, string | RegExp], Set<MockConnectionHelper>>();

	static managerFor(backend: MockBackend): MockConnectionHelperManager {
		let manager = MockConnectionHelperManager.managerMap.get(backend);
		if (! manager) {
			MockConnectionHelperManager.managerMap.set(backend, manager = new MockConnectionHelperManager());
		}

		return manager;
	}

	reset() {
		this.seenConnections.clear();
		this.connectionHelperMap.clear();
		this.patternRequestMap.clear();
	}

	report() {
		let result = "\nEXPECTED REQUESTS:\n";
		let foundProblem = false;

		const missingConnections = new Set<MockConnection>(this.seenConnections as any);

		this.patternRequestMap.forEach((helpers, [method, pattern]) => {
			const methodName = RequestMethod[ method ].toUpperCase();

			result += `\t${methodName} ${pattern}\n`;
			if (helpers.size) {
				helpers.forEach(helper => result += `\t\t${helper.requestLabel}\n`);
				helpers.forEach(helper => missingConnections.delete(helper.connection));
			} else {
				result += `\t\tNO REQUESTS\n`;
				foundProblem = true;
			}
		});

		if (missingConnections.size) {
			result += "\nUNHANDLED REQUESTS:\n";
			missingConnections.forEach(conn => result += "\t" + this.helperFor(conn).requestLabel + "\n");
			foundProblem = true;
		}

		if (foundProblem) {
			debugger;
			console.warn(result);
		}
	}

	helperFor(connection: MockConnection) {
		if (this.connectionHelperMap.has(connection)) {
			return this.connectionHelperMap.get(connection);
		} else {
			const helper = new MockConnectionHelper(connection);
			this.connectionHelperMap.set(connection, helper);
			return helper;
		}
	}
}

export class MockConnectionHelper {
	responses: Response[] = [];

	constructor(public connection: MockConnection) {}

	requestJson<T>() {
		return JSON.parse(this.connection.request.text() as string) as T;
	}

	respondWithJson(json: unknown, statusCode = 200) {
		if (typeof(json) === "string") {
			this.respondWithText(json, statusCode);
		} else {
			this.respondWithText(JSON.stringify(json), statusCode);
		}
	}

	respondWithText(text: string, statusCode = 200) {
		const response = new Response(new ResponseOptions({
			body: text,
			status: statusCode
		}));
		this.responses.push(response);
		this.connection.mockRespond(response);
	}

	get requestLabel() {
		return RequestMethod[ this.connection.request.method ].toUpperCase() + " " + this.connection.request.url;
	}
}
