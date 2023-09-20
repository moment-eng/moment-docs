# Atlas Postgres API Integration

This guide will help you configure Atlas to authenticate and proxy requests to the Postgres API.

[Postgres](https://www.postgresql.org/) is an open source relational database.

## Availability

**Public alpha.** This integration is available to all Atlas users, and the API is **_expected_** to change.

## Prerequisites

-   **A running instance of Atlas.** See [installation guides][install-guides] for more details.
-   **A running Postgres server that is accessible to the Atlas instance.**

## Add Postgres Integration to Atlas

We will need to make your Postgres server available to your running Atlas instance.
We will do this by:

1. Adding the Postgres [Connection URI](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
   to the Atlas configuration as an environment variable, _e.g._, `POSTGRES_CONNECTION_URI`. An example connection URI
   is `postgres://user:password@localhost:5432/mydb`.
2. Configuring the Atlas deployment to use a Postgres adapter that adds the Connection URI to the `databaseURL` field.

### Step 1: Add Postgres Connection URI to Atlas Deployment as an Environment Variable

-   **Choose an environment variable name for the Postgres Connection URI.** Generally this is something like `POSTGRES_CONNECTION_URI`.
-   **Add the Postgres Connection URI key you provisioned as an environment variable to your Atlas deployment.**
    The [install guides][install-guides] have instructions for how to do this for each deployment method.
    For example, if you deployed Atlas using ECS, you might add an environment variable `POSTGRES_CONNECTION_URI` to the Pulumi configuration.
    If you deployed using Kubernetes, you might add the `POSTGRES_CONNECTION_URI` environment variable to a `.env` file.
-   **Note the name of the environment variable you chose.** We will use this in the next step to configure the Postgres adapter.

### Step 2: Add Postgres Connection URI to Atlas Configuration

Modify your Atlas configuration file to add the Postgres adapter.

The diff in your version control system should look something like this:

```diff
diff --git a/YOUR_ATLAS_CONFIG.yml b/YOUR_ATLAS_CONFIG.yml
index cb4fc7c..088a9fe 100644
--- a/YOUR_ATLAS_CONFIG.yml
+++ b/YOUR_ATLAS_CONFIG.yml
@@ -20,6 +20,10 @@ spec:
       apiVersion: moment.dev/adapters/v1alpha1
       kind: HTTP
       name: heroku-2
+  - adapterRef:
+      apiVersion: moment.dev/adapters/v1alpha1
+      kind: Postgres
+      name: postgres
   exposedPorts: {}
   gatewayRegistration:
     backoff:
@@ -80,3 +84,13 @@ spec:
     value: Bearer ${{ HEROKU_API_KEY }}
   - name: Accept
     value: application/vnd.heroku+json; version=3
+---
+apiVersion: moment.dev/adapters/v1alpha1
+kind: Postgres
+metadata:
+  name: postgres
+spec:
+  profiles:
+    - name: default
+    - databaseUrl: ${{ POSTGRES_CONNECTION_URI }}
```

The profile name is set to `default` for simplicity of this tutorial, but you can add additional profiles if you have multiple Postgres databases.

### Step 3: Deploy the Updated Atlas Config

The [install guides][install-guides] have instructions for how to deploy Atlas into a variety of environments, including Kubernetes and ECS.

### Step 4: Test the Integration

Once deployed, we can use the `mom ws` command to test the integration.

```sh
./mom ws --api postgres --message "{ \"profile\": \"default\", \"operation\": \"select\", \"statement\": \"select * from <INSERT YOUR TABLE NAME>\" }"
```

## Using the integration in a canvas

This integration can be used in Moment by creating a new cell in a Moment canvas, and pasting the following code.

```typescript
const result = await atlasProxyFetch("/v1/ws/apis/postgres", {
    profile: "default",
    operation: "select",
    statement: "select * from city", // replace with your desired query
});

return JSON.parse(result);
```

If the integration is working, you should see a JSON representation of your query results, for example:

```
[
  {
    "city_id": 1,
    "city_name": "City 1",
    "country_id": 95
  },
  {
    "city_id": 2,
    "city_name": "City 2",
    "country_id": 64
  }
]
```

The Postgres adapter currently supports CRUD `operation` types of `select`, `insert`, `update`, and `delete`.

[install-guides]: /atlas-docs/Installations/
