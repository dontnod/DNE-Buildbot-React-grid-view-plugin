import {ObservableMap, observable} from "mobx";
import {observer, useLocalObservable} from "mobx-react";
import {Link, useSearchParams} from "react-router-dom";
import {FaCubes} from "react-icons/fa";
import {Form} from "react-bootstrap";
import {
  Builder,
  Build,
  Buildrequest,
  Change,
  DataCollection,
  useDataAccessor,
  useDataApiQuery,
  useDataApiDynamicQuery,
  DataMultiCollection,
} from "buildbot-data-js";
import {
  LoadingIndicator,
  pushIntoMapOfArrays,
  ChangeDetails,
  BuildLinkWithSummaryTooltip
} from "buildbot-ui";
import {buildbotGetSettings, buildbotSetupPlugin, RegistrationCallbacks} from "buildbot-plugin-support";
import {DNEViewSelectManager} from "./Utils";
import {getConfig, DNEConfig, DNEView} from "./Config";

function getViewSelectForm(config: DNEConfig) {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewSelectManager = new DNEViewSelectManager(config, searchParams, setSearchParams);

  const projectViews = viewSelectManager.getBranchOrDefault()?.views ?? [];

  const groupedViews = Array.from(projectViews.reduce(function(rv, view: DNEView) {
    const key = view.display_group;
    rv.get(key)?.push(view) ?? rv.set(key, [view]);
    return rv;
  }, new Map<string, DNEView[]>()));

  const selectForms = (
    <Form inline className="mb-sm-2">
    <Form.Label className="mr-sm-2">Project</Form.Label>
      <Form.Control className="mr-sm-2" as="select" multiple={false} value={viewSelectManager.getProjectId().toString()}
                    onChange={event => viewSelectManager.setProjectId(event.target.value)}>
        {viewSelectManager.config.projects.map(p => (<option value={p.identifier}>{p.display_name}</option>))}
      </Form.Control>
      <Form.Label className="mr-sm-2">Branch</Form.Label>
      <Form.Control className="mr-sm-2" as="select" multiple={false} value={viewSelectManager.getBranchId()}
                    onChange={event => viewSelectManager.setBranch(event.target.value)}>
        {viewSelectManager.getProjectOrDefault()?.branches.map(branch => (<option value={branch.identifier}>{branch.display_name}</option>))}
      </Form.Control>
      <Form.Label className="mr-sm-2">View</Form.Label>
      <Form.Control className="mr-sm-2" as="select" multiple={false} value={viewSelectManager.getViewId()}
                    onChange={event => viewSelectManager.setView(event.target.value)}>
        {groupedViews.map(([key, values]) => (<optgroup label={key}>{values.map(view => <option value={view.identifier}>{view.display_name}</option>)}</optgroup>))}
      </Form.Control>
    </Form>
  );

  const viewTag = viewSelectManager.getViewTag();

  return {form: selectForms, viewTag: viewTag};
}

function getGotRevisionFromBuild(build: Build) {
  if (build.properties !== null && ('got_revision' in build.properties)) {
    const revision = build.properties['got_revision'][0];
    if (typeof(revision) === "string") {
      return revision;
    }
  }

  return null;
}

function getDatas(viewTag: string, buildFetchLimit: number) {
  const accessor = useDataAccessor([]);

  const buildersQuery = useDataApiQuery(() => Builder.getAll(accessor, {query: {order: 'name'}}));
  const builders: Builder[] = buildersQuery
    .array
    .filter((b: Builder) => b.tags.indexOf(viewTag) >= 0);

  const builderIds = observable(builders.map((b: Builder) => b.id));
  const buildrequestsQuery = useDataApiDynamicQuery(builderIds, () => {
    if (builderIds.length <= 0) {
      const resolvedDataCollection = new DataCollection<Buildrequest>();
      resolvedDataCollection.resolved = buildersQuery.isResolved();
      return resolvedDataCollection;
    }

    // NOTE(TDS): Weirdly, getRelatedOfFiltered doesn't seem to work...
    // NOTE(TDS): Fixed in https://github.com/buildbot/buildbot/pull/7099
    return buildersQuery.getRelated(
      (builder: Builder) => {
        // NOTE(TDS): There must be a better way...
        if (builderIds.indexOf(builder.id) < 0) {
          const resolvedDataCollection = new DataCollection<Buildrequest>();
          resolvedDataCollection.resolved = true;
          return resolvedDataCollection;
        }

        return builder.getBuildrequests({query: {
          limit: buildFetchLimit,
          order: '-buildrequestid'
        }})
      });
  });

  let buildrequestsCompleted = false;
  if (builderIds.length > 0 && buildrequestsQuery.isResolved()) {
    buildrequestsCompleted = (buildrequestsQuery as DataMultiCollection<Builder, Buildrequest>).getAll().reduce((rv: boolean, br: Buildrequest) => rv && br.complete, true);
  }
  const buildsQuery = useDataApiDynamicQuery(
    [buildrequestsCompleted],
    () => {
      return buildrequestsQuery.getRelated((br: Buildrequest) => br.getBuilds({query: {property: ["got_revision"]}}));
    }
  );

  const changesQuery = useDataApiQuery(() => {
    return buildsQuery.getRelated((b: Build) => b.getChanges({query: {limit: 1, order: '-changeid'}}));
  });

  const changesRevisions = new Set<string>();
  if (changesQuery.isResolved()) {
    for (const change of changesQuery.getAll()) {
      if (change.revision) {
        changesRevisions.add(change.revision);
      }
    }
  }

  const isReadyForChangesByRevision = buildsQuery.isResolved() && changesQuery.isResolved();
  const changesByRevisionQuery = useDataApiDynamicQuery(
    [isReadyForChangesByRevision],
      () => {
      return buildsQuery.getRelated((build: Build) => {
        const revision = getGotRevisionFromBuild(build);
        const changesFromChangesQuery = changesQuery.getNthOfParentOrNull(build.buildid.toString(), 0);
        const alreadyHasChange = revision ? changesRevisions.has(revision) : false;
        if (
          revision !== null &&
          // did we not get the Build changes?
          changesFromChangesQuery === null &&
          // did another build got the change for this revision?
          !alreadyHasChange
        ) {
          return Change.getAll(accessor, {query: {limit: 1, order: '-changeid', revision: revision.toString()}});
        }

        const resolvedDataCollection = new DataCollection<Change>();
        resolvedDataCollection.resolved = isReadyForChangesByRevision;
        return resolvedDataCollection;
      });
    }
  );

  const queriesResolved =
    buildersQuery.isResolved() &&
    buildrequestsQuery.isResolved() &&
    buildsQuery.isResolved() &&
    changesQuery.isResolved() &&
    changesByRevisionQuery.isResolved();

  return {
    queriesResolved,
    builders,
    buildrequestsQuery,
    buildsQuery,
    changesQuery,
    changesByRevisionQuery,
  };
}

export const DNEGridView = observer(() => {
  const config: DNEConfig = getConfig();
  const settings = buildbotGetSettings();
  const buildFetchLimit = settings.getIntegerSetting("DNEGrid.buildFetchLimit");
  const {form: viewSelectForm, viewTag} = getViewSelectForm(config);
  const {
    queriesResolved,
    builders,
    buildrequestsQuery,
    buildsQuery,
    changesQuery,
    changesByRevisionQuery,
  } = getDatas(viewTag, buildFetchLimit);

  const changeIsExpandedByChangeId = useLocalObservable(() => new ObservableMap<number, boolean>());

  // FIXME: fa-spin
  if (!queriesResolved) {
    return (
      <div className="bb-grid-container">
        {viewSelectForm}
        <LoadingIndicator/>
      </div>
    );
  }

  const changeByRevision = new Map<string, Change>();
  for (const change of changesQuery.getAll()) {
    const revision = change?.revision;
    if (revision && !changeByRevision.has(revision)) {
      changeByRevision.set(revision, change);
    }
  }
  for (const change of changesByRevisionQuery.getAll()) {
    const revision = change?.revision;
    if (revision && !changeByRevision.has(revision)) {
      changeByRevision.set(revision, change);
    }
  }

  const buildsByChanges = new Map<string | null, {change: Change | null, revision: string | null, builds: Map<number, Build[]>}>();
  for (const builder of builders) {
    const buildrequestsCollection = (buildrequestsQuery as DataMultiCollection<Builder, Buildrequest>).getParentCollectionOrEmpty(builder.builderid.toString());
    for (const buildrequest of buildrequestsCollection.array) {
      const buildsCollection = buildsQuery.getParentCollectionOrEmpty(buildrequest.buildrequestid.toString())
      for (const build of buildsCollection.array) {
        const revision = getGotRevisionFromBuild(build);

        let change = changesQuery.getNthOfParentOrNull(build.buildid.toString(), 0);
        if (!change) {
          // Did we do a request for this build?
          change = changesByRevisionQuery.getNthOfParentOrNull(build.buildid.toString(), 0);
          // Try to find change from got_revision in changes got from other builders
          if (!change && revision) {
            change = changeByRevision.get(revision) ?? null;
          }
        }

        const changeid = change?.revision ?? revision;

        if (!buildsByChanges.has(changeid)) {
          buildsByChanges.set(changeid, {change: change, revision, builds: new Map<number, Build[]>()});
        }

        pushIntoMapOfArrays(buildsByChanges.get(changeid)!.builds, builder.builderid, build);
      }
    }
  }

  const bodyIntermediate = Array.from(buildsByChanges.values()).map(({change, revision, builds}) => {
    let changeUI;
    if (change) {
      changeUI = (
        <ChangeDetails change={change} compact={true}
          showDetails={changeIsExpandedByChangeId.get(change.changeid) ?? false}
          setShowDetails={(show: boolean) => changeIsExpandedByChangeId.set(change.changeid, show)}
        />
      );
    }
    else if (revision) {
      changeUI = revision;
    }
    else {
      changeUI = "ChangeNotFound";
    }
    return {
      change: changeUI,
      buildersUI: builders.map((b: Builder) => {
        return <td>{builds.get(b.builderid)?.map((build: Build) => <BuildLinkWithSummaryTooltip key={build.buildid} build={build}/>)}</td>
      })
    };
  });

  const body = bodyIntermediate.map(({change, buildersUI}) => {
    return (
    <tr>
      <td>
        {change}
      </td>
      {buildersUI}
    </tr>
    );
  });

  return (
    <div className="container grid">
      {viewSelectForm}
      <table className="table table-condensed table-striped table-hover">
        <thead>
          <tr>
            <th>Change</th>
            {builders.map(builder => <th><Link to={`/builders/${builder.builderid}`}>{builder.name}</Link></th>)}
          </tr>
        </thead>
        <tbody>
          {body}
        </tbody>
      </table>
    </div>
  );
});

buildbotSetupPlugin((reg: RegistrationCallbacks) => {
  reg.registerMenuGroup({
    name: 'dne_grid',
    caption: 'DNE Grid View',
    icon: <FaCubes/>,
    order: 4,
    route: '/dne_grid',
    parentName: null,
  });

  reg.registerRoute({
    route: "/dne_grid",
    group: "dne_grid",
    element: () => <DNEGridView/>,
  });

  reg.registerSettingGroup({
    name: "DNEGrid",
    caption: "DNEGrid related settings",
    items: [
      {
        type: 'integer',
        name: 'buildFetchLimit',
        caption: 'Maximum number of builds to retrieve per builder',
        defaultValue: 5
      }
    ]
  });
});

export default DNEGridView;
