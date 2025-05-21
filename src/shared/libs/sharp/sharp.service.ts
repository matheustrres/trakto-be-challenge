import fs from 'node:fs/promises';
import path from 'node:path';

import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

import { parseExif } from '@/shared/utils/exif-reader';

interface SharpVersion {
	path: string;
	width: number;
	size: number;
}

interface SharpMetadata {
	originalMetadata: {
		width: number;
		height: number;
		format: string;
		exif?: Record<string, unknown>;
	};
	versions: {
		low: SharpVersion;
		medium: SharpVersion;
		high: SharpVersion;
	};
}

@Injectable()
export class SharpService {
	async processImage(
		inputPath: string,
		outputDir: string,
	): Promise<SharpMetadata> {
		const image = sharp(inputPath);
		const metadata = await image.metadata();
		const { width = 0, height = 0, format = 'jpeg', exif } = metadata;

		await fs.mkdir(outputDir, { recursive: true });

		const lowPath = path.join(outputDir, 'low.jpg');
		const medPath = path.join(outputDir, 'medium.jpg');
		const highPath = path.join(outputDir, 'high.jpg');

		await Promise.all([
			image.resize({ width: 320 }).jpeg({ quality: 60 }).toFile(lowPath),
			image.resize({ width: 800 }).jpeg({ quality: 75 }).toFile(medPath),
			image.jpeg({ mozjpeg: true, quality: 85 }).toFile(highPath),
		]);

		const [lowStat, medStat, highStat] = await Promise.all([
			fs.stat(lowPath),
			fs.stat(medPath),
			fs.stat(highPath),
		]);

		return {
			originalMetadata: {
				width,
				height,
				format,
				exif: exif ? parseExif(exif) : undefined,
			},
			versions: {
				low: { path: lowPath, width: 320, size: lowStat.size },
				medium: { path: medPath, width: 800, size: medStat.size },
				high: { path: highPath, width, size: highStat.size },
			},
		};
	}
}
