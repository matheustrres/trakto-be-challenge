import { type Config } from 'jest';

import jestConfig from './jest.config';

export default {
	...jestConfig,
	rootDir: '.',
	roots: ['<rootDir>/tests/__e2e__'],
	displayName: 'E2E Test',
	testRegex: '.*\\.e2e-spec\\.ts$',
	setupFilesAfterEnv: ['<rootDir>/tests/__e2e__/jest.e2e-setup.ts'],
} as Config;
