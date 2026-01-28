# Connections API

Connections store authentication credentials for external services used in scenarios.

## Base Endpoint

```
https://{zone}.make.com/api/v2/connections
```

## List Connections

```http
GET /connections?teamId={teamId}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | integer | Required - Team ID |
| `pg[limit]` | integer | Results per page |
| `pg[offset]` | integer | Pagination offset |
| `type` | string | Filter by connection type |
| `accountName` | string | Filter by account name |

### Response

```json
{
  "connections": [
    {
      "id": 123456,
      "name": "My Slack Connection",
      "accountName": "workspace@company.com",
      "accountType": "slack",
      "packageName": "slack",
      "expire": null,
      "metadata": {},
      "teamId": 5891096,
      "upgradeable": false,
      "scoped": true,
      "scopes": ["chat:write", "channels:read"]
    }
  ],
  "pg": {
    "limit": 10,
    "offset": 0,
    "total": 5
  }
}
```

## Get Connection Details

```http
GET /connections/{connectionId}
```

### Response

```json
{
  "connection": {
    "id": 123456,
    "name": "My Slack Connection",
    "accountName": "workspace@company.com",
    "accountType": "slack",
    "packageName": "slack",
    "expire": null,
    "scoped": true,
    "scopes": ["chat:write", "channels:read"],
    "editable": true,
    "uid": null,
    "teamId": 5891096
  }
}
```

## Create Connection

```http
POST /connections?teamId={teamId}
```

### Request Body (API Key)

```json
{
  "accountType": "http-api-key",
  "name": "My API Connection",
  "data": {
    "apiKey": "your-api-key-here",
    "apiKeyPlacement": "header",
    "apiKeyHeaderName": "Authorization"
  }
}
```

### Request Body (Basic Auth)

```json
{
  "accountType": "http-basic",
  "name": "My Basic Auth Connection",
  "data": {
    "username": "user",
    "password": "pass"
  }
}
```

### Request Body (OAuth2)

For OAuth2 connections, you typically need to initiate an OAuth flow:

```json
{
  "accountType": "slack",
  "name": "My Slack Connection",
  "scopes": ["chat:write", "channels:read"]
}
```

Response includes authorization URL:

```json
{
  "connection": {
    "id": 123457,
    "authorizationUrl": "https://slack.com/oauth/v2/authorize?..."
  }
}
```

## Update Connection

```http
PATCH /connections/{connectionId}
```

### Request Body

```json
{
  "name": "Updated Connection Name"
}
```

### Update Credentials

```json
{
  "data": {
    "apiKey": "new-api-key"
  }
}
```

## Delete Connection

```http
DELETE /connections/{connectionId}
```

## Verify Connection

Test if a connection is working:

```http
POST /connections/{connectionId}/verify
```

### Response (Success)

```json
{
  "verified": true
}
```

### Response (Failure)

```json
{
  "verified": false,
  "error": "Invalid credentials"
}
```

## Reauthorize Connection

For OAuth connections that have expired:

```http
POST /connections/{connectionId}/reauthorize
```

Returns new authorization URL.

## Connection Types

### Built-in Types

| Type | Description |
|------|-------------|
| `http-basic` | HTTP Basic Authentication |
| `http-api-key` | API Key authentication |
| `http-oauth2` | Generic OAuth2 |
| `http-oauth2-client-credentials` | OAuth2 Client Credentials |
| `http-oauth2-jwt` | OAuth2 with JWT |

### App-Specific Types

Each app defines its own connection types:

| Type | App |
|------|-----|
| `slack` | Slack |
| `google` | Google services |
| `microsoft` | Microsoft services |
| `salesforce` | Salesforce |
| `github` | GitHub |

## Using Connections in Blueprints

Connections are referenced by ID in module parameters:

```json
{
  "id": 1,
  "module": "slack:postMessage",
  "version": 2,
  "parameters": {
    "__IMTCONN__": 123456
  },
  "mapper": {
    "channel": "C0123456",
    "text": "Hello!"
  }
}
```

The `__IMTCONN__` parameter (or `connection` in newer versions) links the module to a connection.

## Connection Scopes

OAuth connections may have limited scopes:

```http
GET /connections/{connectionId}/scopes
```

```json
{
  "scopes": {
    "available": ["chat:write", "channels:read", "users:read"],
    "granted": ["chat:write", "channels:read"]
  }
}
```

To add scopes, reauthorize with expanded scope list.

## Shared Connections

Connections can be shared across teams:

```http
POST /connections/{connectionId}/share
```

```json
{
  "teamIds": [5891097, 5891098]
}
```

## Connection Metadata

Store custom metadata with connections:

```http
PATCH /connections/{connectionId}
```

```json
{
  "metadata": {
    "environment": "production",
    "owner": "team-a"
  }
}
```

## Best Practices

1. **Verify after creation** - Always verify new connections work
2. **Use descriptive names** - Include environment/purpose in name
3. **Minimal scopes** - Request only needed OAuth scopes
4. **Monitor expiration** - Set up alerts for expiring OAuth tokens
5. **Don't hardcode IDs** - Store connection IDs in variables/config

## Security Considerations

- Connection credentials are encrypted at rest
- API tokens cannot retrieve plain-text credentials
- OAuth tokens can be revoked from the source application
- Use team-level connections to limit exposure
- Audit connection usage via logs
