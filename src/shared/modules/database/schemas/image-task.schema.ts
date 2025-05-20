import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export enum ImageTaskStatusEnum {
	Pending = 'PENDING',
	Processing = 'PROCESSING',
	Completed = 'COMPLETED',
	Failed = 'FAILED',
}

@Schema({ timestamps: true })
export class ImageTask {
	@Prop({ unique: true })
	taskId!: string;

	@Prop({
		enum: Object.values(ImageTask),
		default: ImageTaskStatusEnum.Pending,
	})
	status!: ImageTaskStatusEnum;

	@Prop()
	originalFilename!: string;

	@Prop()
	width!: number;

	@Prop()
	height!: number;

	@Prop()
	mimetype!: string;

	@Prop({
		type: mongoose.Schema.Types.Mixed,
	})
	exif?: Record<string, unknown>;

	@Prop({
		type: {
			low: Object,
			medium: Object,
			high: Object,
		},
	})
	versions?: unknown;

	@Prop()
	processedAt?: Date;

	@Prop()
	errorMessage?: string;
}

export const ImageTaskSchema = SchemaFactory.createForClass(ImageTask);
