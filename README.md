# Make MCP Server (Fork)

> Forked from [integromat/make-mcp-server](https://github.com/integromat/make-mcp-server) for extension and customization.

A Model Context Protocol server that enables Make scenarios to be utilized as tools by AI assistants. This integration allows AI systems to trigger and interact with your Make automation workflows.

## Current Capabilities

This fork extends the vanilla MCP server with full scenario lifecycle management:

### Scenario Execution (from vanilla)
- Connects to your Make account and identifies all scenarios configured with "On-Demand" scheduling
- Parses and resolves input parameters for each scenario, providing AI assistants with meaningful parameter descriptions
- Allows AI assistants to invoke scenarios with appropriate parameters via `run_scenario_{id}` tools
- Returns scenario output as structured JSON, enabling AI assistants to properly interpret the results

### Scenario Management (this fork)
- **List & View**: `list_scenarios`, `get_scenario` - List all scenarios with filtering, get full scenario details
- **Create & Clone**: `create_scenario`, `clone_scenario` - Create new scenarios or duplicate existing ones
- **Update & Delete**: `update_scenario`, `delete_scenario` - Modify or remove scenarios
- **Blueprint Management**: `get_blueprint`, `update_blueprint` - View and modify scenario module flow
- **Interface Configuration**: `set_interface` - Define input parameters for on-demand scenarios
- **Activation Control**: `activate_scenario`, `deactivate_scenario` - Control scenario scheduling
- **Execution Logs**: `get_logs` - View incomplete execution logs (DLQ)

### Remaining Limitations

The server does **not** yet support:
- Connection management (OAuth, credentials)
- Webhook creation and configuration
- Data store operations

## API Research

The `/research/api/` directory contains comprehensive documentation on the Make.com API, focused on programmatically creating, editing, and managing scenarios:

| Document | Description |
|----------|-------------|
| [README.md](./research/api/README.md) | Overview and workflow |
| [scenarios-api.md](./research/api/scenarios-api.md) | CRUD operations for scenarios |
| [blueprints-api.md](./research/api/blueprints-api.md) | Scenario structure and IML mapping |
| [execution-api.md](./research/api/execution-api.md) | Running and testing scenarios |
| [modules-apps-api.md](./research/api/modules-apps-api.md) | Available modules and apps |
| [connections-api.md](./research/api/connections-api.md) | OAuth and auth management |
| [webhooks-api.md](./research/api/webhooks-api.md) | Webhook creation and management |
| [data-stores-api.md](./research/api/data-stores-api.md) | Persistent key-value storage |
| [scenario-interface-api.md](./research/api/scenario-interface-api.md) | Input/output definitions |
| [teams-organizations-api.md](./research/api/teams-organizations-api.md) | Team and org management |
| [authentication.md](./research/api/authentication.md) | API tokens, scopes, rate limits |

## Usage with Claude Desktop

### Prerequisites

- NodeJS
- MCP Client (like Claude Desktop App)
- Make API Key with appropriate scopes (see below)

### Recommended Scopes

For full functionality when extending this server:
- `scenarios:read` - List and view scenarios
- `scenarios:write` - Create and modify scenarios
- `scenarios:run` - Execute scenarios
- `connections:read` - View connections
- `connections:write` - Create connections
- `hooks:read` / `hooks:write` - Webhook management
- `data-stores:read` / `data-stores:write` - Data store access
- `teams:read` - Team information

### Installation (Local Build)

1. Clone this repository
2. Install dependencies: `npm install`
3. Build: `npm run build`

Add to Claude Desktop config (`claude_desktop_config.json`):

```json
{
    "mcpServers": {
        "make": {
            "command": "node",
            "args": ["/path/to/make-mcp-server/build/index.js"],
            "env": {
                "MAKE_API_KEY": "<your-api-key>",
                "MAKE_ZONE": "<your-zone>",
                "MAKE_TEAM": "<your-team-id>"
            }
        }
    }
}
```

### Installation (NPX)

For the vanilla upstream version:

```json
{
    "mcpServers": {
        "make": {
            "command": "npx",
            "args": ["-y", "@makehq/mcp-server"],
            "env": {
                "MAKE_API_KEY": "<your-api-key>",
                "MAKE_ZONE": "<your-zone>",
                "MAKE_TEAM": "<your-team-id>"
            }
        }
    }
}
```

### Configuration

- `MAKE_API_KEY` - Generate in your Make profile under API Access
- `MAKE_ZONE` - Your organization's zone (e.g., `us2.make.com`, `eu1.make.com`)
- `MAKE_TEAM` - Found in the URL when viewing your Team page

## Available Tools

| Tool | Description |
|------|-------------|
| `run_scenario_{id}` | Execute an on-demand scenario (dynamic, one per scenario) |
| `list_scenarios` | List all scenarios with optional filtering by type/status |
| `get_scenario` | Get full scenario details including status and scheduling |
| `create_scenario` | Create a new scenario with optional blueprint and scheduling |
| `update_scenario` | Update scenario name, folder, blueprint, or scheduling |
| `delete_scenario` | Permanently delete a scenario |
| `clone_scenario` | Create a copy of an existing scenario |
| `get_blueprint` | Get scenario blueprint (module flow and configuration) |
| `update_blueprint` | Update scenario blueprint |
| `set_interface` | Define input parameters for on-demand scenarios |
| `get_logs` | Get incomplete execution logs (DLQ) |
| `activate_scenario` | Activate scenario for scheduled execution |
| `deactivate_scenario` | Deactivate scenario |

## Roadmap

Future extensions planned:
- [ ] Connection management
- [ ] Data store operations
- [ ] Webhook configuration

## License

See upstream repository for license information.
