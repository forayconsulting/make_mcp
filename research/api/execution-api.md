# Execution API

The Execution API allows you to run scenarios and retrieve their outputs.

## Run Scenario

```http
POST /scenarios/{scenarioId}/run
```

### Request Body

```json
{
  "data": {
    "inputField1": "value1",
    "inputField2": "value2"
  },
  "responsive": true
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | object | Input data matching scenario interface |
| `responsive` | boolean | If `true`, waits for completion and returns output |

### Non-Responsive Mode (Default)

When `responsive: false` or omitted:

```json
{
  "executionId": "abc123def456"
}
```

The scenario runs asynchronously. Use the execution ID to check status.

### Responsive Mode

When `responsive: true`:

```json
{
  "executionId": "abc123def456",
  "outputs": {
    "outputField1": "result1",
    "outputField2": ["array", "of", "values"]
  },
  "stats": {
    "operations": 5,
    "dataTransfer": 1024
  }
}
```

The API waits for scenario completion (up to timeout) and returns outputs directly.

### Response Timeout

Responsive mode has a default timeout of 40 seconds. For longer-running scenarios, use non-responsive mode and poll for status.

## Check Execution Status

```http
GET /scenarios/{scenarioId}/executions/{executionId}
```

### Response

```json
{
  "execution": {
    "id": "abc123def456",
    "scenarioId": 123456,
    "status": "completed",
    "started": "2024-01-15T10:30:00.000Z",
    "finished": "2024-01-15T10:30:05.000Z",
    "operations": 5,
    "dataTransfer": 1024,
    "duration": 5000
  }
}
```

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Queued for execution |
| `running` | Currently executing |
| `completed` | Finished successfully |
| `stopped` | Manually stopped |
| `error` | Failed with error |
| `warning` | Completed with warnings |

## List Executions

```http
GET /scenarios/{scenarioId}/executions
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pg[limit]` | integer | Results per page |
| `pg[offset]` | integer | Pagination offset |
| `from` | datetime | Start date filter |
| `to` | datetime | End date filter |
| `status` | string | Filter by status |

### Response

```json
{
  "executions": [
    {
      "id": "abc123",
      "status": "completed",
      "started": "2024-01-15T10:30:00.000Z",
      "finished": "2024-01-15T10:30:05.000Z"
    }
  ],
  "pg": {
    "limit": 10,
    "offset": 0,
    "total": 100
  }
}
```

## Get Execution Details

```http
GET /scenarios/{scenarioId}/executions/{executionId}/details
```

Returns detailed information about each module's execution:

```json
{
  "execution": {
    "id": "abc123",
    "modules": [
      {
        "id": 1,
        "name": "HTTP Request",
        "status": "completed",
        "duration": 500,
        "input": {...},
        "output": {...}
      },
      {
        "id": 2,
        "name": "JSON Parse",
        "status": "completed",
        "duration": 10,
        "input": {...},
        "output": {...}
      }
    ]
  }
}
```

## Stop Execution

```http
POST /scenarios/{scenarioId}/executions/{executionId}/stop
```

Stops a running execution immediately.

## Retry Failed Execution

Some scenarios support retry from incomplete bundles:

```http
POST /scenarios/{scenarioId}/executions/{executionId}/retry
```

## On-Demand Scenarios

For on-demand scenarios (used with MCP), the workflow is:

1. **Create scenario** with scheduling type `ondemand`
2. **Configure interface** with inputs/outputs
3. **Activate scenario**
4. **Call via API** with `responsive: true`

### Example: Create and Run On-Demand Scenario

```javascript
// 1. Create scenario
const scenario = await fetch(`${baseUrl}/scenarios?teamId=${teamId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Token ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'On-Demand Processor',
    scheduling: { type: 'ondemand' },
    blueprint: blueprintJson
  })
});

// 2. Activate
await fetch(`${baseUrl}/scenarios/${scenario.id}`, {
  method: 'PATCH',
  headers: { 'Authorization': `Token ${apiKey}` },
  body: JSON.stringify({ isPaused: false })
});

// 3. Run with data
const result = await fetch(`${baseUrl}/scenarios/${scenario.id}/run`, {
  method: 'POST',
  headers: {
    'Authorization': `Token ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    responsive: true,
    data: {
      inputParam1: 'value1'
    }
  })
});
```

## Execution Limits

| Limit | Value |
|-------|-------|
| Max execution time | 40 minutes |
| Responsive mode timeout | 40 seconds |
| Max concurrent executions | Based on plan |
| Operations per execution | Based on plan |

## Error Handling

### Error Response

```json
{
  "error": {
    "message": "Scenario execution failed",
    "code": "EXECUTION_ERROR",
    "details": {
      "moduleId": 2,
      "moduleName": "HTTP Request",
      "error": "Connection refused"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `EXECUTION_ERROR` | Module failed during execution |
| `TIMEOUT` | Execution exceeded time limit |
| `INVALID_INPUT` | Input data doesn't match interface |
| `SCENARIO_INACTIVE` | Scenario is paused |
| `RATE_LIMITED` | Too many executions |

## Debugging Tips

1. **Use responsive mode** for testing - see results immediately
2. **Check execution details** for module-by-module breakdown
3. **Review input/output** at each step to find data issues
4. **Use scenario logs** for historical debugging
5. **Test with minimal data** first, then scale up
