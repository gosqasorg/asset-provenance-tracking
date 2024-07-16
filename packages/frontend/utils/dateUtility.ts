// dateUtility.ts -- Time record for utility
// Copyright (C) 2024 GOSQAS Team
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export function tzDate(ts : string) : string {
    var d = new Date(Number(ts));

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatter = new Intl.DateTimeFormat('en-US', {
        hour12: false,
        minute: 'numeric',
        hour: "numeric",
        second: "numeric",
        timeZoneName: "short",
        weekday: 'short',
        timeZone: tz,
    });

    return formatter.format(d);
}
