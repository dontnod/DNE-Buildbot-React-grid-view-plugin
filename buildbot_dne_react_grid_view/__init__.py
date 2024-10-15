# This file is part of Buildbot.  Buildbot is free software: you can
# redistribute it and/or modify it under the terms of the GNU General Public
# License as published by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright Buildbot Team Members

from __future__ import annotations

from dataclasses import dataclass
from dataclasses import field

from buildbot.www.plugin import Application

# create the interface for the setuptools entry point
ep = Application(__package__, "Buildbot DNE Grid View plugin")


# These classes MUST match classes in src/views/GridView/Utils.tsx
@dataclass
class DNEView:
    identifier: str
    display_group: str
    display_name: str


@dataclass
class DNEBranch:
    identifier: str
    display_name: str
    views: list[DNEView] = field(default_factory=list)


@dataclass
class DNEProject:
    identifier: str
    display_name: str
    branches: list[DNEBranch] = field(default_factory=list)


@dataclass
class ChangeFilter:
    name: str
    project: str
    branch: str
    file_pattern_blacklist: list[str] = field(default_factory=list)
    file_pattern_whitelist: list[str] = field(default_factory=list)
    skip_tags: list[str] = field(default_factory=list)
    user_blacklist: list[str] = field(default_factory=list)
    user_whitelist: list[str] = field(default_factory=list)


@dataclass
class Scheduler:
    name: str
    builder_names: list[str] = field(default_factory=list)
    change_filter: ChangeFilter | None = None

    # Nightly
    only_if_changed: bool | None = None
    # Should be populated with Nightly scheduler `_times_to_cron_line`
    cron: str | None = None
    force_cron: str | None = None


@dataclass
class DNEConfig:
    projects: list[DNEProject] = field(default_factory=list)
    schedulers: list[Scheduler] = field(default_factory=list)
