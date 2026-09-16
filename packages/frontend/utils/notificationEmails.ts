// notificationEmails.ts -- Utility functions for notification email addresses.
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

export function parseNotificationEmails(input: string): string[] | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emails = input
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(email => email.length > 0);

    const hasNoEmails = emails.length === 0;
    const hasInvalidEmail = emails.some(email => !emailRegex.test(email));

    if (hasNoEmails || hasInvalidEmail) {
        return null;
    }

    return Array.from(new Set(emails));
}
