import { describe, expect, it, beforeEach } from '@jest/globals';
import { enableFetchMocks } from 'jest-fetch-mock';
import { Make } from '../src/make.js';
enableFetchMocks();
beforeEach(() => fetchMock.resetMocks());

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const MAKE_TEAM = 1;

import * as scenariosMock from './mocks/scenarios.json';
import * as interfaceMock from './mocks/interface.json';
import * as runMock from './mocks/run.json';
import * as runErrorMock from './mocks/run-error.json';
import * as scenarioDetailMock from './mocks/scenario-detail.json';
import * as blueprintMock from './mocks/blueprint.json';
import * as createScenarioMock from './mocks/create-scenario.json';
import * as cloneScenarioMock from './mocks/clone-scenario.json';
import * as incompleteExecutionsMock from './mocks/incomplete-executions.json';
import * as deleteScenarioMock from './mocks/delete-scenario.json';
import * as setInterfaceMock from './mocks/set-interface.json';
import { MakeError, remap, ValidationError } from '../src/utils.js';

describe('Make SDK', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should get list of scenarios', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios?teamId=1&pg[limit]=1000')
                throw new Error(`Unmocked HTTP request: ${req.url}`);

            return Promise.resolve({
                body: JSON.stringify(scenariosMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        expect(await make.scenarios.list(MAKE_TEAM)).toStrictEqual(scenariosMock.scenarios);
    });

    it('Should get scenario interface', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/1/interface')
                throw new Error(`Unmocked HTTP request: ${req.url}`);

            return Promise.resolve({
                body: JSON.stringify(interfaceMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        expect(await make.scenarios.interface(1)).toStrictEqual(interfaceMock.interface);
    });

    it('Should run scenario', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/1/run')
                throw new Error(`Unmocked HTTP request: ${req.url}`);

            return Promise.resolve({
                body: JSON.stringify(runMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        expect(await make.scenarios.run(1, {})).toStrictEqual(runMock);
    });

    it('Should handle error in scenario run', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/1/run')
                throw new Error(`Unmocked HTTP request: ${req.url}`);

            return Promise.resolve({
                body: JSON.stringify(runErrorMock),
                status: 400,
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        try {
            await make.scenarios.run(1, {});
            throw new Error('Should throw an error.');
        } catch (err: unknown) {
            if (!(err instanceof MakeError)) throw new Error('Should throw MakeError.');

            expect(err.name).toBe('MakeError');
            expect(err.message).toBe('Validation failed for 1 parameter(s).');
            expect(err.subErrors).toEqual(["Missing value of required parameter 'number'."]);
            expect(String(err)).toEqual(
                "MakeError: Validation failed for 1 parameter(s).\n - Missing value of required parameter 'number'.",
            );
        }
    });

    it('Should remap inputs to JSON schema', async () => {
        expect(
            remap({
                name: 'wrapper',
                type: 'collection',
                spec: interfaceMock.interface.input,
            }),
        ).toEqual({
            properties: {
                array_of_arrays: {
                    description: 'description',
                    items: {
                        items: {
                            type: 'string',
                        },
                        type: 'array',
                    },
                    type: 'array',
                },
                array_of_collections: {
                    description: 'description',
                    properties: {
                        number: {
                            type: 'number',
                        },
                    },
                    required: [],
                    type: 'object',
                },
                boolean: {
                    type: 'boolean',
                },
                collection: {
                    description: 'description',
                    properties: {
                        text: {
                            type: 'string',
                        },
                    },
                    required: [],
                    type: 'object',
                },
                date: {
                    description: 'description',
                    type: 'string',
                },
                json: {
                    description: 'description',
                    type: 'string',
                },
                number: {
                    default: 15,
                    description: 'required + default',
                    type: 'number',
                },
                text: {
                    type: 'string',
                },
                primitive_array: {
                    description: 'description',
                    items: {
                        type: 'string',
                    },
                    type: 'array',
                },
                select: {
                    enum: ['option 1', 'option 2'],
                    type: 'string',
                },
            },
            required: ['number'],
            type: 'object',
        });
    });

    // New tests for scenario CRUD operations

    it('Should get scenario details', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652')
                throw new Error(`Unmocked HTTP request: ${req.url}`);

            return Promise.resolve({
                body: JSON.stringify(scenarioDetailMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.get(11652);
        expect(result).toStrictEqual(scenarioDetailMock.scenario);
        expect(result.id).toBe(11652);
        expect(result.name).toBe('Tool: Add to Inventory');
        expect(result.isActive).toBe(true);
    });

    it('Should create a new scenario', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios')
                throw new Error(`Unmocked HTTP request: ${req.url}`);
            if (req.method !== 'POST')
                throw new Error(`Expected POST, got ${req.method}`);

            return Promise.resolve({
                body: JSON.stringify(createScenarioMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.create({
            teamId: MAKE_TEAM,
            name: 'New Scenario',
            scheduling: JSON.stringify({ type: 'on-demand' }),
        });
        expect(result).toStrictEqual(createScenarioMock.scenario);
        expect(result.id).toBe(99999);
        expect(result.name).toBe('New Scenario');
    });

    it('Should update a scenario', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652')
                throw new Error(`Unmocked HTTP request: ${req.url}`);
            if (req.method !== 'PATCH')
                throw new Error(`Expected PATCH, got ${req.method}`);

            return Promise.resolve({
                body: JSON.stringify(scenarioDetailMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.update(11652, {
            name: 'Updated Name',
        });
        expect(result).toStrictEqual(scenarioDetailMock.scenario);
    });

    it('Should delete a scenario', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652?confirmed=true')
                throw new Error(`Unmocked HTTP request: ${req.url}`);
            if (req.method !== 'DELETE')
                throw new Error(`Expected DELETE, got ${req.method}`);

            return Promise.resolve({
                body: JSON.stringify(deleteScenarioMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.delete(11652);
        expect(result).toStrictEqual(deleteScenarioMock.scenario);
        expect(result.id).toBe(11652);
    });

    it('Should clone a scenario', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652/clone')
                throw new Error(`Unmocked HTTP request: ${req.url}`);
            if (req.method !== 'POST')
                throw new Error(`Expected POST, got ${req.method}`);

            return Promise.resolve({
                body: JSON.stringify(cloneScenarioMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.clone(11652, {
            name: 'Tool: Add to Inventory (Copy)',
        });
        expect(result).toStrictEqual(cloneScenarioMock.scenario);
        expect(result.id).toBe(88888);
        expect(result.name).toBe('Tool: Add to Inventory (Copy)');
    });

    // Activation/Deactivation tests

    it('Should activate a scenario', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652/start')
                throw new Error(`Unmocked HTTP request: ${req.url}`);
            if (req.method !== 'POST')
                throw new Error(`Expected POST, got ${req.method}`);

            return Promise.resolve({
                body: JSON.stringify(scenarioDetailMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.activate(11652);
        expect(result).toStrictEqual(scenarioDetailMock.scenario);
    });

    it('Should deactivate a scenario', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652/stop')
                throw new Error(`Unmocked HTTP request: ${req.url}`);
            if (req.method !== 'POST')
                throw new Error(`Expected POST, got ${req.method}`);

            return Promise.resolve({
                body: JSON.stringify(scenarioDetailMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.deactivate(11652);
        expect(result).toStrictEqual(scenarioDetailMock.scenario);
    });

    // Blueprint tests

    it('Should get scenario blueprint', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652/blueprint')
                throw new Error(`Unmocked HTTP request: ${req.url}`);

            return Promise.resolve({
                body: JSON.stringify(blueprintMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.getBlueprint(11652);
        expect(result).toStrictEqual(blueprintMock.blueprint);
        expect(result.name).toBe('Tool: Add to Inventory');
        expect(result.flow.length).toBe(3);
    });

    it('Should get draft blueprint with bp parameter', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652/blueprint?bp=1')
                throw new Error(`Unmocked HTTP request: ${req.url}`);

            return Promise.resolve({
                body: JSON.stringify(blueprintMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.getBlueprint(11652, { draft: true });
        expect(result).toStrictEqual(blueprintMock.blueprint);
    });

    // Interface tests

    it('Should set scenario interface', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/scenarios/11652/interface')
                throw new Error(`Unmocked HTTP request: ${req.url}`);
            if (req.method !== 'PATCH')
                throw new Error(`Expected PATCH, got ${req.method}`);

            return Promise.resolve({
                body: JSON.stringify(setInterfaceMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.setInterface(11652, {
            input: [
                { name: 'item_name', type: 'text', required: true },
                { name: 'quantity', type: 'number', required: false, default: 1 },
            ],
        });
        expect(result).toStrictEqual(setInterfaceMock.scenarioInterface);
        expect(result.input.length).toBe(2);
    });

    // Incomplete executions (DLQ) tests

    it('Should get incomplete executions', async () => {
        fetchMock.mockResponse(req => {
            if (req.url !== 'https://make.local/api/v2/dlqs?scenarioId=11652&pg[limit]=1000')
                throw new Error(`Unmocked HTTP request: ${req.url}`);

            return Promise.resolve({
                body: JSON.stringify(incompleteExecutionsMock),
                headers: {
                    'content-type': 'application/json',
                },
            });
        });

        const result = await make.scenarios.getIncompleteExecutions(11652);
        expect(result).toStrictEqual(incompleteExecutionsMock.dlqs);
        expect(result.length).toBe(2);
        expect(result[0].error?.message).toBe('JSON parsing failed');
    });

    // ValidationError tests

    it('Should create ValidationError with field', () => {
        const error = new ValidationError('Field is required', 'scenarioId');
        expect(error.name).toBe('ValidationError');
        expect(error.message).toBe('Field is required');
        expect(error.field).toBe('scenarioId');
        expect(String(error)).toBe('ValidationError: Field is required (field: scenarioId)');
    });

    it('Should create ValidationError without field', () => {
        const error = new ValidationError('Invalid input');
        expect(error.name).toBe('ValidationError');
        expect(error.message).toBe('Invalid input');
        expect(error.field).toBeUndefined();
        expect(String(error)).toBe('ValidationError: Invalid input');
    });
});
