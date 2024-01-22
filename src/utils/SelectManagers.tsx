import {URLSearchParamsInit} from "react-router-dom";
import {DNEBranch, DNEConfig, DNEProject, DNEView} from "./Config";

export class DNEProjectBranchSelectManager {
    config: DNEConfig;
    searchParams: URLSearchParams;
    setSearchParams: (nextInit: URLSearchParamsInit) => void;

    projectParamName: string = 'project';
    branchParamName: string = 'branch';

    constructor(
        config: DNEConfig,
        searchParams: URLSearchParams,
        setSearchParams: (nextInit: URLSearchParamsInit) => void
    ) {
        this.config = config;
        this.searchParams = searchParams;
        this.setSearchParams = setSearchParams;

        this.setProjectId(this.getProjectOrDefault()?.identifier);
        this.setBranch(this.getBranchOrDefault()?.identifier);
    }

    getProjectId(): string {
        return this.getValue(this.projectParamName)!;
    }

    getProjectOrDefault(): DNEProject | undefined {
        const projectId = this.getProjectId();
        const project = this.config.projects.find(p => p.identifier === projectId);
        return project ?? this.config.projects.at(0);
    }

    setProjectId(projectId: string | undefined) {
        this.setValue(this.projectParamName, projectId);
    }

    getBranchId(): string {
        return this.getValue(this.branchParamName)!;
    }

    getBranchOrDefault(): DNEBranch | undefined {
        const project = this.getProjectOrDefault();
        if (!project) {
            return undefined;
        }
        const branchId = this.getBranchId();
        const branch = project.branches.find(b => b.identifier === branchId);
        return branch ?? project.branches.at(0);
    }

    setBranch(branch: string | undefined) {
        this.setValue(this.branchParamName, branch);
    }

    getTag() {
        return `${this.getProjectId()}-${this.getBranchId()}`.toLowerCase();
    }

    protected setValue(key: string, value: string | undefined) {
        if (value !== undefined && this.searchParams.get(key) != value) {
            const newParams = new URLSearchParams([...this.searchParams.entries()]);
            newParams.set(key, value);
            this.setSearchParams(newParams);
            this.searchParams = newParams;
        }
        else if (value === undefined && this.searchParams.has(key)) {
            const newParams = new URLSearchParams([...this.searchParams.entries()]);
            newParams.delete(key);
            this.setSearchParams(newParams);
            this.searchParams = newParams;
        }

        const localStorageKey = `dne-${key}`;
        if (value !== undefined) {
            localStorage.setItem(localStorageKey, value);
        }
        else {
            localStorage.removeItem(localStorageKey);
        }
    }

    protected getValue(key: string): string | null {
        return this.searchParams.get(key) ?? localStorage.getItem(`dne-${key}`);
    }
}

export class DNEViewSelectManager extends DNEProjectBranchSelectManager {
    lengthDefault: number;

    viewParamName: string = 'view';
    lengthParamName: string = 'length';

    constructor(
        config: DNEConfig,
        lengthDefault: number,
        searchParams: URLSearchParams,
        setSearchParams: (nextInit: URLSearchParamsInit) => void
    ) {
        super(config, searchParams, setSearchParams);

        this.lengthDefault = lengthDefault;

        this.setView(this.getViewOrDefault()?.identifier);
        this.setValue(this.lengthParamName, this.getLength().toString());
    }

    getViewId(): string {
        return this.getValue(this.viewParamName)!;
    }

    getViewOrDefault(): DNEView | undefined {
        const branch = this.getBranchOrDefault();
        if (!branch) {
            return undefined;
        }
        const viewId = this.getViewId();
        const view = branch.views.find(v => v.identifier === viewId);
        return view ?? branch.views.at(0);
    }

    setView(view: string | undefined) {
        this.setValue(this.viewParamName, view);
    }

    getLength(): number {
        if (!this.searchParams.has(this.lengthParamName)) {
            return this.lengthDefault;
        }
        const parsedLength = parseInt(this.searchParams.get(this.lengthParamName)!);
        if (Number.isNaN(parsedLength)) {
            return this.lengthDefault;
        }
        return Math.max(parsedLength, 1);
    }

    getViewTag() {
        return `${super.getTag()}-${this.getViewId()}`.toLowerCase();
    }
}
