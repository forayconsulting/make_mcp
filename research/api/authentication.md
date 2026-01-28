# API Authentication

This document covers authentication methods for the Make.com API.

## Authentication Methods

### API Token (Recommended)

Use API tokens for programmatic access:

```http
Authorization: Token {your-api-token}
```

Example:
```bash
curl -H "Authorization: Token 5e4af9d7-9a30-4abc-b6b2-031c8724a31e" \
  https://us2.make.com/api/v2/scenarios?teamId=5891096
```

### How to Create an API Token

1. Log in to Make.com
2. Go to **Profile** (bottom left)
3. Select **API Access**
4. Click **Add token**
5. Enter a name and select scopes
6. Click **Save**
7. Copy the token (shown only once)

## API Scopes

Tokens can be limited to specific operations:

| Scope | Description |
|-------|-------------|
| `scenarios:read` | List and view scenarios |
| `scenarios:write` | Create, modify, delete scenarios |
| `scenarios:run` | Execute scenarios |
| `connections:read` | View connections |
| `connections:write` | Create, modify, delete connections |
| `hooks:read` | View webhooks |
| `hooks:write` | Create, modify, delete webhooks |
| `data-stores:read` | View data stores and records |
| `data-stores:write` | Create, modify, delete data stores |
| `teams:read` | View team information |
| `teams:write` | Modify team settings |
| `users:read` | View user information |
| `users:write` | Modify user settings |

## API Base URLs

Different zones have different base URLs:

| Zone | Base URL |
|------|----------|
| US1 | `https://us1.make.com/api/v2` |
| US2 | `https://us2.make.com/api/v2` |
| EU1 | `https://eu1.make.com/api/v2` |
| EU2 | `https://eu2.make.com/api/v2` |

Your zone is visible in your Make.com URL (e.g., `us2.make.com`).

## Request Headers

### Required Headers

```http
Authorization: Token {api-token}
```

### Recommended Headers

```http
Content-Type: application/json
Accept: application/json
```

### Full Example

```bash
curl -X POST \
  -H "Authorization: Token 5e4af9d7-9a30-4abc-b6b2-031c8724a31e" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name": "My Scenario"}' \
  https://us2.make.com/api/v2/scenarios?teamId=5891096
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": {
    "message": "Unauthorized",
    "code": "AUTH_ERROR"
  }
}
```

Causes:
- Missing Authorization header
- Invalid token
- Expired token

### 403 Forbidden

```json
{
  "error": {
    "message": "Forbidden",
    "code": "FORBIDDEN",
    "details": {
      "scope": "scenarios:write"
    }
  }
}
```

Causes:
- Token lacks required scope
- Resource belongs to different team
- User lacks permission

## Rate Limiting

API requests are rate-limited per token:

| Plan | Requests/minute |
|------|-----------------|
| Free | 60 |
| Pro | 300 |
| Teams | 600 |
| Enterprise | 1200 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 295
X-RateLimit-Reset: 1705312200
```

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

```json
{
  "error": {
    "message": "Rate limit exceeded",
    "code": "RATE_LIMITED",
    "retryAfter": 30
  }
}
```

## Team Context

Most API calls require a team context:

### Query Parameter

```http
GET /scenarios?teamId=5891096
```

### Path Parameter

```http
GET /teams/5891096/usage
```

## Token Management

### List Tokens

```http
GET /tokens?teamId={teamId}
```

### Revoke Token

```http
DELETE /tokens/{tokenId}
```

### Token Best Practices

1. **Create purpose-specific tokens** - One token per integration
2. **Use minimal scopes** - Only grant necessary permissions
3. **Rotate regularly** - Replace tokens periodically
4. **Don't share tokens** - Each user/service should have own token
5. **Store securely** - Use environment variables, not code

## SDK/Library Authentication

### JavaScript/Node.js

```javascript
const makeApi = {
  baseUrl: 'https://us2.make.com/api/v2',
  token: process.env.MAKE_API_KEY,
  teamId: process.env.MAKE_TEAM,

  async request(method, path, body) {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Token ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  listScenarios() {
    return this.request('GET', `/scenarios?teamId=${this.teamId}`);
  },

  runScenario(scenarioId, data) {
    return this.request('POST', `/scenarios/${scenarioId}/run`, {
      responsive: true,
      data
    });
  }
};
```

### Python

```python
import os
import requests

class MakeAPI:
    def __init__(self):
        self.base_url = f"https://{os.environ['MAKE_ZONE']}/api/v2"
        self.token = os.environ['MAKE_API_KEY']
        self.team_id = os.environ['MAKE_TEAM']
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Token {self.token}',
            'Content-Type': 'application/json'
        })

    def list_scenarios(self):
        response = self.session.get(
            f'{self.base_url}/scenarios',
            params={'teamId': self.team_id}
        )
        response.raise_for_status()
        return response.json()

    def run_scenario(self, scenario_id, data):
        response = self.session.post(
            f'{self.base_url}/scenarios/{scenario_id}/run',
            json={'responsive': True, 'data': data}
        )
        response.raise_for_status()
        return response.json()
```

## Environment Variables

Standard environment variables for Make API:

```bash
MAKE_API_KEY=5e4af9d7-9a30-4abc-b6b2-031c8724a31e
MAKE_ZONE=us2.make.com
MAKE_TEAM=5891096
```

## Security Recommendations

1. **Never commit tokens** - Use `.env` files (gitignored)
2. **Use HTTPS only** - All Make API endpoints use HTTPS
3. **Validate responses** - Check for error responses
4. **Log carefully** - Don't log full tokens
5. **Monitor usage** - Watch for unexpected API calls
6. **IP restrictions** - Enterprise can restrict token IP ranges
