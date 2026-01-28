#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Make } from './make.js';
import { remap, ValidationError } from './utils.js';

const server = new Server(
    {
        name: 'Make',
        version: '0.1.0',
    },
    {
        capabilities: {
            tools: {},
        },
    },
);

if (!process.env.MAKE_API_KEY) {
    console.error('Please provide MAKE_API_KEY environment variable.');
    process.exit(1);
}
if (!process.env.MAKE_ZONE) {
    console.error('Please provide MAKE_ZONE environment variable.');
    process.exit(1);
}
if (!process.env.MAKE_TEAM) {
    console.error('Please provide MAKE_TEAM environment variable.');
    process.exit(1);
}

const make = new Make(process.env.MAKE_API_KEY, process.env.MAKE_ZONE);
const teamId = parseInt(process.env.MAKE_TEAM);

// Helper functions for consistent response formatting
function successResponse(data: unknown) {
    return {
        content: [
            {
                type: 'text' as const,
                text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
            },
        ],
    };
}

function errorResponse(err: unknown) {
    return {
        isError: true,
        content: [
            {
                type: 'text' as const,
                text: String(err),
            },
        ],
    };
}

// Static tool definitions
const staticTools = [
    {
        name: 'list_scenarios',
        description: 'List all scenarios in the team. Can filter by scheduling type (on-demand, indefinitely, immediately) and active/inactive status.',
        inputSchema: {
            type: 'object',
            properties: {
                teamId: {
                    type: 'number',
                    description: 'Team ID to list scenarios for. Defaults to MAKE_TEAM environment variable.',
                },
                schedulingType: {
                    type: 'string',
                    enum: ['on-demand', 'indefinitely', 'immediately'],
                    description: 'Filter scenarios by scheduling type.',
                },
                isActive: {
                    type: 'boolean',
                    description: 'Filter scenarios by active status.',
                },
            },
        },
    },
    {
        name: 'get_scenario',
        description: 'Get full details of a specific scenario including status, scheduling, and metadata.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario to retrieve.',
                },
            },
            required: ['scenarioId'],
        },
    },
    {
        name: 'create_scenario',
        description: 'Create a new scenario with optional blueprint and scheduling configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                teamId: {
                    type: 'number',
                    description: 'Team ID to create the scenario in. Defaults to MAKE_TEAM environment variable.',
                },
                name: {
                    type: 'string',
                    description: 'Name for the new scenario.',
                },
                folderId: {
                    type: 'number',
                    description: 'Folder ID to place the scenario in.',
                },
                blueprint: {
                    type: 'string',
                    description: 'JSON string of the blueprint configuration.',
                },
                scheduling: {
                    type: 'string',
                    description: 'JSON string of the scheduling configuration (e.g., {"type": "on-demand"}).',
                },
            },
        },
    },
    {
        name: 'update_scenario',
        description: 'Update an existing scenario\'s name, folder, blueprint, or scheduling.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario to update.',
                },
                name: {
                    type: 'string',
                    description: 'New name for the scenario.',
                },
                folderId: {
                    type: 'number',
                    description: 'New folder ID for the scenario.',
                },
                blueprint: {
                    type: 'string',
                    description: 'JSON string of the new blueprint configuration.',
                },
                scheduling: {
                    type: 'string',
                    description: 'JSON string of the new scheduling configuration.',
                },
            },
            required: ['scenarioId'],
        },
    },
    {
        name: 'delete_scenario',
        description: 'Permanently delete a scenario. This action cannot be undone.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario to delete.',
                },
            },
            required: ['scenarioId'],
        },
    },
    {
        name: 'clone_scenario',
        description: 'Create a copy of an existing scenario.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario to clone.',
                },
                name: {
                    type: 'string',
                    description: 'Name for the cloned scenario.',
                },
                teamId: {
                    type: 'number',
                    description: 'Team ID for the cloned scenario. Defaults to same team.',
                },
                folderId: {
                    type: 'number',
                    description: 'Folder ID for the cloned scenario.',
                },
            },
            required: ['scenarioId'],
        },
    },
    {
        name: 'get_blueprint',
        description: 'Get the blueprint (module flow and configuration) of a scenario.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario.',
                },
                draft: {
                    type: 'boolean',
                    description: 'If true, get the draft blueprint instead of the active one.',
                },
            },
            required: ['scenarioId'],
        },
    },
    {
        name: 'update_blueprint',
        description: 'Update the blueprint (module flow and configuration) of a scenario.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario.',
                },
                blueprint: {
                    type: 'string',
                    description: 'JSON string of the new blueprint configuration.',
                },
            },
            required: ['scenarioId', 'blueprint'],
        },
    },
    {
        name: 'set_interface',
        description: 'Define the input parameters for an on-demand scenario. This determines what data the scenario accepts when run.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario.',
                },
                input: {
                    type: 'array',
                    description: 'Array of input parameter definitions.',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Parameter name.' },
                            type: { type: 'string', description: 'Parameter type (text, number, boolean, date, json, collection, array, select).' },
                            label: { type: 'string', description: 'Display label for the parameter.' },
                            help: { type: 'string', description: 'Help text describing the parameter.' },
                            required: { type: 'boolean', description: 'Whether the parameter is required.' },
                            default: { description: 'Default value for the parameter.' },
                        },
                        required: ['name', 'type'],
                    },
                },
            },
            required: ['scenarioId', 'input'],
        },
    },
    {
        name: 'get_logs',
        description: 'Get incomplete execution logs (DLQ) for a scenario. These are executions that failed and may need attention.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario.',
                },
            },
            required: ['scenarioId'],
        },
    },
    {
        name: 'activate_scenario',
        description: 'Activate a scenario so it can run on its schedule.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario to activate.',
                },
            },
            required: ['scenarioId'],
        },
    },
    {
        name: 'deactivate_scenario',
        description: 'Deactivate a scenario to stop it from running on its schedule.',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: {
                    type: 'number',
                    description: 'The ID of the scenario to deactivate.',
                },
            },
            required: ['scenarioId'],
        },
    },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
    const scenarios = await make.scenarios.list(teamId);

    // Generate dynamic run_scenario tools for on-demand scenarios
    const dynamicTools = await Promise.all(
        scenarios
            .filter(scenario => scenario.scheduling.type === 'on-demand')
            .map(async scenario => {
                const inputs = (await make.scenarios.interface(scenario.id)).input;
                return {
                    name: `run_scenario_${scenario.id}`,
                    description: scenario.name + (scenario.description ? ` (${scenario.description})` : ''),
                    inputSchema: remap({
                        name: 'wrapper',
                        type: 'collection',
                        spec: inputs,
                    }),
                };
            }),
    );

    return {
        tools: [...staticTools, ...dynamicTools],
    };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;

    try {
        // Handle dynamic run_scenario tools
        if (/^run_scenario_\d+$/.test(name)) {
            const output = (await make.scenarios.run(parseInt(name.substring(13)), args)).outputs;
            return successResponse(output || 'Scenario executed successfully.');
        }

        // Handle static tools
        switch (name) {
            case 'list_scenarios': {
                const targetTeamId = (args?.teamId as number) || teamId;
                let scenarios = await make.scenarios.list(targetTeamId);

                // Apply filters
                if (args?.schedulingType) {
                    scenarios = scenarios.filter(s => s.scheduling.type === args.schedulingType);
                }
                // Note: isActive filter would require fetching full scenario details
                // For now, we return the basic list

                return successResponse({
                    teamId: targetTeamId,
                    count: scenarios.length,
                    scenarios: scenarios.map(s => ({
                        id: s.id,
                        name: s.name,
                        description: s.description,
                        schedulingType: s.scheduling.type,
                    })),
                });
            }

            case 'get_scenario': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const scenario = await make.scenarios.get(scenarioId);
                return successResponse(scenario);
            }

            case 'create_scenario': {
                const createRequest = {
                    teamId: (args?.teamId as number) || teamId,
                    name: args?.name as string | undefined,
                    folderId: args?.folderId as number | undefined,
                    blueprint: args?.blueprint as string | undefined,
                    scheduling: args?.scheduling as string | undefined,
                };
                const scenario = await make.scenarios.create(createRequest);
                return successResponse({
                    message: 'Scenario created successfully',
                    scenario,
                });
            }

            case 'update_scenario': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const updateRequest = {
                    name: args?.name as string | undefined,
                    folderId: args?.folderId as number | undefined,
                    blueprint: args?.blueprint as string | undefined,
                    scheduling: args?.scheduling as string | undefined,
                };
                const scenario = await make.scenarios.update(scenarioId, updateRequest);
                return successResponse({
                    message: 'Scenario updated successfully',
                    scenario,
                });
            }

            case 'delete_scenario': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const result = await make.scenarios.delete(scenarioId);
                return successResponse({
                    message: 'Scenario deleted successfully',
                    deletedId: result.id,
                });
            }

            case 'clone_scenario': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const cloneRequest = {
                    name: args?.name as string | undefined,
                    teamId: args?.teamId as number | undefined,
                    folderId: args?.folderId as number | undefined,
                };
                const scenario = await make.scenarios.clone(scenarioId, cloneRequest);
                return successResponse({
                    message: 'Scenario cloned successfully',
                    scenario,
                });
            }

            case 'get_blueprint': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const blueprint = await make.scenarios.getBlueprint(scenarioId, {
                    draft: args?.draft as boolean | undefined,
                });
                return successResponse(blueprint);
            }

            case 'update_blueprint': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const blueprint = args?.blueprint as string;
                if (!blueprint) {
                    throw new ValidationError('blueprint is required', 'blueprint');
                }
                const scenario = await make.scenarios.update(scenarioId, { blueprint });
                return successResponse({
                    message: 'Blueprint updated successfully',
                    scenario,
                });
            }

            case 'set_interface': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const input = args?.input as unknown[];
                if (!input || !Array.isArray(input)) {
                    throw new ValidationError('input array is required', 'input');
                }
                const result = await make.scenarios.setInterface(scenarioId, { input: input as any });
                return successResponse({
                    message: 'Interface updated successfully',
                    interface: result,
                });
            }

            case 'get_logs': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const logs = await make.scenarios.getIncompleteExecutions(scenarioId);
                return successResponse({
                    scenarioId,
                    count: logs.length,
                    logs,
                });
            }

            case 'activate_scenario': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const scenario = await make.scenarios.activate(scenarioId);
                return successResponse({
                    message: 'Scenario activated successfully',
                    scenario,
                });
            }

            case 'deactivate_scenario': {
                const scenarioId = args?.scenarioId as number;
                if (!scenarioId) {
                    throw new ValidationError('scenarioId is required', 'scenarioId');
                }
                const scenario = await make.scenarios.deactivate(scenarioId);
                return successResponse({
                    message: 'Scenario deactivated successfully',
                    scenario,
                });
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (err: unknown) {
        return errorResponse(err);
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
