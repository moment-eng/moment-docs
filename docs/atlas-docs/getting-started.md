# Getting Started

Atlas is an authenticating proxy for managing your most sensitive APIs in Moment.

It is designed to help engineering teams develop safe, secure internal tools, even when they have to rely on a variety of APIs that have no uniform notion of authentication, identity, security, or authorization.

This specifically includes third-party APIs (_e.g._, GitHub, PagerDuty), private resources (_e.g._, databases, Kubernetes clusters), and internal services.

In this guide, we will configure Atlas to:

* Allow users to sign in once, using a central Identity Provider (IdP) like Auth0 or Okta
* Authenticate and proxy requests to an arbitrary HTTP API (in this case the GitHub API)

## Atlas Configuration UI

To configure all the API adapters you want to use in Moment, follow the steps in Atlas Configuration located at [https://app.moment.dev/settings/atlas](https://app.moment.dev/settings/atlas). If everything is set up properly, Atlas Configuration should display the control plane information!

{% @arcade/embed flowId="cOOFT2tljlZ9qy6qvorG" url="https://app.arcade.software/share/cOOFT2tljlZ9qy6qvorG" %}

_Following these steps should accomplish the following_:

* Set up Atlas in Kubernetes or ECS
* Provision API keys for the adapters you'd like to use
* Configure a config for all the API adapters you'd like to use in Moment
* Copy and apply your Atlas configuration

You can also update, delete, and add new adapters (see below). Note that you cannot add [secrets](../../kubernetes/overlays/staging/.env.atlas-integration-tokens) through the control plane at this time and need to redeploy your Atlas follower with your [secret](../../kubernetes/overlays/staging/.env.atlas-integration-tokens) in the environment variable. That said, you can reference any of your [secrets](../../kubernetes/overlays/staging/.env.atlas-integration-tokens) in the control plane when setting up the adapter.

{% @arcade/embed flowId="rtKt64rsMukDowl23WjU" url="https://app.arcade.software/share/rtKt64rsMukDowl23WjU" %}

## Steps for monitoring Atlas using mom CLI

### Step 0: Log in to the Moment service

If you need to log in to the Moment service using the `mom` CLI, run `mom auth login`. This will open a browser window where you can log in to the Moment service. Be sure to use your organization's Identity Provider (IdP) to log in. (_e.g._, Google, GitHub).

```sh
mom auth login
```

### Step 2: Provision a GitHub Personal Access Token

Atlas provides [integrations](integrations/) for several popular HTTP APIs.

If you have not done this already, use the **Provision a GitHub Personal Access Token** section of the [integration guide for the GitHub API](integrations/github.md) to:

1. Provision a GitHub Personal Access Token, and
2. Populate the `GITHUB_TOKEN` environment variable with the API token

### Step 4: Test your integration locally

First, use `mom atlas run` to start Atlas locally and connect to the gateway at `atlas.moment.dev`. This will configure your locally-running Atlas instance to receive traffic from `atlas.moment.dev` and proxy traffic to third-party APIs (in this example, `api.github.com`).

If `atlas.moment.dev` is configured to proxy traffic to your local machine, we can verify this by running `mom curl`:

```sh
# Returns the authenticated user's profile as a JSON object.
mom curl /v1/apis/http/github/user
```

### Step 5: Check that Atlas is running and accessible

Check that your Atlas instance is running using `mom atlas instances list`.

```sh
$ mom atlas instances list
 UID                                   NAME          GATEWAY                   OWNER        APIS  IDPS
 b9474f22-1780-4076-953a-88e3fb9fa5a1  my-ecs-atlas  https://atlas.moment.dev  example.com     7  Auth0
 c6a3fdd7-9e74-4fcd-bba3-1b9639f68e91  my-eks-atlas  https://atlas.moment.dev  example.com     7  Auth0
```

You can also check which APIs Atlas is set up to proxy traffic to using `mom atlas apis list`. If you have set up many integrations using our [integrations guide](integrations/), you may see something like this:

```sh
$ mom atlas apis list -u https://atlas.moment.dev
 KIND  NAME       BASE URL                   INSTANCE NAME  INSTANCE UID
 HTTP  vercel     https://api.vercel.com     my-ecs-atlas   070e9fcc-ffcb-4ced-b118-6731b67a0a4b
 HTTP  github     https://api.github.com     my-ecs-atlas   070e9fcc-ffcb-4ced-b118-6731b67a0a4b
 HTTP  pagerduty  https://api.pagerduty.com  my-ecs-atlas   070e9fcc-ffcb-4ced-b118-6731b67a0a4b
 HTTP  datadog    https://api.datadoghq.com  my-ecs-atlas   070e9fcc-ffcb-4ced-b118-6731b67a0a4b

 KIND  NAME  PROFILES  INSTANCE NAME        INSTANCE UID
 AWS   aws   moment    moment-ecs-follower  070e9fcc-ffcb-4ced-b118-6731b67a0a4b

 KIND    NAME    INSTANCE NAME        INSTANCE UID
 Moment  moment  moment-ecs-follower  070e9fcc-ffcb-4ced-b118-6731b67a0a4b
```

### Step 6: Install Atlas in your cloud environment

Once we verify this proxy works locally, we need to install it in your cloud environment. Atlas has [installation guides](Installations/) for several types of cloud deployment. Notably:

* [Kubernetes via Kustomize](Installations/kubernetes.md).
* [ECS via Pulumi](Installations/ecs.md).

## Develop Your Custom Tools and Dashboards

Now that Atlas is up and running, you can start building custom command-line tools, web portals, data views, and dashboards to interact with your resources. You can also expose infrastructure commands like deployment and rollback to your developers without granting wide access to your infrastructure.

Follow-up items:

* Consult the [integration docs](integrations/) to set up integrations with other APIs.
* Integration docs generally have code available that you can copy into Moment canvases. For example, GitHub's code is in the last section of its [integration guide](integrations/github.md).

## Conclusion

Congratulations! You have successfully set up Atlas to securely access your internal resources. With Atlas, you can streamline your development process and improve the security of your data and infrastructure. If you encounter any issues or have questions, refer to the Atlas documentation or reach out to the Atlas community for support.
