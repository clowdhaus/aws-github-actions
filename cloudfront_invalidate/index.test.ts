import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';

vi.mock('@actions/core');
vi.mock('@aws-sdk/client-cloudfront', () => {
  const mockSend = vi.fn().mockResolvedValue({
    Invalidation: {Id: 'test-invalidation-id'},
  });
  return {
    CloudFrontClient: class {
      send = mockSend;
    },
    CreateInvalidationCommand: class {
      constructor(public input: unknown) {}
    },
  };
});

describe('cloudfront_invalidate action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'distribution-id': 'E1234567890',
        'caller-reference': 'test-ref',
        paths: '/*',
      };
      return inputs[name] ?? '';
    });
  });

  it('should create invalidation and set output', async () => {
    const {default: run} = await import('./index');
    await run();

    expect(core.setOutput).toHaveBeenCalledWith('invalidation-id', 'test-invalidation-id');
  });

  it('should call setFailed on error', async () => {
    vi.mocked(core.getInput).mockImplementation(() => {
      throw new Error('Missing input');
    });

    const {default: run} = await import('./index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Missing input');
  });
});
