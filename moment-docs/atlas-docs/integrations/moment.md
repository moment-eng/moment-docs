# Moment (Service Catalog) integration

This guide describes how to configure Atlas to work with Moment's Service Catalog.

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Configuring Atlas

The following will configure Atlas to start discovering service information from GitHub.

We recommended that you provision a separate [GitHub token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) for Atlas to avoid impacting rate limit quotas for existing users.

In `kubernetes/overlays/staging/atlas.yml`, add the following lines if they don't already exist.

Under the `apiAdapters` field, add `moment`, for instance:

```yaml
apiAdapters:
    - adapterRef:
          kind: Moment
          apiVersion: moment.dev/adapters/v1alpha1
          name: moment
```

And, append the following adapter configuration to the end of the file. Make sure to replace
`${{GITHUB_TOKEN}}` with the environment variable containing your token.

```yaml
---
kind: Moment
apiVersion: moment.dev/adapters/v1alpha1
metadata:
    name: moment
spec:
    catalog:
        github:
            baseUrl: https://api.github.com
            accessToken: "${{ GITHUB_TOKEN }}"
```

## Fields

`baseUrl`: Points to the GitHub API's base URL. This should only change if you
are running GitHub enterprise or using the EU version of GitHub.

`accessToken`: Your provisioned GitHub access token. If formatted as
`${{ GITHUB_TOKEN }}`, Atlas will look for the secrets in an environment
variable, `GITHUB_TOKEN`.

`discoverySchedule`: This field is optional. It is the cron schedule for how
frequently Atlas should discover and cache service information. The default is
hourly on the 0th minute.

## Configuring Github repositories with moment.yml files

In order for Atlas to discover service information, `moment.yml` Yaml files
must be configured for services.

We will use the following repository directory structure as an example:

```
moment
├── app
├── backend
│   ├── service-A
│   └── service-B
├── compiler-services
```

We want to define service configurations for `app`, `compiler-services`,
`service-A`, and `service-B`.

The recommended structure to place the Yaml files would be like this:

```
moment
├── moment.yml
├── app
│   └── moment.yml
├── backend
│   ├── moment.yml
│   ├── service-A
│   └── service-B
├── compiler-services
│   └── moment.yml
```

In `moment/moment.yml`, the contents may look like:

```
apiVersion: moment.dev/servicecatalog/v1
kind: ServiceCatalog
spec:
  paths:
    - app
    - backend/*
    - compiler-services
---
apiVersion: moment.dev/servicecatalog/v1
kind: Group
metadata:
  name: "engineering"
  description: "All the engineers"
spec:
  users:
    - name: "Jane Doe"
      email: "jane@moment.dev"
    - name: "Joe Schmoe"
      email: "joe@moment.dev"
  contact:
    - email: "engineering@moment.dev"
      slack:
        - workspace: "moment-eng"
          channels:
            - channel: "engineering-chat"
              id: "C01SFSM39EC"
---
apiVersion: moment.dev/servicecatalog/v1
kind: Group
metadata:
  name: "design"
  description: "All the designers"
spec:
  users:
    - name: "Foo Bar"
      email: "foo@moment.dev"
  contact:
    - email: "design@moment.dev"
      slack:
        - workspace: "moment-eng"
          channels:
            - channel: "design-chat"
              id: "C048R8MFZPS"
```

In `moment/app/moment.yml`, the contents may look like:

```
apiVersion: moment.dev/servicecatalog/v1alpha1
kind: Service
metadata:
  name: "app"
  description: "Single page web application written in TypeScript that runs the Moment frontend."
  tags:
    - "TIER-0"
spec:
  lifecycle: "production"
  owners:
    - kind: Group
      name: "engineering"
  contact:
    - type: "slack"
      workspace: "moment-eng"
      channels:
        - channel: "engineering-chat"
          id: "C01SFSM39EC"
  oncall:
    - type: "pagerduty"
      serviceId: "PJPVT5U"
      domain: "moment.pagerduty.com"
  repos:
    - type: "github"
      org: "moment-eng"
      repo: "moment"
      path: "/app"
  environments:
    production:
      "datadog.com/tags": ["env:production", "service:app"]
      "aws.amazon.com/regions": ["us-west-2"]
      "aws.amazon.com/ecsServiceTags": ["env:production"]
    staging:
      "datadog.com/sloTags": ["env:staging", "service:app"]
      "aws.amazon.com/regions": ["us-west-2"]
      "aws.amazon.com/ecsServiceTags": ["env:staging"]
```

Note that this is a recommended structure, but Atlas offers flexibility in how
you want to structure your Yaml files. Similar to Kubernetes, Atlas only cares
about Resource definitions and not the paths at which the manifests are
defined. As long as the `ServiceCatalog` entity is defined at a `moment.yml`
file in the root of the repository, other resource definitions can be declared
in any subpath.

## Testing your integration with Moment

Once your setup is done, you can test your integration with a Moment canvas.
Create a cell in a Moment canvas with the following code.

```typescript
return (await atlasProxyFetch("/v1/apis/moment/servicecatalog")).json();
```

You should see something like the following result:

```json
{
  "services": [
    {
      "apiVersion": "moment.dev/servicecatalog/v1alpha1",
      "kind": "Service",
      "metadata": {
        "name": "app",
        "description": "Single page web application written in TypeScript that runs the Moment frontend.",
        "tags": [
          "TIER-0"
        ]
      },
      "spec": {
        "lifecycle": "production",
        "owners": [
          {
            "groupRef": {
              "name": "engineering",
              "members": [
                {
                  "name": "Jane Doe",
                  "email": "jane@moment.dev"
                },
                {
                  "name": "Joe Schmoe",
                  "email": "joe@moment.dev"
                }
              ]
            }
          }
        ],
        "contact": [
          {
            "type": "slack",
            "workspace": "moment-eng",
            "channels": [
              {
                "channel": "engineering-chat",
                "id": "C01SFSM39EC"
              }
            ]
          }
        ],
        "oncall": [
          {
            "type": "pagerduty",
            "serviceId": "PJPVT5U",
            "domain": "moment.pagerduty.com"
          }
        ],
        "repos": [
          {
            "type": "github",
            "org": "moment-eng",
            "repo": "moment",
            "path": "/app"
          }
        ],
        "environments": {
          "production": {
            "aws.amazon.com/ecsServiceTags": [
              "env:production"
            ],
            "aws.amazon.com/regions": [
              "us-west-2"
            ],
            "datadog.com/tags": [
              "env:production",
              "service:app"
            ]
          },
          "staging": {
            "aws.amazon.com/ecsServiceTags": [
              "env:staging"
            ],
            "aws.amazon.com/regions": [
              "us-west-2"
            ],
            "datadog.com/sloTags": [
              "env:staging",
              "service:app"
            ]
          }
        }
      }
    },
    ...
  ],
  "groups": [
    {
      "apiVersion": "moment.dev/servicecatalog/v1",
      "kind": "Group",
      "metadata": {
        "name": "design",
        "description": "All the designers",
        "tags": null
      },
      "spec": {
        "users": [
          {
            "name": "Foo Bar",
            "email": "foo@moment.dev"
          }
        ],
        "contact": [
          {
            "email": "design@moment.dev",
            "slack": [
              {
                "workspace": "moment-eng",
                "channels": [
                  {
                    "channel": "design-chat",
                    "id": "C048R8MFZPS"
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      "apiVersion": "moment.dev/servicecatalog/v1",
      "kind": "Group",
      "metadata": {
        "name": "engineering",
        "description": "All the engineers",
        "tags": null
      },
      "spec": {
        "users": [
          {
            "name": "Jane Doe",
            "email": "jane@moment.dev"
          },
          {
            "name": "Joe Schmoe",
            "email": "joe@moment.dev"
          },
        ],
        "contact": [
          {
            "email": "engineering@moment.dev",
            "slack": [
              {
                "workspace": "moment-eng",
                "channels": [
                  {
                    "channel": "engineering-chat",
                    "id": "C01SFSM39EC"
                  }
                ]
              }
            ]
          }
        ]
      }
    },
  ]
}

```

Templates will be available soon!
