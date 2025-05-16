import { type ArgumentsHost, Catch } from '@nestjs/common';
import { ZodError } from 'zod';

import { BaseExceptionFilter } from './base-exception-filter';

@Catch(ZodError)
export class ZodExceptionFilter extends BaseExceptionFilter<ZodError> {
	catch(exception: ZodError, host: ArgumentsHost) {
		const { response, endpoint } = this.getHttpContext(host);

		return this.sendErrorResponse(response, {
			code: 400,
			content: this.#mapIssuesToResponse(exception.issues),
			endpoint,
			status: 'ERROR',
		});
	}

	#mapIssuesToResponse(issues: ZodError['issues']) {
		return issues.map(({ code, path, message }) => ({
			code,
			path: path[0],
			message,
		}));
	}
}
