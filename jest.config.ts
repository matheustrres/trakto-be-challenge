import { type Config } from 'jest';

export default {
	rootDir: '.',
	roots: ['<rootDir>/tests/__unit__'],
	displayName: 'Unit test',
	moduleFileExtensions: ['js', 'json', 'ts'],
	testRegex: '.*\\.spec\\.ts$',
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest',
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: './coverage',
	clearMocks: true,
	verbose: true,
	detectOpenHandles: true,
	testEnvironment: 'node',
	moduleNameMapper: {
		'#/(.+)': '<rootDir>/tests/$1',
		'@/@core/(.+)': '<rootDir>/src/@core/$1',
		'@/health/(.+)': '<rootDir>/src/health/$1',
		'@/shared/(.+)': '<rootDir>/src/shared/$1',
	},
} as Config;
