<p align="center">
  <img src="../.github/images/cloudfront.svg" alt="aws-cloudfront" height="196px">
</p>
<h1 style="font-size: 56px; margin: 0; padding: 0;" align="center">
  CloudFront Invalidate
</h1>
<p align="center">
  <img src="https://github.com/clowdhaus/aws-github-actions/workflows/CloudFront%20Invalidation/badge.svg" alt="CloudFront invalidate">
</p>

The `cloudfront_invalidate` GitHub action creates an invalidation request for an AWS CloudFront distribution. This is typically performed after new content is pushed to the CloudFront origin (S3, ALB, etc.) and you wish to have that new content updated in the CDN caches right away.

## Usage

```yml
- uses: clowdhaus/aws-github-actions/cloudfront_invalidate@main
  with:
    # The CloudFront distribution ID
    # Required: true
    distribution-id: ''

    # A value that you specify to uniquely identify an invalidation request. CloudFront uses the
    # value to prevent you from accidentally resubmitting an identical request. Whenever you
    # create a new invalidation request, you must specify a new value for `caller-reference`
    # and change other values in the request as applicable.
    # Default: git SHA that triggered the workflow
    caller-reference: ''

    # Path patrerns that contains information about the objects that you want to invalidate.
    # For more information, see
    # https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html
    # Note: Use the yaml mutiline pipe | to specify multiple paths, one on each line
    # Default: '/*' (invalidates entire distribution)
    paths: ''
```

## Scenarios

### Invalidate entire distribution

```yml
- uses: clowdhaus/aws-github-actions/cloudfront_invalidate@main
  with:
    distribution-id: E323PSTTFMI4A7
```

### Invalidate multiple paths

```yml
- uses: clowdhaus/aws-github-actions/cloudfront_invalidate@main
  with:
    distribution-id: E323PSTTFMI4A7
    paths: |
    /index.html
    /error.http
    /dist/*
```
