terraform {
  required_version = "~> 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket         = "clowd-haus-iac-us-east-1"
    key            = "aws-github-actions/nonprod/us-east-1/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "clowd-haus-terraform-state"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}

################################################################################
# Common Locals
################################################################################

locals {
  account_id  = data.aws_caller_identity.current.account_id
  region      = data.aws_region.current.name
  environment = "nonprod"
  name        = "aws-github-actions"
}

################################################################################
# Common Data
################################################################################

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

module "tags" {
  # tflint-ignore: terraform_module_pinned_source
  source = "git@github.com:clowdhaus/terraform-tags.git"

  environment = local.environment
  repository  = "https://github.com/clowdhaus/${local.name}"
}

################################################################################
# Test S3 Bucket
################################################################################

module "ec2_test_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 2.14"

  bucket = "${local.name}-${local.account_id}-${local.region}"
  acl    = "private"

  attach_deny_insecure_transport_policy = true

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  versioning = {
    enabled = true
  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = module.tags.tags
}

################################################################################
# CloudFront Distribution
################################################################################

resource "aws_cloudfront_origin_access_identity" "this" {
  comment = "${local.name} CloudFront origin access identity"
}

resource "aws_cloudfront_cache_policy" "this" {
  name        = local.name
  comment     = "Cache policy for ${local.name}"
  min_ttl     = 0
  default_ttl = 86400
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }

    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

resource "aws_cloudfront_distribution" "tfmt_sh" {
  enabled             = true
  comment             = "${local.name} CloudFront distribution"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name = module.ec2_test_bucket.s3_bucket_bucket_regional_domain_name
    origin_id   = module.ec2_test_bucket.s3_bucket_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.this.cloudfront_access_identity_path
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = module.ec2_test_bucket.s3_bucket_id

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
    compress    = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = module.tags.tags
}
