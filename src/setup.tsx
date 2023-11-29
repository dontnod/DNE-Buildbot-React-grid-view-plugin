import {FaCubes} from "react-icons/fa";
import {buildbotSetupPlugin, RegistrationCallbacks} from "buildbot-plugin-support";
import {DNEGridView} from './views/GridView/DNEGridView';
import {DNEFailureDashboard} from './views/FailureDashboard/DNEFailureDashboard';

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

  reg.registerMenuGroup({
    name: 'dne_fdash',
    caption: 'DNE Failure Dashboard',
    icon: <FaCubes/>,
    order: 4,
    route: '/failure_dash',
    parentName: null,
  });

  reg.registerRoute({
    route: "/failure_dash",
    group: "dne_fdash",
    element: () => <DNEFailureDashboard/>,
  });

  reg.registerSettingGroup({
    name: "DNEGrid",
    caption: "DNEGrid related settings",
    items: [
      {
        type: 'integer',
        name: 'buildFetchLimit',
        caption: 'Maximum number of builds to retrieve per builder',
        defaultValue: 20,
      }
    ]
  });
});
