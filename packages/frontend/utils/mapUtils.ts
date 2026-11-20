// mapUtils.ts -- Utility functions for map.

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

export type LocationStats = {name: string, requests: number, failed: number, responseTime: number, weeks: {}};

// Function to determine fill color based on statistics
export function fillByStats(p: Record<string, any>, featKey: any, stats: Record<string, LocationStats & any>){
    const keys = Object.keys(stats);
    if (!keys.length) return p.noData

    // using log to make skewed data scale better
    const logOf = (k: string) => Math.log10(stats[k]!.requests + 1);
    const logs = keys.map(logOf);


    const minLog = Math.min(...logs);
    const maxLog = Math.max(...logs);

    // flattened key val pair for mapbox expression
    const logValues = keys.flatMap((k, i) => [k, logs[i]]);

    // if it has stats, color it on the gradient, otherwise noData
    // interpolate fillColor based on where logVal falls between minLog and maxLog
    return [
        'match', featKey,
        keys,
        ['interpolate', ['linear'],
            ['match', featKey, ...logValues, minLog],
            minLog, p.low,
            maxLog > minLog ? maxLog : minLog + 1, p.high], //if max and min are same it'll break, so +1 in that case
        p.noData,
    ]
}

// Function to determine radius based on statistics
export function radiusByStats(selected: boolean, data: Record<string, LocationStats & any>){
    const keys = Object.keys(data);
    const featKey = ['get', 'id']
    if (!keys.length) return 0;

    const logs = keys.map((k) => Math.log10(data[k]!.requests + 1));
    const minLog = Math.min(...logs);
    const maxLog = Math.max(...logs);

    const minRadius = 5;
    const maxRadius = 15;
    const selectedRadius = 5;

    // flat map of keys and the log10() of their data
    const logPairs = keys.flatMap((k, i) => [k, logs[i]]);

    return ['match', featKey, 
        keys,
        ['interpolate', ['linear'],
            ['match', featKey, ...logPairs, minLog], 
            minLog, minRadius + (selected ? selectedRadius : 0),
            maxLog > minLog ? maxLog : minLog + 1, maxRadius + (selected ? selectedRadius : 0)], 
        0,
    ];
}

export function strokeByStats(data: Record<string, LocationStats & any>) {
    const keys = Object.keys(data);
    const featKey = ['get', 'id']
    if (!keys.length) return 0;
    // if id matches to key, stroke = 1, else 0
    return ['match', featKey, keys, 1, 0]
}


export function stateNameOf(props: Record<string, any>) {
    if (props.iso_a2 === 'IN') return props.name
    return props.gn_name ?? props.name
}

export function filterByRange(data: Record<string, LocationStats & any>, rangeDays: number){
    const out = {}

    // Get the end date of the range
    const date = new Date()
    date.setDate(date.getDate() - rangeDays)
    const cutoff = date.toISOString().slice(0, 10)

    for (const [key, stats] of Object.entries(data ?? {})){
        let requests = 0, failed = 0, responseTime = 0
        // iterate over each week, adding the data for the weeks that fall into range
        for (const [week, w] of Object.entries(stats.weeks ?? {})) {
            if (week < cutoff) continue

            requests += w.requests
            failed += w.failed
            responseTime += w.responseTime
        }
        const summed = {...stats, requests, failed, responseTime}

        if (summed.requests > 0) {
            out[key] = summed
        }
    }

    return out
}