import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';

vi.mock('@actions/core');
vi.mock('@aws-github-actions/awscli-core', () => ({
  default: {
    getOrInstall: vi.fn().mockResolvedValue({
      callStdout: vi.fn().mockResolvedValue('{"test": "output"}'),
    }),
  },
}));

describe('awscli action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should call setFailed on error', async () => {
    vi.mocked(core.getInput).mockImplementation(() => {
      throw new Error('Missing input');
    });

    await import('./index');
    await new Promise((r) => setTimeout(r, 10));

    expect(core.setFailed).toHaveBeenCalledWith('Missing input');
  });
});
