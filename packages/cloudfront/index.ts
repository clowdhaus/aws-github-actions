import * as core from "@actions/core";
import * as CloudFront from "aws-sdk/clients/cloudfront";

async function run() {
  try {
    // Inputs:
    // The distribution's id
    const distributionId = core.getInput("distribution-id", {
      required: true
    });
    // A value to uniquely identify an invalidation request
    // CloudFront uses the value to prevent from accidentally resubmitting an identical request
    const callerReference = core.getInput("caller-reference", {
      required: false
    });
    // A list of the paths that you want to invalidate
    const paths = core.getInput("paths", { required: false }).split(/\r?[\n,]/);

    let params = {
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: callerReference,
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    };

    const cloudfront = new CloudFront({ apiVersion: "2019-03-26" });
    const invalidation = await cloudfront.createInvalidation(params).promise();
    const invalidationId = invalidation.Invalidation.Id;
    core.setOutput("invalidation-id", invalidationId);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
