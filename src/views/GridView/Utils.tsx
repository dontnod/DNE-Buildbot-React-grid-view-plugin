import {URLSearchParamsInit} from "react-router-dom";
import {DNEBranch, DNEConfig, DNEProject, DNEView} from "../../Config";

export class DNEViewSelectManager {
    config: DNEConfig;
    searchParams: URLSearchParams;
    setSearchParams: (nextInit: URLSearchParamsInit) => void;

    projectParamName: string = 'project';
    branchParamName: string = 'branch';
    viewParamName: string = 'view';

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
        this.setView(this.getViewOrDefault()?.identifier);
    }

    getProjectId(): string {
        return this.searchParams.get(this.projectParamName)!;
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
        return this.searchParams.get(this.branchParamName)!;
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

    getViewId(): string {
        return this.searchParams.get(this.viewParamName)!;
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

    getViewTag() {
        return `${this.getProjectId()}-${this.getBranchId()}-${this.getViewId()}`.toLowerCase();
    }

    private setValue(key: string, value: string | undefined) {
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
    }
}
