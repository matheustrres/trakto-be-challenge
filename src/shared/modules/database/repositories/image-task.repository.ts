import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ImageTask } from '@/shared/modules/database/schemas/image-task.schema';

@Injectable()
export class ImageTaskRepository {
	constructor(
		@InjectModel(ImageTask.name)
		private readonly model: Model<ImageTask>,
	) {}

	async create(task: ImageTask): Promise<ImageTask> {
		const newTask = new this.model(task);
		return newTask.save();
	}

	async findOne(taskId: string): Promise<ImageTask | null> {
		return this.model.findOne({ taskId }).exec();
	}

	async updateOne(task: Partial<ImageTask>): Promise<ImageTask | null> {
		return this.model.findOneAndUpdate(
			{ taskId: task.taskId },
			{ $set: task },
			{ new: true },
		);
	}
}
