import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as pythonlambda from "@aws-cdk/aws-lambda-python";
import * as logs from "@aws-cdk/aws-logs";
import * as path from "path";

export class XrayAsyncInvocationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const triggeredFunction = new pythonlambda.PythonFunction(this, "triggered", {
      entry: path.join(__dirname, "triggered"),
      index: "triggered.py",
      functionName: "test-xray-triggered",
      // Since this is the triggered lambda, I'm using PASS_THROUGH instead of ACTIVE. However,
      // the issue described in the README.md file exists whether I use ACTIVE or PASS_THROUGH here.
      tracing: lambda.Tracing.PASS_THROUGH,
      logRetention: logs.RetentionDays.ONE_DAY,
      timeout: cdk.Duration.seconds(30),
    });
    this.grantListBuckets(triggeredFunction);

    const triggeringFunction = new pythonlambda.PythonFunction(this, "triggering", {
      entry: path.join(__dirname, "triggering"),
      index: "triggering.py",
      functionName: "test-xray-triggering",
      tracing: lambda.Tracing.ACTIVE,
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        TRIGGERED_FUNCTION_NAME: triggeredFunction.functionName,
      },
      timeout: cdk.Duration.seconds(30),
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
