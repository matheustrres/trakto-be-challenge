import { ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

type ErrProps<Content> = {
	status: string;
	code: number;
	content: Content;
	endpoint: string;
};

export abstract class BaseExceptionFilter<T = unknown>
	implements ExceptionFilter
{
	protected readonly logger = new Logger(this.constructor.name);

	abstract catch(exception: T, host: ArgumentsHost): void;

	protected getHttpContext(host: ArgumentsHost) {
		const httpCtx = host.switchToHttp();
		const request = httpCtx.getRequest<Request>();
		const response = httpCtx.getResponse<Response>();
		const endpoint = `${request.method} ${request.path}`;

		return { request, response, endpoint };
	}

	protected sendErrorResponse<Content>(
		response: Response,
		{ code, content, endpoint, status }: ErrProps<Content>,
	): Response {
		return response.status(code).json({
			timestamp: new Date().toISOString(),
			status,
			code,
			content,
			endpoint,
		});
	}
}
