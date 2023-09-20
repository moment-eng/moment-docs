# Install Atlas on Kubernetes using Kustomize

This guide will install Atlas onto your Kubernetes cluster.

All configuration for this project will be configured in the `atlas` namespace.

All files needed to install Atlas are in the `kubernetes` directory in the root of this repository.

We will use [Kustomize](https://github.com/kubernetes-sigs/kustomize) for the install.
(Kubernetes also ships with a Kustomize distribution—if `kustomize` is not in your environment, use `kubectl kustomize`)

```
install
├── base
│   ├── cluster_role_binding.yml
│   ├── cluster_role.yml
│   ├── deployment.yml
│   ├── kustomization.yml
│   ├── namespace.yml
│   └── service_account.yml
└── overlays
    └── staging
        ├── .env.atlas-integration-tokens
        └── atlas.yml
        ├── envoy.yml
        ├── kustomization.yml
```

We reference a `staging` cluster here.
If your environment uses a different name, rename the `kubernetes/overlays/staging` directory to use your environment name.

## Kustomize configuration

These files are used to define Atlas and Envoy configurations.

### Required configuration

Open the Atlas configuration file in `kubernetes/overlays/staging/atlas.yml` and modify the following values:

- `.spec.owner`: Set this to your organization's domain identifier. If you log into Moment with
  Google SSO this will be a domain like `example.com`. This will be used by the Moment server to
  determine the organization that is trying to register.

### Optional configuration

#### Adding integrations for third-party APIs

Please refer to the docs in [atlas-docs/integrations][integrations] for a full list of integrations
and how to use them.

Many integrations require credentials. To deploy these to Kubernetes, use the file
`kubernetes/overlays/staging/.env.atlas-integration-tokens` contains placeholders where you can put
access tokens for various APIs.

```
GITHUB_TOKEN=
PAGERDUTY_ACCOUNT_TOKEN=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

To provision these access tokens, see the docs in [atlas-docs/integrations][integrations] for the integration you'd like to enable.

Once you add the tokens you'd like to use, Atlas will automatically discover them and enable the relavant integrations.

### Using integrations in canvases

The docs in `atlas-docs/integrations` contain detailed instructions for using different integrations, as well as examples of code that you can use yourself.

## Install

Apply the configuration onto your Kubernetes cluster in the `atlas` namespace by running [Kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/)

```
kustomize build ./kubernetes/overlays/staging | kubectl apply -f -
```

**Note:** The service account is currently provisioned to allow for read access on ALL [Kubernetes resources](https://kubernetes.io/docs/reference/kubectl/#resource-types).
If you want a more granular permission set, modify `cluster_role.yml` with the desired resources.

## Testing that it works

Check that the pod is running with `kubectl get po -n atlas`.

Once connected, refer to the [API docs][integrations] for how to use Atlas.

[integrations]: /atlas-docs/integrations
