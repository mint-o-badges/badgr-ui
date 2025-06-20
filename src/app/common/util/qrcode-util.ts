import { FixMeLater, QRCodeElementType } from 'angularx-qrcode';

export function convertBase64ToBlob(Base64Image: string) {
	// split into two parts
	const parts = Base64Image.split(';base64,');
	// hold the content type
	const imageType = parts[0].split(':')[1];
	// decode base64 string
	const decodedData = window.atob(parts[1]);
	// create unit8array of size same as row data length
	const uInt8Array = new Uint8Array(decodedData.length);
	// insert all character code into uint8array
	for (let i = 0; i < decodedData.length; ++i) {
		uInt8Array[i] = decodedData.charCodeAt(i);
	}
	// return blob image after conversion
	return new Blob([uInt8Array], { type: imageType });
}

// Code from https://github.com/Cordobo/angularx-qrcode/blob/9eab0cb688049d4cd42e0da2b76826aed64e3dd6/projects/demo-app/src/app/app.component.ts#L225
export function saveAsImage(parent: FixMeLater, fileName: string, elementType: QRCodeElementType = 'canvas') {
	let parentElement = null;

	if (elementType === 'canvas') {
		// fetches base 64 data from canvas
		parentElement = parent.qrcElement.nativeElement.querySelector('canvas').toDataURL('image/png');
	} else if (elementType === 'img' || elementType === 'url') {
		// fetches base 64 data from image
		// parentElement contains the base64 encoded image src
		// you might use to store somewhere
		parentElement = parent.qrcElement.nativeElement.querySelector('img').src;
	} else {
		alert("Set elementType to 'canvas', 'img' or 'url'.");
	}

	if (parentElement) {
		// converts base 64 encoded image to blobData
		let blobData = convertBase64ToBlob(parentElement);
		// saves as image
		const blob = new Blob([blobData], { type: 'image/png' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		// name of the file
		link.download = fileName;
		link.click();
	}
}
