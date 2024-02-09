<p align="center">
  <img src="../.github/images/iam.svg" alt="aws-iam" height="196px">
</p>
<h1 style="font-size: 56px; margin: 0; padding: 0;" align="center">
  IAM Access Credentials
</h1>
<p align="center">
  <img src="https://github.com/clowdhaus/aws-github-actions/workflows/IAM%20Credentials/badge.svg" alt="IAM access credentials">
</p>

The `iam_access_credentials` GitHub action will configure the workflow environment with the necessary IAM access credentials as requested (via environment variables).

## Usage

```yml
- uses: clowdhaus/aws-github-actions/iam_access_credentials@main
  with:
    # AWS Region to send the request to. If defined, this environment variable overrides
    # the value for the profile setting region
    # Required: true
    aws-region: ''

    # AWS access key associated with an IAM user or role
    # Required: true
    aws-access-key-id: ''

    # Specifies the secret key associated with the access key
    # Required: true
    aws-secret-access-key: ''

    # Specifies the session token value that is required if you are using temporary
    # security credentials that you retrieved directly from AWS STS operations
    # Required: true
    aws-session-token: ''

    # Determine if AWS account ID should be hidden from stdout as a secret value
    # Default: 'true'
    mask-aws-account-id: ''

    # Determine if role should be assumed to generate credentials
    # Default: 'false'
    assume-role: ''

    # The Amazon Resource Name (ARN) of the role to assume
    # Required: when `assume-role` == `true`
    role-arn: ''

    # An identifier for the assumed role session
    # Default: 'github-action-iam-access'
    role-session-name: ''

    # The duration, in seconds, of the role session
    # Default: '900'
    duration-seconds: ''

    # A unique identifier that might be required when you assume a role in another account
    external-id: ''
```

## Scenarios

### Standard setup of access credentials from GitHub secrets

```yml
- uses: clowdhaus/aws-github-actions/iam_access_credentials@main
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1
```

### Use credentials from assumed IAM role

```yml
- uses: clowdhaus/aws-github-actions/s3_sync@main
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1
    assume-role: true
    role-arn: arn:aws:iam::123425678910:role/cross-account
```

### Use credentials from assumed IAM role with external ID

```yml
- uses: clowdhaus/aws-github-actions/s3_sync@main
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1
    assume-role: true
    role-arn: arn:aws:iam::123425678910:role/cross-account
    external-id: ${{ secrets.AWS_ASSUMED_ROLE_EXTERNAL_ID }}
```
