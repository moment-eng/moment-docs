# Getting Started

Atlas is an authenticating proxy.

It is designed to help engineering teams develop safe, secure internal tools, even when they have to rely on a variety of APIs that have no uniform notion of authentication, identity, security, or authorization.

This specifically includes third-party APIs (_e.g._, GitHub, PagerDuty), private resources (_e.g._, databases, Kubernetes clusters), and internal services.

In this guide, we will configure Atlas to:

* Allow users to sign in once, using a central Identity Provider (IdP) like Auth0 or Okta
* Authenticate and proxy requests to an arbitrary HTTP API (in this case the GitHub API)

## Atlas Configuration UI

To configure all the API adapters you want to use in Moment, follow the steps in Atlas Configuration located at [https://app.moment.dev/settings/atlas](https://app.moment.dev/settings/atlas).

{% @arcade/embed flowId="cOOFT2tljlZ9qy6qvorG" url="https://app.arcade.software/share/cOOFT2tljlZ9qy6qvorG" %}

Following these steps should accomplish the following:
* Set up Atlas in Kubernetes or ECS
* Provision API keys for the adapters you'd like to use
* Configure a config for all the API adapters you'd like to use in Moment
* Copy and apply your Atlas configuration

## [OLD] Steps for setting up Atlas using mom CLI

### Step 0: Log in to the Moment service

If you need to log in to the Moment service using the `mom` CLI, run `mom auth login`. This will open a browser window where you can log in to the Moment service. Be sure to use your organization's Identity Provider (IdP) to log in. (_e.g._, Google, GitHub).

```sh
mom auth login
```

### Step 1: Generate a basic Atlas configuration

We can use `mom atlas config generate` to generate a simple, initial configuration of Atlas. Initially this configuration will do nothing, but we will add to it later.

```sh
# --name:  Any human-readable name, unique to your organization.
# --preset production: Configures Atlas to connect to gateway at `atlas.moment.dev`.
mom atlas config generate \
    --name my-atlas \
    --preset production \
    > atlas.yml
```

### Step 2: Provision a GitHub Personal Access Token

Atlas provides [integrations](integrations/) for several popular HTTP APIs.

If you have not done this already, use the **Provision a GitHub Personal Access Token** section of the [integration guide for the GitHub API](integrations/github.md) to:

1. Provision a GitHub Personal Access Token, and
2. Populate the `GITHUB_TOKEN` environment variable with the API token

### Step 3: Configure Atlas to proxy traffic to the GitHub API

Now that we have a GitHub Personal Access Token, configure Atlas to proxy traffic to the GitHub API using `mom atlas config add-http-adapter`:

```sh
# -f:             The Atlas config file to modify.
# --adapter-name: Can be anything, but must be unique to this config.
# --base-url:     URL to proxy traffic to.
# -H:             `Authorization` header to add to all requests.
 mom atlas config add-http-adapter \
    -f atlas.yml \
    --adapter-name github \
    --base-url https://api.github.com \
    -H 'Authorization: token ${{ GITHUB_TOKEN }}'
```

### Step 4: Test the integration locally

First, use `mom atlas run` to start Atlas locally and connect to the gateway at `atlas.moment.dev`. This will configure your locally-running Atlas instance to receive traffic from `atlas.moment.dev` and proxy traffic to third-party APIs (in this case, `api.github.com`).

```sh
$ mom atlas run -f atlas.yml  # Your Atlas config file
✨ Connecting to gateway at dns:atlas.moment.dev:443

<... many logs will go here ...>
```

At this point, `atlas.moment.dev` is now configured to proxy traffic to your local machine. We can verify this by running `mom curl`:

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
