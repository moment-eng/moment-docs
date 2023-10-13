# Troubleshooting

This guide provides a list of common errors returned in response to Atlas requests, and where applicable potential remediation steps.

## `InvalidErrorType`

This error is a fallback, and is only returned when Atlas encounters an unexpected internal error.

Please contact support, as this usually indicates a bug in Atlas.

## `API_MissingAccessTokenError`

HTTP requests to Atlas require an access token obtained from an Identity Provider (IdP) such as Okta.

Check that the request contains a valid access token in the HTTP header `Atlas-Accesstoken`.

In the Moment web application, this header is added automatically when you use `atlasProxyFetch` instead of the [standard fetch API][fetch].

If you are calling Atlas outside of the Moment web application, you'll need to obtain an access token from the organization's IdP.

## `API_NoMatchingInstanceError`

Traffic could not be routed to an Atlas instance because the request's routing constraints disqualify all known instances.

For example, the Kubernetes adapter requires requests to contain a header `Atlas-Apis-Kubernetes-Clusterid` with a value that is the unique ID of the desired cluster.
If this does not exist, the request will not match the constraints of any instance, and it will return this error.

Check that your request contains all the headers required by the adapter you are trying to use.

## `API_GRPCMessageError`

This error indicates that Atlas encountered an internal error while serializing a gRPC message.

Please contact support, as this usually indicates a bug in Atlas.

## `API_InstanceRequestTimeoutError`

This error indicates that a request to Atlas has timed out.
This can happen both in the Atlas instance, or the Atlas gateway.

Check that your request is expected to return in the timeout period.
If it is not, you may need to contact support to inquire about changing the timeout on the Moment-managed Atlas gateway.

## `API_InstanceCommandResponseError`

This error indicates that Atlas encountered an internal error when it was issued a command by the gateway.

Please contact support, as this usually indicates a bug in Atlas.

## `API_InstanceInvalidResponseTypeError`

This error indicates that Atlas encountered an internal error when it returned an invalid response type in response to a request.

Please contact support, as this usually indicates a bug in Atlas.

## `API_InstanceMessageError`

This error indicates that Atlas encountered an internal error when it was issued a command by the gateway.

Please contact support, as this usually indicates a bug in Atlas.

## `API_InstanceUnknownMessageTypeError`

This error indicates that Atlas encountered an internal error when it was issued a command by the gateway.

Please contact support, as this usually indicates a bug in Atlas.

## `API_InstanceLimitsExceededError`

This error indicates that rate limits for the customer tenant have been exceeded.

Please contact support to increase your limits.

## `API_AdminRequestTimeoutError`

This error indicates that a request to Atlas has timed out.
This can happen both in the Atlas instance, or the Atlas gateway.

Check that your request is expected to return in the timeout period.
If it is not, you may need to contact support to inquire about changing the timeout on the Moment-managed Atlas gateway.

## `API_AdminResponseError`

This error indicates that Atlas encountered an internal error when it was issued a command by the gateway.

Please contact support, as this usually indicates a bug in Atlas.

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
