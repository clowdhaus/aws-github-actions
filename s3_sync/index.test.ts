import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';
import {promises as fs} from 'fs';

vi.mock('@actions/core');
vi.mock('fs', () => ({
  promises: {
    lstat: vi.fn().mockResolvedValue({isDirectory: () => true}),
  },
}));
vi.mock('@aws-github-actions/awscli-core', () => ({
  default: {
    getOrInstall: vi.fn().mockResolvedValue({
      call: vi.fn().mockResolvedValue(0),
    }),
  },
}));

describe('s3_sync action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should call setFailed on error', async () => {
    vi.mocked(fs.lstat).mockRejectedValueOnce(new Error('Path not found'));
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'local-path': './dist',
        'bucket-name': 'my-bucket',
        'path-prefix': 'prefix',
        args: '',
      };
      return inputs[name] ?? '';
    });

    await import('./index');
    await new Promise((r) => setTimeout(r, 10));

    expect(core.setFailed).toHaveBeenCalledWith('Path not found');
  });
});
