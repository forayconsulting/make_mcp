# Modules & Apps API

The Modules API provides information about available apps and their modules (actions/triggers) that can be used in scenarios.

## List Available Apps

```http
GET /apps
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | integer | Team ID for team-specific apps |
| `pg[limit]` | integer | Results per page |
| `pg[offset]` | integer | Pagination offset |
| `name` | string | Filter by app name |

### Response

```json
{
  "apps": [
    {
      "name": "google-sheets",
      "label": "Google Sheets",
      "description": "Manage Google Sheets spreadsheets",
      "version": 2,
      "icon": "https://...",
      "categories": ["productivity", "google"]
    },
    {
      "name": "slack",
      "label": "Slack",
      "description": "Team messaging and collaboration",
      "version": 1,
      "icon": "https://...",
      "categories": ["communication"]
    }
  ]
}
```

## Get App Details

```http
GET /apps/{appName}
```

### Response

```json
{
  "app": {
    "name": "http",
    "label": "HTTP",
    "description": "Make HTTP requests",
    "version": 3,
    "modules": ["ActionSendData", "ActionGetFile"],
    "connections": ["basic", "oauth2"],
    "documentation": "https://..."
  }
}
```

## List App Modules

```http
GET /apps/{appName}/modules
```

### Response

```json
{
  "modules": [
    {
      "name": "postMessage",
      "label": "Send a Message",
      "description": "Post a message to a channel",
      "type": "action",
      "connection": "slack",
      "version": 2
    },
    {
      "name": "watchMessages",
      "label": "Watch Messages",
      "description": "Triggers when new messages arrive",
      "type": "trigger",
      "connection": "slack",
      "version": 1
    }
  ]
}
```

### Module Types

| Type | Description |
|------|-------------|
| `trigger` | Initiates scenario (webhook, polling) |
| `action` | Performs an operation |
| `search` | Retrieves data based on criteria |
| `aggregator` | Combines multiple items |
| `iterator` | Processes arrays item by item |
| `transformer` | Transforms/converts data |

## Get Module Specification

```http
GET /apps/{appName}/modules/{moduleName}
```

Returns full specification including input/output schema:

```json
{
  "module": {
    "name": "postMessage",
    "label": "Send a Message",
    "type": "action",
    "connection": "slack",
    "parameters": [
      {
        "name": "channel",
        "label": "Channel",
        "type": "select",
        "required": true,
        "options": "rpc://slack/channels"
      },
      {
        "name": "text",
        "label": "Message Text",
        "type": "text",
        "required": true,
        "multiline": true
      },
      {
        "name": "attachments",
        "label": "Attachments",
        "type": "array",
        "required": false,
        "spec": [
          {
            "name": "title",
            "type": "text"
          },
          {
            "name": "text",
            "type": "text"
          }
        ]
      }
    ],
    "output": [
      {
        "name": "ts",
        "label": "Timestamp",
        "type": "text"
      },
      {
        "name": "channel",
        "label": "Channel ID",
        "type": "text"
      }
    ]
  }
}
```

## Parameter Types

| Type | Description |
|------|-------------|
| `text` | Single line text |
| `textarea` | Multi-line text |
| `number` | Numeric value |
| `boolean` | True/false |
| `select` | Dropdown selection |
| `multiselect` | Multiple selection |
| `date` | Date picker |
| `time` | Time picker |
| `array` | Array of items |
| `collection` | Object/key-value pairs |
| `filename` | File selection |
| `buffer` | Binary data |
| `any` | Any type |

## Built-in Modules

Make provides several built-in modules that don't require app installation:

### Flow Control

| Module | Description |
|--------|-------------|
| `builtin:BasicRouter` | Split flow into branches |
| `builtin:BasicIterator` | Process array items |
| `builtin:BasicAggregator` | Combine items |
| `builtin:Sleep` | Pause execution |
| `builtin:SetVariable` | Set runtime variable |
| `builtin:GetVariable` | Get runtime variable |

### Triggers

| Module | Description |
|--------|-------------|
| `builtin:BasicScheduler` | Time-based trigger |
| `gateway:CustomWebHook` | Webhook trigger |

### Data

| Module | Description |
|--------|-------------|
| `json:ParseJSON` | Parse JSON string |
| `json:CreateJSON` | Create JSON string |
| `json:TransformToJSON` | Convert to JSON |
| `text:Parser` | Parse text/regex |
| `text:Composer` | Compose text |

### Error Handling

| Module | Description |
|--------|-------------|
| `builtin:ErrorHandler` | Catch errors |
| `builtin:Rollback` | Rollback and retry |
| `builtin:Commit` | Commit and continue |
| `builtin:Break` | Stop scenario |
| `builtin:Ignore` | Ignore error |

### HTTP

| Module | Description |
|--------|-------------|
| `http:ActionSendData` | Make HTTP request |
| `http:ActionGetFile` | Download file |
| `http:ActionOAuth2` | OAuth2 request |

## Module Versioning

Modules have versions - always specify the version in blueprints:

```json
{
  "id": 1,
  "module": "slack:postMessage",
  "version": 2,
  ...
}
```

## RPC Endpoints

Some module parameters use RPC for dynamic options:

```
rpc://slack/channels       - List Slack channels
rpc://google-sheets/files  - List Google Sheets
rpc://jira/projects        - List Jira projects
```

These resolve at runtime using the associated connection.

## Custom Apps

Enterprise users can create custom apps:

```http
POST /apps?teamId={teamId}
```

```json
{
  "name": "my-custom-app",
  "label": "My Custom App",
  "description": "Custom integration",
  "modules": [...],
  "connections": [...]
}
```

## Common Module Patterns

### HTTP Request

```json
{
  "id": 1,
  "module": "http:ActionSendData",
  "version": 3,
  "mapper": {
    "url": "https://api.example.com/data",
    "method": "POST",
    "headers": [
      {"key": "Authorization", "value": "Bearer {{1.token}}"},
      {"key": "Content-Type", "value": "application/json"}
    ],
    "body": "{{toJSON(1.payload)}}"
  }
}
```

### JSON Parse

```json
{
  "id": 2,
  "module": "json:ParseJSON",
  "version": 1,
  "mapper": {
    "json": "{{1.body}}"
  }
}
```

### Router with Filter

```json
{
  "id": 3,
  "module": "builtin:BasicRouter",
  "version": 1,
  "routes": [
    {
      "flow": [...],
      "filter": {
        "name": "Status 200",
        "conditions": [[
          {"a": "{{1.statusCode}}", "b": "200", "o": "number:equal"}
        ]]
      }
    }
  ]
}
```
