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

from dataclasses import dataclass
from buildbot.www.plugin import Application

# create the interface for the setuptools entry point
ep = Application(__name__, "Buildbot DNE Grid View plugin")


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
    views: list[DNEView]

@dataclass
class DNEProject:
    identifier: str
    display_name: str
    branches: list[DNEBranch]

@dataclass
class DNEConfig:
    projects: list[DNEProject]
