import exifReader from 'exif-reader';

export function parseExif(exifBuffer: Buffer): Record<string, unknown> {
	try {
		return exifReader(exifBuffer);
	} catch {
		return {};
	}
}
