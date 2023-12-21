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

export type ChangeFilter = {
  name: string
  project: string
  branch: string
  file_pattern_blacklist: string[]
  file_pattern_whitelist: string[]
  skip_tags: string[]
  user_blacklist: string[]
  user_whitelist: string[]
};

export type Scheduler = {
  name: string,
  builder_names: string[],
  change_filter: ChangeFilter | null,

  // Nightly
  only_if_changed: boolean | null,
  cron: string | null,
  force_cron: string | null,
};

export type DNEConfig = {
  projects: DNEProject[]
  schedulers: Scheduler[]
};

export function getConfig(): DNEConfig {
  const config: Config = useContext(ConfigContext);

  return config.plugins['react_dne_grid_view'] as DNEConfig;
};
