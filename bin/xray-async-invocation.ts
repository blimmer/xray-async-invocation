#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { XrayAsyncInvocationStack } from "../lib/xray-async-invocation-stack";

const app = new cdk.App();
new XrayAsyncInvocationStack(app, "TestXrayAsyncInvocationStack");
