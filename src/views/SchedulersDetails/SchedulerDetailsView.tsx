import "./SchedulerDetailsView.scss";

import { observer } from "mobx-react";
import { useSearchParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import { DNEProjectBranchSelectManager } from "../../utils/SelectManagers";
import { getConfig, DNEConfig } from "../../utils/Config";
import { SchedulerDetail } from "../../components/SchedulerDetail";

function getSelectForm(config: DNEConfig) {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewSelectManager = new DNEProjectBranchSelectManager(
    config,
    searchParams,
    setSearchParams
  );

  const selectForms = (
    <Form inline className="mb-sm-2">
      <Form.Label className="mr-sm-2">Project</Form.Label>
      <Form.Control
        className="mr-sm-2"
        as="select"
        multiple={false}
        value={viewSelectManager.getProjectId().toString()}
        onChange={(event) => viewSelectManager.setProjectId(event.target.value)}
      >
        {viewSelectManager.config.projects.map((p) => (
          <option value={p.identifier}>{p.display_name}</option>
        ))}
      </Form.Control>

      <Form.Label className="mr-sm-2">Branch</Form.Label>
      <Form.Control
        className="mr-sm-2"
        as="select"
        multiple={false}
        value={viewSelectManager.getBranchId()}
        onChange={(event) => viewSelectManager.setBranch(event.target.value)}
      >
        {viewSelectManager.getProjectOrDefault()?.branches.map((branch) => (
          <option value={branch.identifier}>{branch.display_name}</option>
        ))}
      </Form.Control>
    </Form>
  );

  return { form: selectForms, projectBranchTag: viewSelectManager.getTag() };
}

export const SchedulerDetailsView = observer(() => {
  const config: DNEConfig = getConfig();

  const { form: viewSelectForm, projectBranchTag } = getSelectForm(config);

  const schedulerPrefix = `${projectBranchTag}-`;

  const relevantSchedulers = config.schedulers.filter((s) =>
    s.name.startsWith(schedulerPrefix)
  );

  const schedulersWidgets = (
    <ul className="bb-schedulerdetails-view-list list-group">
      {relevantSchedulers.map((scheduler) => (
        <li key={scheduler.name} className="list-group-item">
          <SchedulerDetail scheduler={scheduler} />
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {viewSelectForm}
      {schedulersWidgets}
    </div>
  );
});

export default SchedulerDetailsView;
