import { TestRequest, HttpTestingController } from '@angular/common/http/testing';

export function expectRequestAndRespondWith(
	httpTestingController: HttpTestingController,
	method: string,
	url: string,
	response: string,
	responseCode = 200,
): TestRequest {
	const testRequest: TestRequest = expectRequest(httpTestingController, method, url);
	testRequest.flush(response, { status: responseCode });
	return testRequest;
}

export function expectRequest(httpTestingController: HttpTestingController, method: string, url: string): TestRequest {
	const req = httpTestingController.expectOne(url);
	expect(req.request.method).toEqual(method);
	return req;
}
