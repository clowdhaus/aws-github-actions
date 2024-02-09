<p align="center">
  <img src="../.github/images/s3.svg" alt="aws-s3" height="196px">
</p>
<h1 style="font-size: 56px; margin: 0; padding: 0;" align="center">
  S3 Sync
</h1>
<p align="center">
  <img src="https://github.com/clowdhaus/aws-github-actions/workflows/S3%20Sync/badge.svg" alt="S3 sync">
</p>

The `s3_sync` GitHub action will synchronize a local directory to an AWS S3 bucket. Recursively copies new and updated files from the source directory to the destination. Only creates folders in the destination if they contain one or more files.

Note: The sync action works on directories only, not individual files, and can be configured to remove files that exist in the destination bucket but not in the source directory during sync.

## Usage

```yml
- uses: clowdhaus/aws-github-actions/s3_sync@main
  with:
    # Path to local directory to synchronize, starting from project root directory
    # Required: true
    local-path: ''

    # S3 bucket name - excluding any ARN syntax or prefix path, just the bucket name
    # Required: true
    bucket-name: ''

    # Prefix path that will be appended to bucket name, where contents will be synchronized to.
    # Default: ''
    path-prefix: ''

    # Arguments that can be passed to the awscli commands for S3 sync
    # The sync command is not exposed in the javascript sdk and therefore this GitHub action
    # is simply a wrapper for the awscli `aws s3 sync $@` command. For more details on arguments
    # see the documentation at https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html
    # Default: ''
    args: ''
```

## Scenarios

### Sync to root of S3 bucket

```yml
- uses: clowdhaus/aws-github-actions/s3_sync@main
  with:
    local-path: dist/
    bucket-name: my-s3-bucket
```

### Sync to S3 bucket prefix

```yml
- uses: clowdhaus/aws-github-actions/s3_sync@main
  with:
    local-path: dist/
    bucket-name: my-s3-bucket
    path-prefix: src/
```

### Sync to S3 bucket prefix & delete files not in source

```yml
- uses: clowdhaus/aws-github-actions/s3_sync@main
  with:
    local-path: dist/
    bucket-name: my-s3-bucket
    path-prefix: src/
    args: --delete
```

### Sync to S3 bucket prefix with multiple args

Only syncs `*.js` files in `dist/` directory and delete those no longer found from `src/`
Note: order of args dictates precedence - see [documentation](https://docs.aws.amazon.com/cli/latest/reference/s3/index.html#use-of-exclude-and-include-filters)

```yml
- uses: clowdhaus/aws-github-actions/s3_sync@main
  with:
    local-path: dist/
    bucket-name: my-s3-bucket
    path-prefix: src/
    args: --exclude "*" --include "*.js" --delete
```
