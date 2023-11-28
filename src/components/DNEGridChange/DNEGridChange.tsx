
import './DNEGridChange.scss';
import {useState} from "react";
import {OverlayTrigger, Popover, Table} from "react-bootstrap";
import {Change, parseChangeAuthorNameAndEmail} from "buildbot-data-js";
import {dateFormat, durationFromNowFormat, useCurrentTime} from "buildbot-ui";
import {ArrowExpander} from "buildbot-ui";
import {ChangeUserAvatar} from "buildbot-ui";

type ChangeDetailsProps = {
  change: Change;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
}

export const DNEGridChange = ({change, showDetails, setShowDetails}: ChangeDetailsProps) => {
  const now = useCurrentTime();
  const [showProps, setShowProps] = useState(false);

  const renderChangeDetails = () => (
    <div className="anim-changedetails">
      <Table striped size="sm">
        <tbody>
          { change.category?.length
            ? <tr>
              <td>Category</td>
              <td>{change.category}</td>
            </tr>
            : <></>
          }
          <tr>
            <td>Author</td>
            <td>{change.author}</td>
          </tr>
          <tr>
            <td>Date</td>
            <td>{dateFormat(change.when_timestamp)} ({durationFromNowFormat(change.when_timestamp, now)})</td>
          </tr>
          { change.codebase?.length
            ? <tr>
                <td>Codebase</td>
                <td>{change.codebase}</td>
              </tr>
            : <></>
          }
          { change.repository?.length
            ? <tr>
              <td>Repository</td>
              <td>{change.repository}</td>
            </tr>
            : <></>
          }
          { change.branch?.length
            ? <tr>
              <td>Branch</td>
              <td>{change.branch}</td>
            </tr>
            : <></>
          }
          <tr>
            <td>Revision</td>
            <td>{change.revision}</td>
          </tr>
          <tr>
            <td>Properties</td>
            <td>
              <ArrowExpander isExpanded={showProps} setIsExpanded={setShowProps}/>
              { showProps
                ? <pre className="dne-changedetails-properties">{JSON.stringify(change.properties)}</pre>
                : <></>
              }
            </td>
          </tr>
        </tbody>
      </Table>
      <h5>Comment</h5>
      <pre>{change.comments}</pre>
      <h5>Changed files</h5>
      {change.files.length === 0
        ? <p>No files</p>
        : <ul>{change.files.map(file => (<li key={file}>{file}</li>))}</ul>
      }
    </div>
  );

  const [changeAuthorName, changeEmail] = parseChangeAuthorNameAndEmail(change.author);

  const popoverWithText = (id: string, text: string) => {
    return (
      <Popover id={"bb-popover-change-details-" + id}>
        <Popover.Content>
          {text}
        </Popover.Content>
      </Popover>
    );
  }

  const content = (
    <div>
      <span>{change.project}: </span>
      <OverlayTrigger placement="top" overlay={popoverWithText("comments-" + change.id, change.comments)}>
        <b className="dne-changedetails-revision">{change.revision}</b>
      </OverlayTrigger>
      <span> <ArrowExpander isExpanded={showDetails}/><br/></span>
      <OverlayTrigger
        placement="top"
        overlay={popoverWithText("date-" + change.id, dateFormat(change.when_timestamp))}
      >
        <span>{durationFromNowFormat(change.when_timestamp, now)}</span>
      </OverlayTrigger>
      <br/>
      <ChangeUserAvatar name={changeAuthorName} email={changeEmail} showName={false}/>
      <br/>
      in <b>{change.branch}</b>
    </div>
  );

  return (
    <div className="dne-changedetails">
      <div className="dne-changedetails-heading" onClick={() => setShowDetails(!showDetails)}>
        {content}
      </div>
      {showDetails ? renderChangeDetails() : <></>}
    </div>
  );
}
