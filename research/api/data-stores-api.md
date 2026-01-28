# Data Stores API

Data Stores provide persistent key-value storage for scenarios, enabling data persistence between executions.

## Base Endpoint

```
https://{zone}.make.com/api/v2/data-stores
```

## List Data Stores

```http
GET /data-stores?teamId={teamId}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | integer | Required - Team ID |
| `pg[limit]` | integer | Results per page |
| `pg[offset]` | integer | Pagination offset |

### Response

```json
{
  "dataStores": [
    {
      "id": 123456,
      "name": "My Data Store",
      "teamId": 5891096,
      "records": 150,
      "size": 25600,
      "maxSize": 10485760,
      "created": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pg": {
    "limit": 10,
    "offset": 0,
    "total": 3
  }
}
```

## Get Data Store Details

```http
GET /data-stores/{dataStoreId}
```

### Response

```json
{
  "dataStore": {
    "id": 123456,
    "name": "My Data Store",
    "teamId": 5891096,
    "records": 150,
    "size": 25600,
    "maxSize": 10485760,
    "spec": [
      {
        "name": "key",
        "type": "text",
        "label": "Key"
      },
      {
        "name": "value",
        "type": "text",
        "label": "Value"
      },
      {
        "name": "count",
        "type": "number",
        "label": "Count"
      }
    ]
  }
}
```

## Create Data Store

```http
POST /data-stores?teamId={teamId}
```

### Request Body

```json
{
  "name": "New Data Store",
  "spec": [
    {
      "name": "id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "data",
      "type": "collection",
      "label": "Data",
      "spec": [
        {
          "name": "field1",
          "type": "text"
        },
        {
          "name": "field2",
          "type": "number"
        }
      ]
    },
    {
      "name": "active",
      "type": "boolean",
      "label": "Is Active"
    }
  ],
  "maxSize": 10485760
}
```

### Field Types

| Type | Description |
|------|-------------|
| `text` | String value |
| `number` | Numeric value |
| `boolean` | True/false |
| `date` | Date value |
| `time` | Time value |
| `array` | Array of values |
| `collection` | Nested object |

## Update Data Store

```http
PATCH /data-stores/{dataStoreId}
```

### Request Body

```json
{
  "name": "Updated Name",
  "maxSize": 20971520
}
```

## Delete Data Store

```http
DELETE /data-stores/{dataStoreId}
```

**Warning**: Deletes all records in the data store.

---

## Data Store Records

### List Records

```http
GET /data-stores/{dataStoreId}/records
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pg[limit]` | integer | Results per page (max 100) |
| `pg[offset]` | integer | Pagination offset |
| `pg[sortBy]` | string | Field to sort by |
| `pg[sortDir]` | string | asc or desc |

### Response

```json
{
  "records": [
    {
      "key": "record-001",
      "data": {
        "id": "001",
        "name": "Item One",
        "count": 42
      }
    },
    {
      "key": "record-002",
      "data": {
        "id": "002",
        "name": "Item Two",
        "count": 17
      }
    }
  ],
  "pg": {
    "limit": 10,
    "offset": 0,
    "total": 150
  }
}
```

### Get Single Record

```http
GET /data-stores/{dataStoreId}/records/{key}
```

### Response

```json
{
  "record": {
    "key": "record-001",
    "data": {
      "id": "001",
      "name": "Item One",
      "count": 42
    }
  }
}
```

### Create Record

```http
POST /data-stores/{dataStoreId}/records
```

### Request Body

```json
{
  "key": "record-003",
  "data": {
    "id": "003",
    "name": "Item Three",
    "count": 99
  }
}
```

### Update Record

```http
PUT /data-stores/{dataStoreId}/records/{key}
```

### Request Body

```json
{
  "data": {
    "id": "001",
    "name": "Updated Item One",
    "count": 100
  }
}
```

### Delete Record

```http
DELETE /data-stores/{dataStoreId}/records/{key}
```

### Delete All Records

```http
DELETE /data-stores/{dataStoreId}/records
```

---

## Using Data Stores in Blueprints

### Add/Update Record

```json
{
  "id": 1,
  "module": "datastore:ActionAddUpdate",
  "version": 1,
  "parameters": {
    "datastore": 123456
  },
  "mapper": {
    "key": "{{1.id}}",
    "name": "{{1.name}}",
    "count": "{{1.count}}"
  }
}
```

### Get Record

```json
{
  "id": 2,
  "module": "datastore:ActionGet",
  "version": 1,
  "parameters": {
    "datastore": 123456
  },
  "mapper": {
    "key": "{{1.id}}"
  }
}
```

### Search Records

```json
{
  "id": 3,
  "module": "datastore:ActionSearch",
  "version": 1,
  "parameters": {
    "datastore": 123456
  },
  "mapper": {
    "filter": [
      {
        "a": "count",
        "b": "50",
        "o": "number:greater"
      }
    ],
    "limit": 100
  }
}
```

### Delete Record

```json
{
  "id": 4,
  "module": "datastore:ActionDelete",
  "version": 1,
  "parameters": {
    "datastore": 123456
  },
  "mapper": {
    "key": "{{1.id}}"
  }
}
```

### Check Record Existence

```json
{
  "id": 5,
  "module": "datastore:ActionExists",
  "version": 1,
  "parameters": {
    "datastore": 123456
  },
  "mapper": {
    "key": "{{1.id}}"
  }
}
```

---

## Data Store Limits

| Limit | Free | Pro | Teams | Enterprise |
|-------|------|-----|-------|------------|
| Max size per store | 1 MB | 10 MB | 100 MB | 1 GB |
| Max records | 1,000 | 10,000 | 100,000 | 1,000,000 |
| Max stores | 5 | 50 | 500 | Unlimited |

## Use Cases

### Caching

Store API responses to reduce external calls:

```json
{
  "key": "api-response-{{formatDate(now, 'YYYY-MM-DD')}}",
  "data": {
    "response": "{{1.body}}",
    "cached_at": "{{now}}"
  }
}
```

### State Management

Track processing state across executions:

```json
{
  "key": "last-processed",
  "data": {
    "timestamp": "{{now}}",
    "record_id": "{{1.id}}"
  }
}
```

### Lookup Tables

Store reference data for scenarios:

```json
{
  "key": "config-production",
  "data": {
    "api_url": "https://api.production.com",
    "timeout": 30,
    "retries": 3
  }
}
```

### Deduplication

Track processed items to avoid duplicates:

```json
{
  "key": "processed-{{1.id}}",
  "data": {
    "processed_at": "{{now}}",
    "status": "complete"
  }
}
```

## Best Practices

1. **Use meaningful keys** - Include identifiers and timestamps
2. **Clean up old data** - Implement TTL logic in scenarios
3. **Monitor size** - Set up alerts before hitting limits
4. **Structure data properly** - Use collections for complex data
5. **Consider indexing** - Design keys for efficient lookup
6. **Handle missing records** - Use existence checks before reads
