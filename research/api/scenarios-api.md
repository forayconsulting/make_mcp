# Scenarios API

The Scenarios API provides full CRUD operations for managing Make.com scenarios.

## Base Endpoint

```
https://{zone}.make.com/api/v2/scenarios
```

## List Scenarios

Retrieves all scenarios for a team.

```http
GET /scenarios?teamId={teamId}
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | integer | Yes | Team ID |
| `pg[limit]` | integer | No | Number of results (default 10, max 100) |
| `pg[offset]` | integer | No | Pagination offset |
| `pg[sortBy]` | string | No | Field to sort by |
| `pg[sortDir]` | string | No | Sort direction (asc/desc) |
| `folderId` | integer | No | Filter by folder |
| `islinked` | boolean | No | Filter on-demand scenarios |
| `scheduling` | string | No | Filter by scheduling type |

### Response

```json
{
  "scenarios": [
    {
      "id": 123456,
      "name": "My Scenario",
      "teamId": 5891096,
      "folderId": null,
      "description": "Description here",
      "islinked": false,
      "isPaused": false,
      "usedPackages": ["google-sheets", "slack"],
      "lastEdit": "2024-01-15T10:30:00.000Z",
      "scheduling": {
        "type": "indefinitely",
        "interval": 15
      },
      "isInvalid": false,
      "isinvalid": false,
      "islocked": false,
      "created": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pg": {
    "limit": 10,
    "offset": 0,
    "total": 42
  }
}
```

## Get Scenario Details

```http
GET /scenarios/{scenarioId}
```

### Response

Returns full scenario object including:
- Basic metadata
- Blueprint reference
- Interface configuration
- Scheduling settings
- Connection references

## Create Scenario

```http
POST /scenarios?teamId={teamId}
```

### Request Body

```json
{
  "name": "New Scenario",
  "description": "Optional description",
  "folderId": null,
  "scheduling": {
    "type": "indefinitely",
    "interval": 15
  },
  "blueprint": "{\"flow\":[...],\"metadata\":{...}}"
}
```

### Blueprint Field

The `blueprint` field is a **JSON string** (not an object) containing the scenario definition. See [blueprints-api.md](./blueprints-api.md) for structure details.

### Scheduling Types

| Type | Description |
|------|-------------|
| `indefinitely` | Runs at regular intervals |
| `once` | Runs once then stops |
| `ondemand` | Only runs when called via API |

### Response

```json
{
  "scenario": {
    "id": 123457,
    "name": "New Scenario",
    "teamId": 5891096,
    ...
  }
}
```

## Update Scenario

```http
PATCH /scenarios/{scenarioId}
```

### Request Body

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "scheduling": {
    "type": "indefinitely",
    "interval": 30
  }
}
```

### Activating/Deactivating

To activate (turn on) a scenario:
```json
{
  "isPaused": false
}
```

To deactivate (pause) a scenario:
```json
{
  "isPaused": true
}
```

## Delete Scenario

```http
DELETE /scenarios/{scenarioId}
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirmed` | boolean | Yes | Must be `true` to confirm deletion |

## Clone Scenario

```http
POST /scenarios/{scenarioId}/clone
```

### Request Body

```json
{
  "name": "Cloned Scenario Name",
  "teamId": 5891096,
  "folderId": null
}
```

## Get Scenario Blueprint

```http
GET /scenarios/{scenarioId}/blueprint
```

Returns the current blueprint JSON for a scenario.

## Update Scenario Blueprint

```http
PATCH /scenarios/{scenarioId}/blueprint
```

### Request Body

```json
{
  "blueprint": "{\"flow\":[...],\"metadata\":{...}}",
  "baseVersion": 5
}
```

### Version Control

The `baseVersion` parameter enables optimistic locking:
- Get current version from `GET /scenarios/{id}`
- Include that version when updating
- If version mismatch, update fails (someone else modified it)

## Scenario Logs

```http
GET /scenarios/{scenarioId}/logs
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pg[limit]` | integer | Results per page |
| `pg[offset]` | integer | Pagination offset |
| `from` | datetime | Start date filter |
| `to` | datetime | End date filter |
| `status` | string | Filter by status (success/warning/error) |

## Move Scenario to Folder

```http
PATCH /scenarios/{scenarioId}
```

```json
{
  "folderId": 789
}
```

## Important Notes

1. **Blueprint is a string**: When creating/updating, the blueprint must be a JSON string, not an object
2. **Version conflicts**: Always use `baseVersion` when updating blueprints to avoid overwriting changes
3. **Activation requirements**: Scenarios need valid connections and complete configuration before activation
4. **Rate limits**: API calls are rate-limited per team/organization
