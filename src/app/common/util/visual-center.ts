// Adapted from https://github.com/javierbyte/visual-center/blob/gh-pages/src/visualCenter.js
// MIT License

const COLOR_DIFF_WEIGHT_EXPO = 0.333;
const ROUNDS = 100;

interface VisualCenterCoords {
	visualTop: number;
	visualLeft: number;
}

export interface VisualCenterResult extends VisualCenterCoords {
	bgColor: MatrixColor;
	width: number;
	height: number;
}

export interface MatrixColor {
	r: number;
	g: number;
	b: number;
	a: number;
}
type RgbMatrix = MatrixColor[][];

type Axis = 'X' | 'Y';
type Point = [number, number];

export function canvasVisualCenter(canvas: HTMLCanvasElement): VisualCenterResult {
	const rgbMatrix = rgbMatrixFromCanvas(canvas);

	const height = rgbMatrix.length;
	const width = rgbMatrix[0].length;
	const bgColor = normalizeColor(rgbMatrix[0][0]);

	const { visualLeft, visualTop } = calculateVisualCenter(rgbMatrix);

	return {
		visualTop,
		visualLeft,

		bgColor,
		width,
		height,
	};
}

function rgbMatrixFromCanvas(canvas: HTMLCanvasElement): RgbMatrix {
	const ctx = canvas.getContext('2d');
	const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;

	const result: RgbMatrix = [];
	for (let y = 0; y < canvas.height; y++) {
		result[y] = [];
		for (let x = 0; x < canvas.width; x++) {
			result[y][x] = {
				r: data[y * canvas.width * 4 + x * 4],
				g: data[y * canvas.width * 4 + x * 4 + 1],
				b: data[y * canvas.width * 4 + x * 4 + 2],
				a: data[y * canvas.width * 4 + x * 4 + 3],
			};
		}
	}

	return result;
}

function calculateVisualCenter(rgbMatrix: RgbMatrix) {
	let visualLeft = 0.5;
	let visualTop = 0.5;

	visualLeft = recursiveGetCoord(rgbMatrix, visualLeft, visualTop, 'X', 1 / ROUNDS).visualLeft;
	visualLeft = recursiveGetCoord(rgbMatrix, visualLeft, visualTop, 'X', -1 / ROUNDS).visualLeft;
	visualTop = recursiveGetCoord(rgbMatrix, visualLeft, visualTop, 'Y', 1 / ROUNDS).visualTop;
	visualTop = recursiveGetCoord(rgbMatrix, visualLeft, visualTop, 'Y', -1 / ROUNDS).visualTop;

	return { visualLeft, visualTop };
}

function recursiveGetCoord(
	rgbMatrix: RgbMatrix,
	visualLeft: number,
	visualTop: number,
	currentAxis: Axis,
	stepSize: number,
): VisualCenterCoords {
	const bgColor = normalizeColor(rgbMatrix[0][0]);
	const height = rgbMatrix.length;
	const width = rgbMatrix[0].length;

	let visualLeftToApply = visualLeft;
	let visualTopToApply = visualTop;

	const ops = {
		bgColor,
		height: rgbMatrix.length,
		width: rgbMatrix[0].length,
		maxDiff:
			Math.max(bgColor.r, 255 - bgColor.r) +
			Math.max(bgColor.g, 255 - bgColor.g) +
			Math.max(bgColor.b, 255 - bgColor.b),
		maxDistance: getDistance([0, 0], [width, height]),
	};

	let newVisualLeft = visualLeft;
	let newVisualTop = visualTop;

	if (currentAxis === 'X') {
		newVisualLeft += stepSize;
	} else {
		newVisualTop += stepSize;
	}

	let oldCenterIntensity = getCenterIntensity(rgbMatrix, visualLeft, visualTop, ops);
	let newCenterIntensity = getCenterIntensity(rgbMatrix, newVisualLeft, newVisualTop, ops);

	while (newCenterIntensity > oldCenterIntensity) {
		visualLeftToApply = newVisualLeft;
		visualTopToApply = newVisualTop;

		if (currentAxis === 'X') {
			newVisualLeft += stepSize;
		} else {
			newVisualTop += stepSize;
		}
		oldCenterIntensity = newCenterIntensity;
		newCenterIntensity = getCenterIntensity(rgbMatrix, newVisualLeft, newVisualTop, ops);
	}

	return {
		visualLeft: visualLeftToApply,
		visualTop: visualTopToApply,
	};
}

function getCenterIntensity(
	rgbMatrix: RgbMatrix,
	visualLeft: number,
	visualTop: number,
	ops: { bgColor: MatrixColor; height: number; width: number; maxDiff: number; maxDistance: number },
) {
	const { bgColor, height, width, maxDiff, maxDistance } = ops;

	const centerCol = visualTop * height;
	const centerRow = visualLeft * width;
	const centerPoint: Point = [centerCol, centerRow];

	return rgbMatrix.reduce((resRow, row, rowIdx) => {
		return (
			resRow +
			row.reduce((resCol, col, colIdx) => {
				const cellColorDiff = rgbDiff(bgColor, col, maxDiff);

				if (!cellColorDiff) {
					return resCol;
				}

				const cellDistance = getDistance(centerPoint, [rowIdx, colIdx]);
				const cellColorWeight = cellColorDiff * Math.pow(1 - cellDistance / maxDistance, 0.5) * 1000;

				return resCol + cellColorWeight;
			}, 0)
		);
	}, 0);
}

function getDistance(pointA: Point, pointB: Point): number {
	return Math.pow(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2), 0.5);
}

function normalizeColor(color: MatrixColor): MatrixColor {
	return {
		r: Math.floor(color.r * (color.a / 255) + 255 * (1 - color.a / 255)),
		g: Math.floor(color.g * (color.a / 255) + 255 * (1 - color.a / 255)),
		b: Math.floor(color.b * (color.a / 255) + 255 * (1 - color.a / 255)),
		a: 255,
	};
}

function rgbDiff(baseColor: MatrixColor, testColor: MatrixColor, maxDiff: number): number {
	if (testColor.a === 0) {
		return 0;
	}

	const diff =
		Math.abs(baseColor.r - testColor.r) + Math.abs(baseColor.g - testColor.g) + Math.abs(baseColor.b - testColor.b);
	return Math.round(Math.pow(diff / maxDiff, COLOR_DIFF_WEIGHT_EXPO) * (testColor.a / 255) * 1000);
}
