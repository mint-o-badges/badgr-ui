// Code from https://dev.to/olegmingaleev/image-validation-for-angular-8n9

import { imageAsyncValidator } from './image.validator';

export type Ratio = '1:1' | '4:3' | '16:9' | '3:2' | '5:4' | '8:1' | '2:35' | '1:85' | '21:9' | '9:16';

export const imageRatioAsyncValidator = (allowedRatio: Ratio[]) =>
	imageAsyncValidator((image) => {
		const { width, height } = image;
		const imageRatio = getAspectRatio(width, height);

		if (allowedRatio.includes(imageRatio as Ratio)) {
			return null;
		}

		return {
			imageRatio: `${imageRatio
				.toString()
				.replace(/\./, ':')} is not allowed ratio. Please upload image with allowed ratio ${allowedRatio
				.join(',')
				.replace(/\./g, ':')}.`,
		};
	});

function getAspectRatio(width: number, height: number): Ratio {
	const calculate = (a: number, b: number): number => (b === 0 ? a : calculate(b, a % b));

	return `${width / calculate(width, height)}:${height / calculate(width, height)}` as Ratio;
}
