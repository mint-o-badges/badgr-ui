import { addQueryParamsToUrl, stripQueryParamsFromUrl } from '../url-util';

describe('addQueryParamsToUrl', () => {
	it('should work in the basic case', () => {
		expect(
			addQueryParamsToUrl('http://somewhere.com/', {
				a: 10,
				b: 'test',
			}),
		).toEqual('http://somewhere.com/?a=10&b=test');
	});

	it('should handle existing query params', () => {
		expect(
			addQueryParamsToUrl('http://somewhere.com/?stuff=foo', {
				a: 10,
				b: 'test',
			}),
		).toEqual('http://somewhere.com/?stuff=foo&a=10&b=test');
	});

	it('should handle hash values', () => {
		expect(
			addQueryParamsToUrl('http://somewhere.com/?stuff=foo#hash', {
				a: 10,
				b: 'test',
			}),
		).toEqual('http://somewhere.com/?stuff=foo&a=10&b=test#hash');
	});
});

describe('stripQueryParamsFromUrl', () => {
	it('should work for a plain url', () => {
		expect(stripQueryParamsFromUrl('http://somewhere.com/')).toEqual('http://somewhere.com/');
	});

	it('should work for a url with hash and no query', () => {
		expect(stripQueryParamsFromUrl('http://somewhere.com/#hash')).toEqual('http://somewhere.com/#hash');
	});

	it('should work for a url with a query', () => {
		expect(stripQueryParamsFromUrl('http://somewhere.com/?a=b&c=d')).toEqual('http://somewhere.com/');
	});

	it('should work for a url with a query and a hash', () => {
		expect(stripQueryParamsFromUrl('http://somewhere.com/?a=b&c=d#hash')).toEqual('http://somewhere.com/#hash');
	});
});
