# Atlas Argo CD API Integration

This guide will help you configure Atlas to authenticate and proxy requests to the Argo CD API.

Argo CD is a declarative, GitOps continuous delivery tool for Kubernetes.
It provides a web UI and a CLI for managing applications and their deployments.

Argo CD also provides a [REST API][argo-api] for programmatic access to the Argo CD platform.
This includes APIs for managing applications, repositories, and settings.

At the end of this guide, your running instance of Atlas will be configured to:

-   Proxy HTTP requests to the Argo CD API.
-   Authenticate these requests using one or more [Argo CD API tokens][api-tokens].

## Availability

**Public alpha.** This integration is available to all Atlas users, but the API may change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   **A running instance of Argo CD.** See [installation guides][argo-install-guides] for more details.
-   [**Access to an Argo CD user with `role:admin`.**][argo-admin]
-   **The [`argocd` CLI][cli].** See [installation guides][argo-install-guides] for more details.

> **Note:** This guide currently requires TLS to be _disabled_ on the `argo-server` service. In
> future releases, Atlas will support loading certificates to communicate with Argo CD over TLS.

## Provision a Argo CD API token

1.  Use `argocd` to **log into an Argo CD instance with an account that has `role:admin` privileges.**

    ```bash
    argocd login <ARGOCD_SERVER>
    ```

1.  **Edit the user list in the Argo CD `ConfigMap` to create a service account** for Atlas to use to authenticate with Argo CD.
    This service account must have **`apiKey` authentication enabled.**
    See [Create new user guide][argo-create-user] for more details.
    Usually this involves changing the `argocd-cm` `ConfigMap` to add a new user to the `users` list.
    For example, the last two lines of this `ConfigMap` add a user named `atlas`.

    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
        labels:
            app.kubernetes.io/name: argocd-cm
            app.kubernetes.io/part-of: argocd
        name: argocd-cm
    data:
        accounts.<ACCOUNT NAME>: apiKey
        accounts.<ACCOUNT NAME>.enabled: "true"
    ```

1.  **Grant the service account appropriate privileges.**
    Many times this role will be `role:admin`.
    Usually this means editing the `argocd-rbac-cm` `ConfigMap` to add the service account to the `policy.csv` list.
    For example, the last two lines of this `ConfigMap`:

    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
        labels:
            app.kubernetes.io/name: argocd-rbac-cm
            app.kubernetes.io/part-of: argocd
        name: argocd-rbac-cm
    data:
        policy.csv: |
            p, role:org-admin, applications, *, */*, allow
            p, role:org-admin, clusters, get, *, allow
            p, role:org-admin, repositories, get, *, allow
            p, role:org-admin, repositories, create, *, allow
            p, role:org-admin, repositories, update, *, allow
            p, role:org-admin, repositories, delete, *, all
            g, <ACCOUNT NAME>, role:org-admin
        policy.default: role:''
    ```

1.  **Check that `argo-server` is running without TLS.**
    Usually this means setting `server.insecure` to `true` in the `argocd-rbac-cm` `ConfigMap`.

    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
        labels:
            app.kubernetes.io/name: argocd-cmd-params-cm
            app.kubernetes.io/part-of: argocd
        name: argocd-cmd-params-cm
    data:
        server.insecure: "true"
    ```

1.  **Deploy the updated `ConfigMap` to Argo CD.**
    This step will vary depending on how you deployed Argo CD.
    For some people, it will involve updating a Helm chart, for others it will involve running `kubectl apply -f` on a YAML file.

1.  **Generate an API key for the service account.**
    Save this API key somewhere safe for the subsequent steps.

    ```bash
    argocd account generate-token --account <ACCOUNT NAME>
    ```

## Add Argo CD Integration to Atlas

### Step 1: Add Argo CD API token to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the Argo CD API token.** Generally this is something like `ARGOCD_TOKEN`.
-   **Add the Argo CD API token you provisioned as an environment variables to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `ARGOCD_TOKEN` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `ARGOCD_TOKEN` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the HTTP adapter.

### Step 2: Add Argo CD API token to Atlas Configuration

We can use the [`mom` CLI][mom] to add the Argo CD API token to the Atlas configuration.
Run this command, changing

-   `YOUR_ATLAS_CONFIG.yml` with the path to your Atlas configuration file
-   `ARGOCD_TOKEN` to the name of the environment variable you chose in the previous step
-   `YOUR_ADAPTER_NAME` to the name you want to use for the HTTP adapter in Atlas, _e.g._, `argocd`
-   `YOUR_ARGOCD_SERVER` to the URL of your Argo CD server, _e.g._, `http://argocd-server.argocd.svc`.

```sh
mom atlas config add-http-adapter \
    -f YOUR_ATLAS_CONFIG.yml \
    --adapter-name YOUR_ADAPTER_NAME \
    --base-url http://YOUR_ARGOCD_SERVER \
    -H 'Authorization: "Bearer ${{ ARGOCD_TOKEN }}"'
```

The diff in your version control system should look something like this:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index 1434ece..204ebde 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -12,6 +12,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: AWS
       name: aws
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: HTTP
+      name: YOUR_ADAPTER_NAME
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -50,3 +54,13 @@ spec:
   headers:
   - name: Authorization
     value: '"token ${{ GITHUB_TOKEN }}"'
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: HTTP
+metadata:
+  name: YOUR_ADAPTER_NAME
+spec:
+  baseUrl: http://YOUR_ARGOCD_SERVER
+  headers:
+  - name: Authorization
+    value: Bearer ${{ ARGOCD_TOKEN }}
```

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom curl` command to test the integration.
Be sure to replace `argocd` with the name you chose in the previous step if it is different.

```sh
mom curl /v1/apis/http/argocd/api/v1/applications
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.
Note that you will need to assign `httpAdapterName` to the name you chose for the HTTP adapter in the previous step, _e.g._, `argocd`.

```typescript
const httpAdapterName = "argocd";
const response = await atlasProxyFetch(`/v1/apis/http/${httpAdapterName}/api/v1/applications`);
return await response.json();
```

If the integration is working, you should see a JSON object with a list of Argo CD users.

[argo-api]: https://argo-cd.readthedocs.io/en/stable/developer-guide/api-docs/
[argo-install-guides]: https://argo-cd.readthedocs.io/en/stable/getting_started/
[argo-admin]: https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/#basic-built-in-roles
[api-tokens]: https://argo-cd.readthedocs.io/en/latest/user-guide/commands/argocd_account_generate-token/
[cli]: https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd/
[argo-create-user]: https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#create-new-user
[mom]: /docs/atlas-docs/Installations/mom-cli-reference.md
[install-guides]: /docs/atlas-docs/Installations/
