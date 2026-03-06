import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';
import {promises as fs} from 'fs';

const mockCall = vi.fn().mockResolvedValue(0);

vi.mock('@actions/core');
vi.mock('fs', () => ({
  promises: {
    lstat: vi.fn().mockResolvedValue({isDirectory: () => true}),
  },
}));
vi.mock('@aws-github-actions/awscli-core', () => ({
  default: {
    getOrInstall: vi.fn().mockResolvedValue({
      call: mockCall,
    }),
  },
}));

describe('s3_sync action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should sync local path to S3', async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'local-path': './dist',
        'bucket-name': 'my-bucket',
        'path-prefix': 'assets',
        args: '--delete',
      };
      return inputs[name] ?? '';
    });

    const {default: run} = await import('./index');
    await run();

    expect(mockCall).toHaveBeenCalledWith([
      's3',
      'sync',
      './dist',
      's3://my-bucket/assets',
      '--delete',
    ]);
  });

  it('should call setFailed on error', async () => {
    vi.mocked(fs.lstat).mockRejectedValueOnce(new Error('Path not found'));
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'local-path': './nonexistent',
        'bucket-name': 'my-bucket',
        'path-prefix': '',
        args: '',
      };
      return inputs[name] ?? '';
    });

    const {default: run} = await import('./index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Path not found');
  });
});
