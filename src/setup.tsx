import {buildbotSetupPlugin, RegistrationCallbacks, RouteConfig, GroupSettings} from "buildbot-plugin-support";
import {DNEGridView} from './views/GridView/DNEGridView';

type RouteWithMenuConfig = {
  reg: RegistrationCallbacks,
} & GroupSettings & RouteConfig;

function registerRouteWithMenu({
  reg,
  name,
  caption,
  order,
  route,
  element,
  icon,
  parentName,
  group,
}: RouteWithMenuConfig) {
  reg.registerMenuGroup({
    name: name,
    caption: caption,
    icon: icon,
    order: order,
    route: route,
    parentName: parentName,
  });

  reg.registerRoute({
    route: route,
    group: group ?? name,
    element: element,
  });
}

buildbotSetupPlugin((reg: RegistrationCallbacks) => {
  registerRouteWithMenu({
    reg,
    name: 'dne_grid',
    caption: 'DNE Grid View',
    order: 4,
    route: '/dne_grid',
    element: () => <DNEGridView/>,
    parentName: null,
    group: null,
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
