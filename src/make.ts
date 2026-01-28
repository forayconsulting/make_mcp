import type {
    Scenario,
    ScenarioFull,
    ScenarioFullServerResponse,
    ScenarioInteface,
    ScenarioInterfaceServerResponse,
    ScenarioRunServerResponse,
    ScenariosServerResponse,
    CreateScenarioRequest,
    UpdateScenarioRequest,
    CloneScenarioRequest,
    Blueprint,
    BlueprintServerResponse,
    SetInterfaceRequest,
    ScenarioInterfaceSetServerResponse,
    IncompleteExecution,
    IncompleteExecutionsServerResponse,
    DeleteScenarioServerResponse,
} from './types.js';
import { createMakeError } from './utils.js';

type Fetch = <T = any>(url: string, options?: RequestInit) => Promise<T>;

class Scenarios {
    readonly #fetch: Fetch;

    constructor(fetch: Fetch) {
        this.#fetch = fetch;
    }

    async list(teamId: number): Promise<Scenario[]> {
        return (await this.#fetch<ScenariosServerResponse>(`/scenarios?teamId=${teamId}&pg[limit]=1000`)).scenarios;
    }

    async listOrganization(organizationId: number): Promise<Scenario[]> {
        return (
            await this.#fetch<ScenariosServerResponse>(`/scenarios?organizationId=${organizationId}&pg[limit]=1000`)
        ).scenarios;
    }

    async ['interface'](scenarioId: number): Promise<ScenarioInteface> {
        return (await this.#fetch<ScenarioInterfaceServerResponse>(`/scenarios/${scenarioId}/interface`)).interface;
    }

    async run(scenarioId: number, body: unknown): Promise<ScenarioRunServerResponse> {
        return await this.#fetch<ScenarioRunServerResponse>(`/scenarios/${scenarioId}/run`, {
            method: 'POST',
            body: JSON.stringify({ data: body, responsive: true }),
            headers: {
                'content-type': 'application/json',
            },
        });
    }

    async get(scenarioId: number): Promise<ScenarioFull> {
        return (await this.#fetch<ScenarioFullServerResponse>(`/scenarios/${scenarioId}`)).scenario;
    }

    async create(request: CreateScenarioRequest): Promise<ScenarioFull> {
        return (
            await this.#fetch<ScenarioFullServerResponse>(`/scenarios`, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: {
                    'content-type': 'application/json',
                },
            })
        ).scenario;
    }

    async update(scenarioId: number, request: UpdateScenarioRequest): Promise<ScenarioFull> {
        return (
            await this.#fetch<ScenarioFullServerResponse>(`/scenarios/${scenarioId}`, {
                method: 'PATCH',
                body: JSON.stringify(request),
                headers: {
                    'content-type': 'application/json',
                },
            })
        ).scenario;
    }

    async delete(scenarioId: number): Promise<{ id: number }> {
        return (
            await this.#fetch<DeleteScenarioServerResponse>(`/scenarios/${scenarioId}?confirmed=true`, {
                method: 'DELETE',
            })
        ).scenario;
    }

    async clone(scenarioId: number, request: CloneScenarioRequest): Promise<ScenarioFull> {
        return (
            await this.#fetch<ScenarioFullServerResponse>(`/scenarios/${scenarioId}/clone`, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: {
                    'content-type': 'application/json',
                },
            })
        ).scenario;
    }

    async activate(scenarioId: number): Promise<ScenarioFull> {
        return (
            await this.#fetch<ScenarioFullServerResponse>(`/scenarios/${scenarioId}/start`, {
                method: 'POST',
            })
        ).scenario;
    }

    async deactivate(scenarioId: number): Promise<ScenarioFull> {
        return (
            await this.#fetch<ScenarioFullServerResponse>(`/scenarios/${scenarioId}/stop`, {
                method: 'POST',
            })
        ).scenario;
    }

    async getBlueprint(scenarioId: number, options?: { draft?: boolean }): Promise<Blueprint> {
        const query = options?.draft ? '?bp=1' : '';
        return (await this.#fetch<BlueprintServerResponse>(`/scenarios/${scenarioId}/blueprint${query}`)).blueprint;
    }

    async setInterface(
        scenarioId: number,
        request: SetInterfaceRequest,
    ): Promise<ScenarioInterfaceSetServerResponse['scenarioInterface']> {
        return (
            await this.#fetch<ScenarioInterfaceSetServerResponse>(`/scenarios/${scenarioId}/interface`, {
                method: 'PATCH',
                body: JSON.stringify(request),
                headers: {
                    'content-type': 'application/json',
                },
            })
        ).scenarioInterface;
    }

    async getIncompleteExecutions(scenarioId: number): Promise<IncompleteExecution[]> {
        return (
            await this.#fetch<IncompleteExecutionsServerResponse>(`/dlqs?scenarioId=${scenarioId}&pg[limit]=1000`)
        ).dlqs;
    }
}

export class Make {
    readonly #apiKey: string;
    public readonly zone: string;
    public readonly version: number;
    public readonly scenarios: Scenarios;

    constructor(apiKey: string, zone: string, version = 2) {
        this.#apiKey = apiKey;
        this.zone = zone;
        this.version = version;

        this.scenarios = new Scenarios(this.fetch.bind(this));
    }

    async fetch<T = any>(url: string, options?: RequestInit): Promise<T> {
        options = Object.assign({}, options, {
            headers: Object.assign({}, options?.headers, {
                'user-agent': 'MakeMCPServer/0.1.0',
                authorization: `Token ${this.#apiKey}`,
            }),
        });

        if (url.charAt(0) === '/') {
            if (url.charAt(1) === '/') {
                url = `https:${url}`;
            } else {
                url = `https://${this.zone}/api/v${this.version}${url}`;
            }
        }

        const res = await fetch(url, options);
        if (res.status >= 400) {
            throw await createMakeError(res);
        }

        const contentType = res.headers.get('content-type');
        const result = contentType?.includes('application/json') ? await res.json() : await res.text();
        return result;
    }
}
