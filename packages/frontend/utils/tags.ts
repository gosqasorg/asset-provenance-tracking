// tags.ts -- Utility functions and definitions for tags.
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

export enum TagName {
    Compatible = "compatible",
    Complete = "complete",
    Counterfeit = "counterfeit",
    Damaged = "damaged",
    Defective = "defective",
    Deployed = "deployed",
    Incompatible = "incompatible",
    Incomplete = "incomplete",
    Inspected = "inspected",
    Received = "received",
    TestedFail = "tested_fail",
    TestedPass = "tested_pass",
}

export enum InternalTagName {
    NotifyAll = "notify_all",
    Recall = "recall",
    Annotate = "annotate",
    ReportingKey = "reportingkey", // This is in use so we can't change the formatting.
}
