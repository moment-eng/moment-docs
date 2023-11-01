# Atlas Linear Integration

This guide will help you configure Atlas to authenticate and proxy requests to the [Linear API](https://developers.linear.app/docs/graphql/working-with-the-graphql-api).


## Availability

**Public beta.** This integration is available to all Atlas users, but the API may change.


## Linear API Key

Follow these directions to get a [Linear API key](https://developers.linear.app/docs/graphql/working-with-the-graphql-api#personal-api-keys). You must provide an API key in the next step to authorize requests.


## Configuring Atlas

Go to [Atlas Configuration](https://app.moment.dev/settings/atlas) settings and follow the steps to configure and deploy the Linear adapter using the API key from the previous step.


## Testing your integration

You can make requests with `atlasProxyFetch`.

Add a code cell to your canvas with the following:

```typescript
const query = `
query Me {
  viewer {
    id
    name
    email
  }
}
}
    `;
const resp = await atlasProxyFetch(`/v1/apis/http/linear/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
});
return resp.json();
```