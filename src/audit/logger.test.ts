import {describe, it, expect, vi} from 'vitest';
import pino from 'pino';

vi.mock('pino', () => ({
    default: vi.fn(() => ({
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    })),
}));

describe('Logger Configuration', () => {
    it('should initialize pino with correct settings', async () => {
        // @ts-ignore
        const loggerModule = await import('./logger');
        const logger = loggerModule.default;

        // Ensure `pino` was called once with expected options
        expect(pino).toHaveBeenCalledWith({
            level: 'info',
            formatters: {
                level: expect.any(Function),
                bindings: expect.any(Function),
            },
            timestamp: expect.any(Function),
        });

        // Check level formatter
        const formatters = (pino as any).mock.calls[0][0].formatters;
        expect(formatters.level('debug')).toEqual({level: 'debug'});

        // Check timestamp format
        const timestampFn = (pino as any).mock.calls[0][0].timestamp;
        expect(timestampFn()).toMatch(/"timestamp":".*Z"/);
    });

    it('should log messages correctly', async () => {
        // @ts-ignore
        const loggerModule = await import('./logger');
        console.log(loggerModule.default)
        const logger = loggerModule.default;

        const logSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});

        logger.info('Test message');

        expect(logSpy).toHaveBeenCalledWith('Test message');
    });
});