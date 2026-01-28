# Make.com API Research

This directory contains comprehensive research on the Make.com API with a focus on programmatically creating, editing, testing, and managing scenarios.

## API Base URL

```
https://{zone}.make.com/api/v2/
```

Where `{zone}` is one of: `us1`, `us2`, `eu1`, `eu2`

## Documentation Index

| File | Description |
|------|-------------|
| [scenarios-api.md](./scenarios-api.md) | CRUD operations for scenarios |
| [blueprints-api.md](./blueprints-api.md) | Scenario structure and logic definition |
| [execution-api.md](./execution-api.md) | Running and testing scenarios |
| [modules-apps-api.md](./modules-apps-api.md) | Available modules and app configurations |
| [connections-api.md](./connections-api.md) | OAuth and authentication management |
| [webhooks-api.md](./webhooks-api.md) | Webhook creation and management |
| [data-stores-api.md](./data-stores-api.md) | Persistent data storage |
| [scenario-interface-api.md](./scenario-interface-api.md) | Input/output definitions for scenarios |
| [teams-organizations-api.md](./teams-organizations-api.md) | Team and organization management |
| [authentication.md](./authentication.md) | API authentication methods |

## Key Concepts

### Scenarios
A scenario is an automated workflow consisting of modules connected together. Each scenario has:
- **Blueprint**: JSON definition of the scenario's logic and flow
- **Interface**: Input parameters and output mappings
- **Scheduling**: When/how the scenario runs (scheduled, webhook, on-demand)

### On-Demand vs Scheduled Scenarios
- **On-Demand**: Callable via API, used for synchronous integrations
- **Scheduled**: Run automatically at intervals
- **Webhook-triggered**: Run when external events occur

### Blueprints
The blueprint is the JSON structure that defines what a scenario does:
- Module configurations
- Data mappings between modules
- Flow control (routers, filters, iterators)
- Error handling

## Typical Workflow for Creating Scenarios via API

1. **Create scenario** (`POST /scenarios`) - Creates empty scenario
2. **Set blueprint** (`PATCH /scenarios/{id}/blueprint`) - Define the logic
3. **Configure interface** - Set up inputs/outputs for on-demand scenarios
4. **Create connections** - Set up authentication for apps used
5. **Activate scenario** (`PATCH /scenarios/{id}`) - Enable for execution
6. **Test/Run** (`POST /scenarios/{id}/run`) - Execute the scenario

## API Scopes Required

For full scenario management, these scopes are needed:
- `scenarios:read` - List and view scenarios
- `scenarios:write` - Create and modify scenarios
- `scenarios:run` - Execute scenarios
- `connections:read` - View connections
- `connections:write` - Create connections
- `teams:read` - Access team information
