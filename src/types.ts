export type Scenario = {
    id: number;
    name: string;
    description?: string;
    scheduling: {
        type: string;
    };
};

export type ScenariosServerResponse = {
    scenarios: Scenario[];
};

export type Input = {
    name?: string;
    type: string;
    required?: boolean;
    default?: string | number | boolean | null;
    options?: {
        value: string;
    }[];
    help?: string;
    spec?: Input[] | Input;
};

export type ScenarioInteface = {
    input: Input[];
    output: null;
};

export type ScenarioInterfaceServerResponse = {
    interface: ScenarioInteface;
};

export type ScenarioRunServerResponse = {
    executionId: string;
    outputs: unknown;
};

// Extended scenario with full details
export type ScenarioFull = {
    id: number;
    name: string;
    description?: string;
    teamId: number;
    folderId?: number | null;
    islinked?: boolean;
    isPaused: boolean;
    usedPackages: string[];
    lastEdit: string;
    scheduling: {
        type: string;
        interval?: number;
        date?: string;
        time?: string;
        days?: number[];
    };
    isActive: boolean;
    isinvalid?: boolean;
    islocked?: boolean;
    createdByUser?: {
        id: number;
        name: string;
        email: string;
    };
    updatedByUser?: {
        id: number;
        name: string;
        email: string;
    };
    created?: string;
    nextExec?: string | null;
    dlqCount?: number;
};

export type ScenarioFullServerResponse = {
    scenario: ScenarioFull;
};

// Blueprint types
export type BlueprintModule = {
    id: number;
    module: string;
    version: number;
    mapper?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
    filter?: {
        name: string;
        conditions: unknown[][];
    };
    routes?: BlueprintRoute[];
};

export type BlueprintRoute = {
    flow: BlueprintModule[];
};

export type Blueprint = {
    name: string;
    flow: BlueprintModule[];
    metadata?: {
        instant: boolean;
        version: number;
        scenario?: {
            roundtrips: number;
            maxErrors: number;
            autoCommit: boolean;
            autoCommitTriggerLast: boolean;
            sequential: boolean;
            slots?: null;
            confidential: boolean;
            dataloss: boolean;
            dlq: boolean;
            freshVariables: boolean;
        };
        designer?: {
            orphans: unknown[];
        };
        zone?: string;
    };
};

export type BlueprintServerResponse = {
    blueprint: Blueprint;
    scheduling?: {
        type: string;
        interval?: number;
    };
};

// Request types for scenario operations
export type CreateScenarioRequest = {
    teamId?: number;
    name?: string;
    folderId?: number | null;
    blueprint?: string; // JSON string of Blueprint
    scheduling?: string; // JSON string of scheduling config
};

export type UpdateScenarioRequest = {
    name?: string;
    folderId?: number | null;
    blueprint?: string; // JSON string of Blueprint
    scheduling?: string; // JSON string of scheduling config
};

export type CloneScenarioRequest = {
    name?: string;
    teamId?: number;
    folderId?: number | null;
};

// Interface types
export type InterfaceInput = {
    name: string;
    type: string;
    label?: string;
    help?: string;
    required?: boolean;
    default?: string | number | boolean | null;
    multiline?: boolean;
    spec?: InterfaceInput | InterfaceInput[];
    options?: { value: string; label?: string }[];
};

export type SetInterfaceRequest = {
    input: InterfaceInput[];
};

export type ScenarioInterfaceSetServerResponse = {
    scenarioInterface: {
        input: InterfaceInput[];
        output: unknown[] | null;
    };
};

// Incomplete execution / DLQ types
export type IncompleteExecution = {
    id: string;
    scenarioId: number;
    executionId: string;
    bundle: unknown;
    moduleId: number;
    error?: {
        message: string;
        type?: string;
    };
    created: string;
    resolved?: boolean;
};

export type IncompleteExecutionsServerResponse = {
    dlqs: IncompleteExecution[];
};

// Delete response
export type DeleteScenarioServerResponse = {
    scenario: {
        id: number;
    };
};
