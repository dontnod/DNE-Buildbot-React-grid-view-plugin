import { useState } from "react";
import { ChangeFilter } from "../utils/Config";
import { ArrowExpander } from "buildbot-ui";
import { Table } from "react-bootstrap";

type ChangeFilterDetailProps = {
  change_filter: ChangeFilter;
};

function renderListIfNotEmpty(title: string, list: string[]) {
  if (list.length <= 0) {
    return <></>;
  }

  return (
    <tr>
      <td>{title}</td>
      <td>
        <ul className="list-group">
          {list.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </td>
    </tr>
  );
}

export const ChangeFilterDetail = ({
  change_filter,
}: ChangeFilterDetailProps) => {
  const [showChangeFilter, setShowChangeFilter] = useState(false);

  const renderDetails = () => (
    <Table striped size="sm">
      <tbody>
        {renderListIfNotEmpty(
          "File Pattern Blacklist",
          change_filter.file_pattern_blacklist
        )}
        {renderListIfNotEmpty(
          "File Pattern Whitelist",
          change_filter.file_pattern_whitelist
        )}
        {renderListIfNotEmpty(
          "User Pattern Blacklist",
          change_filter.user_blacklist
        )}
        {renderListIfNotEmpty(
          "User Pattern Whitelist",
          change_filter.user_whitelist
        )}
        {renderListIfNotEmpty("Skip tags", change_filter.skip_tags)}
      </tbody>
    </Table>
  );

  return (
    <div className="schedulerdetail-changefilter">
      <div
        className="schedulerdetail-changefilter-heading"
        onClick={() => setShowChangeFilter(!showChangeFilter)}
      >
        <span>
          <b className="schedulerdetail-changefilter-name">
            {change_filter.name}
          </b>{" "}
          ({change_filter.project} {change_filter.branch})
        </span>
        <span>
          {" "}
          <ArrowExpander isExpanded={showChangeFilter} />
          <br />
        </span>
      </div>
      {showChangeFilter ? renderDetails() : <></>}
    </div>
  );
};
