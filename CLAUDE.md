# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fork of the official Make.com MCP (Model Context Protocol) server. It exposes Make.com on-demand scenarios as callable tools for AI assistants. The goal of this fork is to extend capabilities beyond running scenarios to include full scenario lifecycle management (create, edit, delete).

## Commands

```bash
npm install      # Install dependencies (also runs build via prepare script)
npm run build    # Compile TypeScript to build/
npm run watch    # Watch mode for development
npm test         # Run all tests
npm run inspector # Launch MCP Inspector for debugging
```

Run a single test:
```bash
npx jest test/server.spec.ts -t "Should get list of scenarios"
```

## Architecture

### Core Flow

```
index.ts (MCP Server)
    ↓
make.ts (Make API Client)
    ↓
Make.com REST API (https://{zone}/api/v2/...)
```

### Source Files

- **`src/index.ts`** - MCP server entry point. Registers two handlers:
  - `ListToolsRequestSchema` - Lists on-demand scenarios as MCP tools
  - `CallToolRequestSchema` - Executes scenarios via `run_scenario_{id}` tool names

- **`src/make.ts`** - Make API client with `Scenarios` class for API calls:
  - `list(teamId)` - Get all scenarios for a team
  - `interface(scenarioId)` - Get input/output schema for a scenario
  - `run(scenarioId, body)` - Execute scenario in responsive mode

- **`src/utils.ts`** - Utilities:
  - `remap()` - Converts Make interface spec to JSON Schema for MCP tools
  - `MakeError` - Custom error class for API errors with suberror support

- **`src/types.ts`** - TypeScript types for Make API responses

### Key Patterns

**Tool naming**: Scenarios become tools named `run_scenario_{scenarioId}`. The regex `/^run_scenario_\d+$/` validates tool calls.

**Interface conversion**: Make's input spec uses types like `collection`, `array`, `select`, `text`, `number`, `boolean`, `date`, `json`. The `remap()` function converts these to JSON Schema for MCP compatibility.

**Responsive mode**: Scenarios are always run with `responsive: true`, which waits for completion and returns outputs synchronously.

## Environment Variables

Required:
- `MAKE_API_KEY` - API token from Make.com profile
- `MAKE_ZONE` - API zone (e.g., `us2.make.com`)
- `MAKE_TEAM` - Team ID (from URL)

## API Research

The `/research/api/` directory contains comprehensive Make.com API documentation for extending this server. Key files:
- `scenarios-api.md` - CRUD operations
- `blueprints-api.md` - Scenario structure and IML mapping
- `execution-api.md` - Running scenarios
- `scenario-interface-api.md` - Input/output definitions

## Testing

Tests use `jest-fetch-mock` to mock HTTP requests. Mock responses are in `test/mocks/`. Tests run against the `Make` class directly, not the full MCP server.
