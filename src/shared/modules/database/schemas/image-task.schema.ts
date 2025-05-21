import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageTaskDocument = ImageTask & Document;

export enum ImageTaskStatusEnum {
	Pending = 'PENDING',
	Processing = 'PROCESSING',
	Completed = 'COMPLETED',
	Failed = 'FAILED',
}

@Schema({ _id: false })
class OriginalMetadata {
	@Prop({ required: true })
	width!: number;

	@Prop({ required: true })
	height!: number;

	@Prop({ required: true })
	mimetype!: string;

	@Prop({ type: SchemaFactory.createForClass(Object), default: {} })
	exif?: Record<string, unknown>;
}
const OriginalMetadataSchema = SchemaFactory.createForClass(OriginalMetadata);

@Schema({ _id: false })
class Version {
	@Prop({ required: true })
	path!: string;

	@Prop({ required: true })
	width!: number;

	@Prop({ required: true })
	size!: number;
}
const VersionSchema = SchemaFactory.createForClass(Version);

@Schema({
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
})
export class ImageTask {
	@Prop({ unique: true })
	taskId!: string;

	@Prop({ name: 'original_filename', required: true })
	originalFilename!: string;

	@Prop({
		type: String,
		enum: ImageTaskStatusEnum,
		default: ImageTaskStatusEnum.Pending,
	})
	status!: ImageTaskStatusEnum;

	@Prop({
		name: 'original_metadata',
		type: OriginalMetadataSchema,
		required: true,
	})
	originalMetadata!: OriginalMetadata;

	@Prop({ name: 'processed_at' })
	processedAt?: Date;

	@Prop({ name: 'error_message' })
	errorMessage?: string;

	@Prop({
		type: {
			low: VersionSchema,
			medium: VersionSchema,
			high: VersionSchema,
		},
	})
	versions?: {
		low: Version;
		medium: Version;
		high: Version;
	};
}

export const ImageTaskSchema = SchemaFactory.createForClass(ImageTask);
