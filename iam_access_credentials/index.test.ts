import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';

const mockSend = vi.fn();

vi.mock('@actions/core');
vi.mock('uuid', () => ({v4: () => 'test-uuid'}));
vi.mock('@aws-sdk/client-sts', () => ({
  STSClient: class {
    send = mockSend;
  },
  AssumeRoleCommand: class {
    constructor(public input: unknown) {}
  },
  GetCallerIdentityCommand: class {
    constructor(public input: unknown) {}
  },
}));

describe('iam_access_credentials action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockSend.mockResolvedValue({Account: '123456789012'});
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'aws-region': 'us-east-1',
        'aws-access-key-id': 'AKIAIOSFODNN7EXAMPLE',
        'aws-secret-access-key': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        'aws-session-token': '',
        'mask-aws-account-id': 'true',
        'assume-role': 'false',
        'role-arn': '',
        'role-session-name': '',
        'duration-seconds': '900',
        'external-id': '',
      };
      return inputs[name] ?? '';
    });
  });

  it('should export environment variables and mask account id', async () => {
    const {default: run} = await import('./index');
    await run();

    expect(core.exportVariable).toHaveBeenCalledWith('AWS_ACCESS_KEY_ID', 'AKIAIOSFODNN7EXAMPLE');
    expect(core.exportVariable).toHaveBeenCalledWith('AWS_REGION', 'us-east-1');
    expect(core.setOutput).toHaveBeenCalledWith('aws-account-id', '123456789012');
    expect(core.setSecret).toHaveBeenCalledWith('123456789012');
  });

  it('should mask credentials as secrets', async () => {
    const {default: run} = await import('./index');
    await run();

    expect(core.setSecret).toHaveBeenCalledWith('AKIAIOSFODNN7EXAMPLE');
    expect(core.setSecret).toHaveBeenCalledWith('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  });

  it('should not mask account id when mask-aws-account-id is false', async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'aws-region': 'us-east-1',
        'aws-access-key-id': 'AKIAIOSFODNN7EXAMPLE',
        'aws-secret-access-key': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        'aws-session-token': '',
        'mask-aws-account-id': 'false',
        'assume-role': 'false',
        'role-arn': '',
        'role-session-name': '',
        'duration-seconds': '',
        'external-id': '',
      };
      return inputs[name] ?? '';
    });

    const {default: run} = await import('./index');
    await run();

    expect(core.setOutput).toHaveBeenCalledWith('aws-account-id', '123456789012');
    expect(core.setSecret).not.toHaveBeenCalledWith('123456789012');
  });

  it('should assume role and re-export credentials', async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'aws-region': 'us-east-1',
        'aws-access-key-id': 'AKIAIOSFODNN7EXAMPLE',
        'aws-secret-access-key': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        'aws-session-token': '',
        'mask-aws-account-id': 'true',
        'assume-role': 'true',
        'role-arn': 'arn:aws:iam::123456789012:role/test-role',
        'role-session-name': 'test-session',
        'duration-seconds': '3600',
        'external-id': '',
      };
      return inputs[name] ?? '';
    });

    mockSend
      .mockResolvedValueOnce({
        Credentials: {
          AccessKeyId: 'ASIATEMP123',
          SecretAccessKey: 'tempSecret456',
          SessionToken: 'tempToken789',
        },
      })
      .mockResolvedValueOnce({Account: '123456789012'});

    const {default: run} = await import('./index');
    await run();

    // Should re-export with assumed role credentials
    expect(core.exportVariable).toHaveBeenCalledWith('AWS_ACCESS_KEY_ID', 'ASIATEMP123');
    expect(core.exportVariable).toHaveBeenCalledWith('AWS_SECRET_ACCESS_KEY', 'tempSecret456');
    expect(core.exportVariable).toHaveBeenCalledWith('AWS_SESSION_TOKEN', 'tempToken789');
    // Should mask assumed role credentials
    expect(core.setSecret).toHaveBeenCalledWith('ASIATEMP123');
    expect(core.setSecret).toHaveBeenCalledWith('tempSecret456');
    expect(core.setSecret).toHaveBeenCalledWith('tempToken789');
  });

  it('should fail when assume role returns no credentials', async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'aws-region': 'us-east-1',
        'aws-access-key-id': 'AKIAIOSFODNN7EXAMPLE',
        'aws-secret-access-key': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        'aws-session-token': '',
        'mask-aws-account-id': 'true',
        'assume-role': 'true',
        'role-arn': 'arn:aws:iam::123456789012:role/test-role',
        'role-session-name': 'test-session',
        'duration-seconds': '',
        'external-id': '',
      };
      return inputs[name] ?? '';
    });

    mockSend.mockResolvedValueOnce({Credentials: {}});

    const {default: run} = await import('./index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('AssumeRole response missing credentials');
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
