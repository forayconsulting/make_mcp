# Webhooks API

Webhooks allow external systems to trigger Make scenarios via HTTP requests.

## Base Endpoint

```
https://{zone}.make.com/api/v2/hooks
```

## List Webhooks

```http
GET /hooks?teamId={teamId}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | integer | Required - Team ID |
| `pg[limit]` | integer | Results per page |
| `pg[offset]` | integer | Pagination offset |
| `scenarioId` | integer | Filter by scenario |

### Response

```json
{
  "hooks": [
    {
      "id": 123456,
      "name": "My Webhook",
      "teamId": 5891096,
      "scenarioId": 789,
      "type": "web",
      "url": "https://hook.us2.make.com/abc123def456",
      "enabled": true,
      "data": {},
      "queueCount": 0
    }
  ],
  "pg": {
    "limit": 10,
    "offset": 0,
    "total": 3
  }
}
```

## Get Webhook Details

```http
GET /hooks/{hookId}
```

### Response

```json
{
  "hook": {
    "id": 123456,
    "name": "My Webhook",
    "teamId": 5891096,
    "scenarioId": 789,
    "type": "web",
    "url": "https://hook.us2.make.com/abc123def456",
    "enabled": true,
    "queueCount": 5,
    "queueLimit": 1000,
    "created": "2024-01-01T00:00:00.000Z",
    "data": {
      "headers": false,
      "method": true,
      "querystring": true
    }
  }
}
```

## Create Webhook

```http
POST /hooks?teamId={teamId}
```

### Request Body

```json
{
  "name": "New Webhook",
  "type": "web",
  "scenarioId": 789,
  "data": {
    "headers": true,
    "method": true,
    "querystring": true
  }
}
```

### Webhook Types

| Type | Description |
|------|-------------|
| `web` | Standard HTTP webhook |
| `mailhook` | Email-based webhook |
| `gateway` | Custom instant trigger |

### Response

```json
{
  "hook": {
    "id": 123457,
    "name": "New Webhook",
    "url": "https://hook.us2.make.com/xyz789abc123",
    "type": "web",
    "enabled": true
  }
}
```

## Update Webhook

```http
PATCH /hooks/{hookId}
```

### Request Body

```json
{
  "name": "Updated Webhook Name",
  "enabled": false
}
```

## Delete Webhook

```http
DELETE /hooks/{hookId}
```

## Webhook URL Structure

Webhook URLs follow this pattern:
```
https://hook.{zone}.make.com/{hookToken}
```

Examples:
- `https://hook.us2.make.com/abc123def456`
- `https://hook.eu1.make.com/xyz789`

## Sending Data to Webhooks

### POST Request

```bash
curl -X POST https://hook.us2.make.com/abc123def456 \
  -H "Content-Type: application/json" \
  -d '{"key": "value", "items": [1, 2, 3]}'
```

### GET Request with Query Parameters

```bash
curl "https://hook.us2.make.com/abc123def456?param1=value1&param2=value2"
```

### Form Data

```bash
curl -X POST https://hook.us2.make.com/abc123def456 \
  -F "field1=value1" \
  -F "file=@document.pdf"
```

## Webhook Data Structure

Data available in the scenario from webhook:

```json
{
  "body": {...},           // Parsed body content
  "headers": {...},        // Request headers (if enabled)
  "method": "POST",        // HTTP method (if enabled)
  "querystring": {...},    // Query parameters (if enabled)
  "contentType": "application/json"
}
```

## Webhook Queue

Webhooks can queue requests when scenarios can't process immediately:

### Get Queue Status

```http
GET /hooks/{hookId}/queue
```

```json
{
  "queue": {
    "count": 5,
    "limit": 1000,
    "oldest": "2024-01-15T10:00:00.000Z"
  }
}
```

### Clear Queue

```http
DELETE /hooks/{hookId}/queue
```

### Process Queue Item

When scenario is paused, items queue up. Resume scenario to process.

## Custom Webhooks (Gateway)

For more control, use the Gateway module:

### Creating Gateway Webhook

In blueprint:

```json
{
  "id": 1,
  "module": "gateway:CustomWebHook",
  "version": 1,
  "parameters": {
    "hook": null,
    "maxResults": 1
  }
}
```

When scenario is first run, Make creates the webhook automatically.

### Gateway Response

Send custom responses back to webhook caller:

```json
{
  "id": 2,
  "module": "gateway:WebhookResponse",
  "version": 1,
  "mapper": {
    "status": "200",
    "headers": [
      {"key": "Content-Type", "value": "application/json"}
    ],
    "body": "{{toJSON(1.output)}}"
  }
}
```

## Webhook Security

### IP Allowlisting

Restrict webhook access by IP:

```http
PATCH /hooks/{hookId}
```

```json
{
  "data": {
    "ipRestriction": ["192.168.1.0/24", "10.0.0.0/8"]
  }
}
```

### Signature Verification

Some webhooks support HMAC signature verification:

```json
{
  "data": {
    "signatureVerification": {
      "enabled": true,
      "secret": "your-secret-key",
      "header": "X-Signature"
    }
  }
}
```

### Authentication

Add basic auth to webhook:

```json
{
  "data": {
    "auth": {
      "type": "basic",
      "username": "user",
      "password": "pass"
    }
  }
}
```

## Webhook Responses

### Default Response

By default, webhooks return:
```
HTTP 200 OK
{"accepted": true}
```

### Custom Response (Instant Scenarios)

For instant scenarios with WebhookResponse module:
- Custom status code
- Custom headers
- Custom body

### Async Response

For long-running scenarios, respond immediately and process in background:

```json
{
  "accepted": true,
  "executionId": "abc123"
}
```

## Mailhooks

Special webhooks that receive emails:

```http
POST /hooks?teamId={teamId}
```

```json
{
  "name": "Email Receiver",
  "type": "mailhook"
}
```

Response includes email address:
```json
{
  "hook": {
    "id": 123458,
    "email": "abc123@hook.us2.make.com"
  }
}
```

## Best Practices

1. **Use HTTPS** - All webhook URLs use HTTPS by default
2. **Validate payloads** - Use signature verification when available
3. **Handle retries** - Design scenarios to handle duplicate deliveries
4. **Monitor queues** - Set up alerts for growing queues
5. **Document webhooks** - Keep track of what systems use each webhook
6. **Test thoroughly** - Verify webhook behavior before production use
