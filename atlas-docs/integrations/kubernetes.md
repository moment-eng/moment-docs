# Kubernetes Atlas integration

If you've followed the [install guide][install], Atlas already has access to your Kubernetes cluster.

## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.

## Configuring Atlas

In `install/kubernetes/overlays/staging/atlas.yml` make sure that `kubernetes` is registered as an adapter in the Atlas configuration.

```
spec:
    apiAdapters:
        - adapterRef:
              kind: Kubernetes
              apiVersion: moment.dev/adapters/v1alpha1
              name: kubernetes
```

and at the bottom of the file:

```
---
kind: Kubernetes
apiVersion: moment.dev/adapters/v1alpha1
metadata:
    name: kubernetes
```

If you needed to modify this file, follow the instructions in [our installation guide](install) to apply the Kustomize overlay.

## Deploying Atlas to your Kubernetes environment

Follow our [install guide][install] to deploy Atlas to your Kubernetes environment.

## Testing your integration

You can make requests with `atlasProxyFetch` to any [Kubernetes endpoint][kapi].
Here, we'll retrieve all the namespaces in our Kubernetes cluster.

Add a code cell to your canvas with the following:

```typescript
const res = await atlasProxyFetch("/v1alpha1/instances", {
    headers: { "Atlas-Apis-Kubernetes-Clusterid": clusterID },
});
return res.json();
```

`clusterID` is your own Kubernetes cluster ID.
You can find your cluster ID by running `kubectl get ns default -o jsonpath='{.metadata.uid}'`.

[kapi]: https://kubernetes.io/docs/reference/generated/kubernetes-api/
[install]: atlas-docs/Installations/kubernetes.md
