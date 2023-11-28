import {useContext} from "react";
import {
  Config,
  ConfigContext,
} from "buildbot-ui";


export type DNEView = {
  identifier: string,
  display_group: string,
  display_name: string,
};

export type DNEBranch = {
  identifier: string,
  display_name: string,
  views: DNEView[],
};

export type DNEProject = {
  identifier: string,
  display_name: string,
  branches: DNEBranch[],
};

export type DNEConfig = {
  projects: DNEProject[]
};

export function getConfig(): DNEConfig {
  const config: Config = useContext(ConfigContext);

  return config.plugins['react_dne_grid_view'] as DNEConfig;
};
