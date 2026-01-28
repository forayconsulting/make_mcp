# Teams & Organizations API

The Teams API provides management of teams, organizations, and user access within Make.com.

## Base Endpoints

```
https://{zone}.make.com/api/v2/teams
https://{zone}.make.com/api/v2/organizations
```

## Organizations

Organizations are the top-level container for teams.

### List Organizations

```http
GET /organizations
```

### Response

```json
{
  "organizations": [
    {
      "id": 123456,
      "name": "My Company",
      "zone": "us2.make.com",
      "license": {
        "name": "Enterprise",
        "apps": "unlimited",
        "scenarios": "unlimited",
        "operations": 100000,
        "dataTransfer": 10737418240
      },
      "timezone": "America/New_York",
      "created": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Organization Details

```http
GET /organizations/{organizationId}
```

### Update Organization

```http
PATCH /organizations/{organizationId}
```

```json
{
  "name": "Updated Company Name",
  "timezone": "America/Los_Angeles"
}
```

---

## Teams

Teams belong to organizations and contain scenarios, connections, etc.

### List Teams

```http
GET /teams?organizationId={orgId}
```

### Response

```json
{
  "teams": [
    {
      "id": 5891096,
      "name": "Development Team",
      "organizationId": 123456,
      "scenarios": 25,
      "operations": 50000,
      "dataTransfer": 1073741824,
      "created": "2023-06-01T00:00:00.000Z"
    }
  ],
  "pg": {
    "limit": 10,
    "offset": 0,
    "total": 3
  }
}
```

### Get Team Details

```http
GET /teams/{teamId}
```

### Response

```json
{
  "team": {
    "id": 5891096,
    "name": "Development Team",
    "organizationId": 123456,
    "scenarios": 25,
    "operations": {
      "used": 12500,
      "limit": 50000
    },
    "dataTransfer": {
      "used": 536870912,
      "limit": 1073741824
    },
    "members": [
      {
        "id": 789,
        "email": "user@company.com",
        "role": "admin"
      }
    ]
  }
}
```

### Create Team

```http
POST /teams?organizationId={orgId}
```

```json
{
  "name": "New Team",
  "operations": 10000,
  "dataTransfer": 1073741824
}
```

### Update Team

```http
PATCH /teams/{teamId}
```

```json
{
  "name": "Renamed Team",
  "operations": 25000
}
```

### Delete Team

```http
DELETE /teams/{teamId}?confirmed=true
```

---

## Team Members

### List Team Members

```http
GET /teams/{teamId}/members
```

### Response

```json
{
  "members": [
    {
      "id": 789,
      "email": "admin@company.com",
      "name": "Admin User",
      "role": "admin",
      "joined": "2023-06-01T00:00:00.000Z"
    },
    {
      "id": 790,
      "email": "member@company.com",
      "name": "Team Member",
      "role": "member",
      "joined": "2023-07-15T00:00:00.000Z"
    }
  ]
}
```

### Team Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access, can manage team |
| `member` | Create/edit scenarios |
| `viewer` | Read-only access |
| `accounting` | View usage and billing |

### Add Team Member

```http
POST /teams/{teamId}/members
```

```json
{
  "email": "newuser@company.com",
  "role": "member"
}
```

### Update Member Role

```http
PATCH /teams/{teamId}/members/{memberId}
```

```json
{
  "role": "admin"
}
```

### Remove Team Member

```http
DELETE /teams/{teamId}/members/{memberId}
```

---

## Folders

Organize scenarios within teams using folders.

### List Folders

```http
GET /folders?teamId={teamId}
```

### Response

```json
{
  "folders": [
    {
      "id": 456,
      "name": "Production Scenarios",
      "teamId": 5891096,
      "parentId": null,
      "scenarios": 10
    },
    {
      "id": 457,
      "name": "Development",
      "teamId": 5891096,
      "parentId": null,
      "scenarios": 15
    }
  ]
}
```

### Create Folder

```http
POST /folders?teamId={teamId}
```

```json
{
  "name": "New Folder",
  "parentId": null
}
```

### Update Folder

```http
PATCH /folders/{folderId}
```

```json
{
  "name": "Renamed Folder"
}
```

### Delete Folder

```http
DELETE /folders/{folderId}
```

---

## Usage & Quotas

### Get Team Usage

```http
GET /teams/{teamId}/usage
```

### Response

```json
{
  "usage": {
    "operations": {
      "used": 12500,
      "limit": 50000,
      "percentage": 25
    },
    "dataTransfer": {
      "used": 536870912,
      "limit": 1073741824,
      "percentage": 50
    },
    "scenarios": {
      "active": 20,
      "total": 25,
      "limit": 100
    },
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

### Get Operation History

```http
GET /teams/{teamId}/usage/history
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | datetime | Start date |
| `to` | datetime | End date |
| `resolution` | string | day, week, month |

### Response

```json
{
  "history": [
    {
      "date": "2024-01-01",
      "operations": 450,
      "dataTransfer": 17825792
    },
    {
      "date": "2024-01-02",
      "operations": 523,
      "dataTransfer": 20971520
    }
  ]
}
```

---

## API Tokens

Manage API tokens for team access.

### List Tokens

```http
GET /tokens?teamId={teamId}
```

### Response

```json
{
  "tokens": [
    {
      "id": 111,
      "name": "CI/CD Token",
      "scopes": ["scenarios:read", "scenarios:run"],
      "created": "2024-01-01T00:00:00.000Z",
      "lastUsed": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Create Token

```http
POST /tokens?teamId={teamId}
```

```json
{
  "name": "New API Token",
  "scopes": [
    "scenarios:read",
    "scenarios:write",
    "scenarios:run",
    "connections:read"
  ]
}
```

### Response

```json
{
  "token": {
    "id": 112,
    "name": "New API Token",
    "value": "abc123xyz789...",
    "scopes": ["scenarios:read", "scenarios:write", "scenarios:run", "connections:read"]
  }
}
```

**Note**: Token value is only returned once at creation.

### Revoke Token

```http
DELETE /tokens/{tokenId}
```

---

## Available Scopes

| Scope | Description |
|-------|-------------|
| `scenarios:read` | List and view scenarios |
| `scenarios:write` | Create and modify scenarios |
| `scenarios:run` | Execute scenarios |
| `connections:read` | View connections |
| `connections:write` | Create and modify connections |
| `hooks:read` | View webhooks |
| `hooks:write` | Create and modify webhooks |
| `data-stores:read` | View data stores |
| `data-stores:write` | Create and modify data stores |
| `teams:read` | View team information |
| `teams:write` | Modify team settings |

---

## Audit Logs (Enterprise)

Enterprise plans have access to audit logs.

### List Audit Events

```http
GET /organizations/{orgId}/audit-logs
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | datetime | Start date |
| `to` | datetime | End date |
| `action` | string | Filter by action type |
| `userId` | integer | Filter by user |

### Response

```json
{
  "events": [
    {
      "id": "evt_123",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "action": "scenario.created",
      "userId": 789,
      "userEmail": "user@company.com",
      "teamId": 5891096,
      "resourceType": "scenario",
      "resourceId": 123456,
      "details": {
        "scenarioName": "New Scenario"
      }
    }
  ]
}
```

---

## Best Practices

1. **Use team tokens** - Create tokens per integration/purpose
2. **Minimal scopes** - Only grant necessary permissions
3. **Monitor usage** - Set up alerts before hitting limits
4. **Organize with folders** - Group related scenarios
5. **Review access** - Regularly audit team membership
6. **Rotate tokens** - Periodically refresh API tokens
