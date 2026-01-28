# Blueprints API

Blueprints define the logic, flow, and configuration of a scenario. They are JSON structures that specify what modules to use, how data flows between them, and how to handle errors.

## Blueprint Structure

A blueprint is a JSON object with two main sections:

```json
{
  "flow": [...],
  "metadata": {...}
}
```

### Flow Section

The `flow` array contains module configurations in execution order:

```json
{
  "flow": [
    {
      "id": 1,
      "module": "google-sheets:getSheetValues",
      "version": 2,
      "parameters": {
        "spreadsheetId": "1abc...",
        "sheetId": "Sheet1"
      },
      "mapper": {
        "range": "A1:Z100"
      },
      "metadata": {
        "designer": {
          "x": 0,
          "y": 0
        },
        "restore": {}
      }
    },
    {
      "id": 2,
      "module": "slack:postMessage",
      "version": 1,
      "parameters": {},
      "mapper": {
        "channel": "C0123456",
        "text": "{{1.values}}"
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        }
      }
    }
  ]
}
```

### Module Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | integer | Unique module ID within scenario |
| `module` | string | Module identifier (app:action) |
| `version` | integer | Module version |
| `parameters` | object | Static configuration (connection IDs, etc.) |
| `mapper` | object | Dynamic data mappings |
| `metadata` | object | Designer position, UI state |
| `filter` | object | Optional filter conditions |
| `routes` | array | For routers, defines branches |

### Metadata Section

```json
{
  "metadata": {
    "version": 1,
    "scenario": {
      "roundtrips": 1,
      "maxErrors": 3,
      "autoCommit": true,
      "autoCommitTriggerLast": true,
      "sequential": false,
      "confidential": false,
      "dataloss": false,
      "dlq": false
    },
    "designer": {
      "orphans": []
    },
    "zone": "us2.make.com"
  }
}
```

## Module Types

### Trigger Modules

First module in flow, initiates execution:

```json
{
  "id": 1,
  "module": "gateway:CustomWebHook",
  "version": 1,
  "parameters": {
    "hook": 123456
  },
  "mapper": {},
  "metadata": {
    "designer": { "x": 0, "y": 0 }
  }
}
```

Common triggers:
- `gateway:CustomWebHook` - Webhook trigger
- `builtin:BasicScheduler` - Time-based trigger
- `google-sheets:watchRows` - Watch for new rows
- `slack:watchMessages` - Watch for messages

### Action Modules

Perform operations on data:

```json
{
  "id": 2,
  "module": "http:ActionSendData",
  "version": 3,
  "parameters": {},
  "mapper": {
    "url": "https://api.example.com/data",
    "method": "POST",
    "headers": [
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": "{{toJSON(1.data)}}"
  }
}
```

### Router Module

Splits flow into multiple branches:

```json
{
  "id": 3,
  "module": "builtin:BasicRouter",
  "version": 1,
  "parameters": {},
  "mapper": null,
  "routes": [
    {
      "flow": [
        { "id": 4, "module": "..." }
      ],
      "filter": {
        "name": "Success Path",
        "conditions": [[
          {
            "a": "{{1.status}}",
            "b": "200",
            "o": "number:equal"
          }
        ]]
      }
    },
    {
      "flow": [
        { "id": 5, "module": "..." }
      ],
      "filter": {
        "name": "Error Path",
        "conditions": [[
          {
            "a": "{{1.status}}",
            "b": "200",
            "o": "number:notequal"
          }
        ]]
      }
    }
  ]
}
```

### Iterator Module

Processes arrays item by item:

```json
{
  "id": 6,
  "module": "builtin:BasicIterator",
  "version": 1,
  "parameters": {},
  "mapper": {
    "array": "{{1.items}}"
  }
}
```

### Aggregator Module

Combines multiple items back together:

```json
{
  "id": 7,
  "module": "builtin:BasicAggregator",
  "version": 1,
  "parameters": {
    "fepiModule": 6
  },
  "mapper": {
    "value": "{{6.value}}"
  }
}
```

## Data Mapping with IML

Make uses IML (Integromat Markup Language) for data mapping:

### Basic References

```
{{1.field}}          - Reference field from module 1
{{1.nested.field}}   - Nested field access
{{1.array[0]}}       - Array index access
```

### Common IML Functions

```
{{lower(1.text)}}                    - Lowercase
{{upper(1.text)}}                    - Uppercase
{{length(1.array)}}                  - Array length
{{join(1.array, ", ")}}              - Join array
{{split(1.text, ",")}}               - Split string
{{toJSON(1.object)}}                 - Convert to JSON string
{{parseJSON(1.jsonString)}}          - Parse JSON string
{{formatDate(1.date, "YYYY-MM-DD")}} - Format date
{{now}}                              - Current timestamp
{{if(1.condition, "yes", "no")}}     - Conditional
{{emptystring}}                      - Empty string constant
```

### Filter Conditions

```json
{
  "filter": {
    "name": "Filter Name",
    "conditions": [[
      {
        "a": "{{1.status}}",
        "b": "active",
        "o": "text:equal"
      }
    ]]
  }
}
```

Operators:
- `text:equal`, `text:notequal`, `text:contain`
- `number:equal`, `number:greater`, `number:less`
- `boolean:true`, `boolean:false`
- `array:contain`, `array:notcontain`
- `exist`, `notexist`

## Error Handling

### Error Handler Module

```json
{
  "id": 8,
  "module": "builtin:ErrorHandler",
  "version": 1,
  "parameters": {
    "errorModule": 2
  },
  "mapper": {},
  "routes": [
    {
      "flow": [
        {
          "id": 9,
          "module": "builtin:Rollback",
          "version": 1
        }
      ],
      "filter": {
        "conditions": [[
          {
            "a": "{{error.type}}",
            "b": "DataError",
            "o": "text:equal"
          }
        ]]
      }
    }
  ]
}
```

Error handling directives:
- `builtin:Rollback` - Rollback and retry
- `builtin:Commit` - Commit and continue
- `builtin:Ignore` - Ignore error
- `builtin:Break` - Stop execution

## Blueprint Versioning

Each blueprint change creates a new version:

```http
GET /scenarios/{id}
```

Response includes:
```json
{
  "scenario": {
    "id": 123,
    "version": 5,
    ...
  }
}
```

When updating:
```http
PATCH /scenarios/{id}/blueprint
```

```json
{
  "blueprint": "{...}",
  "baseVersion": 5
}
```

## Best Practices

1. **Unique Module IDs**: Each module needs a unique `id` within the scenario
2. **Connection References**: Store connection IDs in `parameters`, not `mapper`
3. **Designer Metadata**: Include `x`, `y` coordinates for visual layout
4. **Version Control**: Always track `baseVersion` when editing
5. **Validate JSON**: Blueprint must be valid JSON string when saving
6. **Test Incrementally**: Build and test modules one at a time
