import { useState } from "react";
import { Table } from "react-bootstrap";
import { ArrowExpander } from "buildbot-ui";
import { Scheduler } from "../utils/Config";
import { Link } from "react-router-dom";
import { ChangeFilterDetail } from "./ChangeFilterDetail";

type SchedulerDetailProps = {
  scheduler: Scheduler;
};

function renderRow(
  title: string,
  elementFn: () => JSX.Element,
  cond: boolean = true
): JSX.Element {
  if (!cond) {
    return <></>;
  }
  return (
    <tr>
      <td>{title}</td>
      <td>{elementFn()}</td>
    </tr>
  );
}

export const SchedulerDetail = ({ scheduler }: SchedulerDetailProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const renderDetails = () => {
    return (
      <div className="anim-changedetails">
        <Table striped size="sm">
          <tbody>
            {renderRow("Builders", () => (
              <ul className="list-group">
                {scheduler.builder_names.map((builder) => (
                  <li key={builder}>
                    <Link to={`/builders/${builder}`}>{builder}</Link>
                  </li>
                ))}
              </ul>
            ))}

            {renderRow(
              "ChangeFilter",
              () => (
                <ChangeFilterDetail change_filter={scheduler.change_filter!} />
              ),
              scheduler.change_filter !== null
            )}

            {renderRow(
              "Cron",
              () => (
                <>{scheduler.cron}</>
              ),
              scheduler.cron !== null
            )}
            {renderRow(
              "Only if changed",
              () => (
                <>{scheduler.only_if_changed ? "Yes" : "No"}</>
              ),
              scheduler.only_if_changed !== null
            )}
            {renderRow(
              "ForceCron",
              () => (
                <>{scheduler.force_cron}</>
              ),
              scheduler.force_cron !== null
            )}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <div className="schedulerdetail">
      <div
        className="schedulerdetail-heading"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="schedulerdetail-name">{scheduler.name}</span>
        <span>
          {" "}
          <ArrowExpander isExpanded={showDetails} />
          <br />
        </span>
      </div>
      {showDetails ? renderDetails() : <></>}
    </div>
  );
};
