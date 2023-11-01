# Atlas Overview

## What is Atlas?

Atlas is an authenticating proxy for safely and securely making requests to private resources in your cloud.
You manage and run the Atlas server in your cluster.
**Atlas never exposes secrets or credentials to a client.**
You can use Atlas to add SSO access for your internal data sources, build internal tools inside Moment, or make protected command-line tools.

## What Does Atlas Do?

- **Autodiscovery**

  Atlas automatically discovers and connects to your resources.
Autodiscovery works with all Kubernetes distributions (GKE, AWS EKS, self-hosted clusters, and more).
Atlas can connect to GitHub, PagerDuty, AWS, and PostgreSQL.
Atlas works across many clouds and can federate requests to many clusters.

- **Authorization**

  Atlas takes a request, an OIDC token from an identity provider like Okta or ActiveDirectory, and a set of policies.
It then makes that request to your resources on the authenticated user's behalf without ever exposing internal credentials to the user.

## Why Use Atlas?

To quickly and securely allow access to your internal resources!

- Enable SSO access for any resource in your cloud.
- Build CLIs, data views, web portals, and dashboards for your resources very quickly. We've found that building a CLI for a cloud resource takes about five minutes with Atlas.
- Expose infrastructure commands, like deployment and rollback, to your developers without granting wide access to your infrastructure.
- Use the built-in integration with [Moment](https://www.moment.dev/) to build interactive docs and runbooks.

## [Getting Started](./getting-started.md)

There are multiple options for installing Atlas. We've provided scripts to get Atlas up and running quickly in different environments:

- [Adding Atlas to Your Kubernetes Cloud](./Installations/kubernetes.md)
- [Setting up ECS via Pulumi](./Installations/ecs.md)

## Integrations

- [Connecting to Kubernetes (alpha)](./integrations/kubernetes.md)
- [Connecting to HTTP and REST APIs (alpha)](./integrations/http-and-rest-apis.md)
- [Connecting to AWS (alpha)](./integrations/aws.md)
- [Setting up Moment's Service Catalog (alpha)](./integrations/moment.md)
