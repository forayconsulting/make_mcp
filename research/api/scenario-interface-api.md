# Scenario Interface API

The Scenario Interface defines input parameters and output mappings for on-demand scenarios, enabling them to be called like functions via the API.

## Overview

When a scenario is marked as "on-demand" (`scheduling.type: "ondemand"`), it can:
1. Accept input parameters when called
2. Return structured output data
3. Be executed synchronously (responsive mode)

## Get Scenario Interface

```http
GET /scenarios/{scenarioId}/interface
```

### Response

```json
{
  "interface": {
    "input": [
      {
        "name": "userId",
        "type": "text",
        "label": "User ID",
        "required": true
      },
      {
        "name": "options",
        "type": "collection",
        "label": "Options",
        "required": false,
        "spec": [
          {
            "name": "includeDetails",
            "type": "boolean",
            "label": "Include Details"
          }
        ]
      }
    ],
    "output": [
      {
        "name": "result",
        "type": "collection",
        "label": "Result",
        "spec": [
          {
            "name": "success",
            "type": "boolean"
          },
          {
            "name": "data",
            "type": "any"
          }
        ]
      }
    ]
  }
}
```

## Set Scenario Interface

```http
PUT /scenarios/{scenarioId}/interface
```

### Request Body

```json
{
  "input": [
    {
      "name": "email",
      "type": "text",
      "label": "Email Address",
      "required": true,
      "help": "The user's email address"
    },
    {
      "name": "action",
      "type": "select",
      "label": "Action",
      "required": true,
      "options": [
        {"label": "Create", "value": "create"},
        {"label": "Update", "value": "update"},
        {"label": "Delete", "value": "delete"}
      ]
    }
  ],
  "output": [
    {
      "name": "status",
      "type": "text",
      "label": "Status"
    },
    {
      "name": "recordId",
      "type": "text",
      "label": "Record ID"
    }
  ]
}
```

## Interface Field Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | String value | `"hello"` |
| `number` | Numeric value | `42` |
| `boolean` | True/false | `true` |
| `date` | Date string | `"2024-01-15"` |
| `time` | Time string | `"10:30:00"` |
| `select` | Single selection | `"option1"` |
| `multiselect` | Multiple selection | `["a", "b"]` |
| `array` | Array of items | `[1, 2, 3]` |
| `collection` | Nested object | `{"key": "value"}` |
| `any` | Any type | - |
| `buffer` | Binary data | Base64 string |

## Field Specification

### Basic Field

```json
{
  "name": "fieldName",
  "type": "text",
  "label": "Display Label",
  "required": true,
  "default": "default value",
  "help": "Help text for users"
}
```

### Select Field

```json
{
  "name": "priority",
  "type": "select",
  "label": "Priority",
  "required": true,
  "options": [
    {"label": "High", "value": "high"},
    {"label": "Medium", "value": "medium"},
    {"label": "Low", "value": "low"}
  ]
}
```

### Collection Field

```json
{
  "name": "address",
  "type": "collection",
  "label": "Address",
  "spec": [
    {
      "name": "street",
      "type": "text",
      "label": "Street"
    },
    {
      "name": "city",
      "type": "text",
      "label": "City"
    },
    {
      "name": "zip",
      "type": "text",
      "label": "ZIP Code"
    }
  ]
}
```

### Array Field

```json
{
  "name": "items",
  "type": "array",
  "label": "Items",
  "spec": [
    {
      "name": "itemName",
      "type": "text",
      "label": "Item Name"
    },
    {
      "name": "quantity",
      "type": "number",
      "label": "Quantity"
    }
  ]
}
```

## Using Interface in Blueprints

### Gateway Trigger with Interface

The first module receives input parameters:

```json
{
  "id": 1,
  "module": "gateway:CustomWebHook",
  "version": 1,
  "parameters": {
    "hook": null,
    "maxResults": 1
  },
  "metadata": {
    "designer": { "x": 0, "y": 0 }
  }
}
```

When executed, `{{1.email}}` and `{{1.action}}` are available from the interface.

### Setting Output

Use the Interface Response module to define outputs:

```json
{
  "id": 10,
  "module": "gateway:InterfaceResponse",
  "version": 1,
  "mapper": {
    "status": "{{9.status}}",
    "recordId": "{{5.id}}"
  }
}
```

## Running Scenarios with Interface

### API Call

```http
POST /scenarios/{scenarioId}/run
```

```json
{
  "responsive": true,
  "data": {
    "email": "user@example.com",
    "action": "create"
  }
}
```

### Response

```json
{
  "executionId": "abc123",
  "outputs": {
    "status": "success",
    "recordId": "rec_12345"
  }
}
```

## JSON Schema Mapping

Interface types map to JSON Schema:

| Interface Type | JSON Schema |
|---------------|-------------|
| `text` | `{"type": "string"}` |
| `number` | `{"type": "number"}` |
| `boolean` | `{"type": "boolean"}` |
| `array` | `{"type": "array", "items": {...}}` |
| `collection` | `{"type": "object", "properties": {...}}` |
| `select` | `{"type": "string", "enum": [...]}` |

## MCP Integration

The official Make MCP server converts scenario interfaces to MCP tools:

```javascript
// Interface input becomes tool input schema
{
  "name": "run_scenario_123",
  "description": "My Scenario",
  "inputSchema": {
    "type": "object",
    "properties": {
      "email": { "type": "string" },
      "action": { "type": "string", "enum": ["create", "update", "delete"] }
    },
    "required": ["email", "action"]
  }
}
```

## Validation

Make validates input against the interface:

### Validation Errors

```json
{
  "error": {
    "message": "Invalid input",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Required field is missing"
      },
      {
        "field": "action",
        "message": "Value must be one of: create, update, delete"
      }
    ]
  }
}
```

## Dynamic Interface

You can modify the interface programmatically:

```javascript
// Get current interface
const response = await fetch(`/scenarios/${id}/interface`);
const { interface } = await response.json();

// Add new field
interface.input.push({
  name: "newField",
  type: "text",
  label: "New Field",
  required: false
});

// Update interface
await fetch(`/scenarios/${id}/interface`, {
  method: 'PUT',
  body: JSON.stringify(interface)
});
```

## Best Practices

1. **Use clear names** - Field names should be descriptive
2. **Provide help text** - Add context for complex fields
3. **Set defaults** - Provide sensible defaults where possible
4. **Mark required fields** - Explicitly mark which fields are required
5. **Use appropriate types** - Choose the most specific type
6. **Document outputs** - Clearly define what the scenario returns
7. **Validate early** - Interface validation catches errors before execution

## Example: Complete On-Demand Scenario

```json
{
  "name": "Process Order",
  "scheduling": { "type": "ondemand" },
  "interface": {
    "input": [
      {
        "name": "orderId",
        "type": "text",
        "label": "Order ID",
        "required": true
      },
      {
        "name": "action",
        "type": "select",
        "label": "Action",
        "required": true,
        "options": [
          {"label": "Ship", "value": "ship"},
          {"label": "Cancel", "value": "cancel"}
        ]
      }
    ],
    "output": [
      {
        "name": "success",
        "type": "boolean",
        "label": "Success"
      },
      {
        "name": "message",
        "type": "text",
        "label": "Message"
      }
    ]
  }
}
```
