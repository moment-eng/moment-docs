import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import { fetchEnvTokens, secretsToEnv, Env } from "./secrets";

const config = new pulumi.Config();
const org = config.get("org") || "template";

let env: Env[] = [];

if (org === "moment") {
  // TODO - this is a hack for CI until the following issue is addressed:
  // https://github.com/pulumi/actions/issues/716#issuecomment-1419754364
  env = fetchEnvTokens([
    "GITHUB_TOKEN",
    "PAGERDUTY_ACCOUNT_TOKEN",
    "DATADOG_API_KEY",
    "DATADOG_APPLICATION_KEY",
    "VERCEL_ADMIN_KEY",
  ])
} else {
  config.requireObject<{ [s: string]: string }>("tokens");
  const tokens = config.getObject<{ [s: string]: string }>("tokens") || {};

  env = secretsToEnv(tokens);
}

const atlasRepo = new awsx.ecr.Repository("atlas");
const envoyRepo = new awsx.ecr.Repository("envoy");

const atlas = new awsx.ecr.Image("atlas", {
  repositoryUrl: atlasRepo.url,
  path: pulumi.interpolate`../../config/atlas/${org}`,
});

const envoy = new awsx.ecr.Image("envoy", {
  repositoryUrl: envoyRepo.url,
  path: "../../config/envoy",
});

const envoyIngressPort = 8000;
const atlasHttpServerPort = 8082;

const targetGroup = {
  port: envoyIngressPort,
  protocol: "HTTP",
  healthCheck: {
    path: "/healthcheck",
    port: envoyIngressPort.toString(),
    protocol: "HTTP",
  },
};


const cluster = new aws.ecs.Cluster("atlas-cluster", {});
const lb = new awsx.lb.ApplicationLoadBalancer("lb", {
  defaultTargetGroup: targetGroup,
});

const service = new awsx.ecs.FargateService("atlas", {
  cluster: cluster.arn,
  assignPublicIp: true,
  desiredCount: 2,
  taskDefinitionArgs: {
    containers: {
      atlas: {
        image: atlas.imageUri,
        command: [
          "./atlas",
          "--config",
          "/config/atlas.yml",
          "--log-level",
          "staging",
        ],
        environment: env,
        cpu: 512,
        memory: 128,
        essential: true,
        portMappings: [
          {
            containerPort: atlasHttpServerPort,
          },
        ],
      },
      envoy: {
        image: envoy.imageUri,
        cpu: 250,
        memory: 128,
        command: ["envoy", "--config-path", "/etc/envoy/envoy.yaml"],
        portMappings: [
          {
            targetGroup: lb.defaultTargetGroup,
          },
          {
            // egress port
            containerPort: 8001,
          },
        ],
      },
    },
  },
});

export const url = lb.loadBalancer.dnsName;
