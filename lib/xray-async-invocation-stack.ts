import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as nodelambda from "@aws-cdk/aws-lambda-nodejs";
import * as logs from "@aws-cdk/aws-logs";

export class XrayAsyncInvocationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const triggeredFunction = new nodelambda.NodejsFunction(this, "triggered", {
      functionName: "test-xray-triggered",
      tracing: lambda.Tracing.PASS_THROUGH,
      logRetention: logs.RetentionDays.ONE_DAY,
    });
    this.grantListBuckets(triggeredFunction);

    const triggeringFunction = new nodelambda.NodejsFunction(this, "triggering", {
      functionName: "test-xray-triggering",
      tracing: lambda.Tracing.ACTIVE,
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        TRIGGERED_FUNCTION_NAME: triggeredFunction.functionName,
      },
    });
    this.grantListBuckets(triggeringFunction);
    triggeredFunction.grantInvoke(triggeringFunction);
  }

  private grantListBuckets(func: lambda.Function) {
    func.addToRolePolicy(
      new iam.PolicyStatement({
        sid: "AllowListBuckets",
        actions: ["s3:ListAllMyBuckets"],
        resources: ["*"],
      })
    );
  }
}
