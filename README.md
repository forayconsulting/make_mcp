# Make MCP Server (Fork)

> Forked from [integromat/make-mcp-server](https://github.com/integromat/make-mcp-server) for extension and customization.

A Model Context Protocol server that enables Make scenarios to be utilized as tools by AI assistants. This integration allows AI systems to trigger and interact with your Make automation workflows.

## Current Capabilities

The vanilla MCP server:

- Connects to your Make account and identifies all scenarios configured with "On-Demand" scheduling
- Parses and resolves input parameters for each scenario, providing AI assistants with meaningful parameter descriptions
- Allows AI assistants to invoke scenarios with appropriate parameters
- Returns scenario output as structured JSON, enabling AI assistants to properly interpret the results

### Limitations (Vanilla)

The base server **cannot**:
- Create, edit, or delete scenarios
- Manage connections or webhooks
- Access data stores
- View or modify blueprints
- Handle scheduled scenarios (only on-demand)

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

## Roadmap

This fork aims to extend the MCP server with:
- [ ] Scenario creation via API
- [ ] Blueprint editing and management
- [ ] Connection management
- [ ] Data store operations
- [ ] Webhook configuration

## License

See upstream repository for license information.
