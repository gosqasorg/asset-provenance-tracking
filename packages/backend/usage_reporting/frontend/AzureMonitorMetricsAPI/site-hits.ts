#!/usr/bin/env npx tsx

// AI Disclosure from Vincent: Some of this code, specifically
// getMetric, getMetricHistory, listMetricDefinitions, and the interfaces
// was generated and advised by Deepseek, Claude, and Gemini

// Run with ./site-hits.ts or npx tsx site-hits.ts


import "dotenv/config";
import { writeFileSync, appendFileSync } from "fs";


// -- Setup -- //

// Note: different env vars than the similar, other ts scripts
const directoryId = process.env["directory_id"];
const appRegistrationId = process.env["app_registration_id"];
const secretValue = process.env["secret_value"];
const staticWebAppResourceId = process.env["static_web_app_resource_id"];

const outputFile = "site_hits.txt";
writeFileSync(outputFile, "");

// NOTE: different scope than the Log Analytics script — these metrics live in the Azure Monitor Metrics API
const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${directoryId}/oauth2/v2.0/token`,
    {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: appRegistrationId!,
            client_secret: secretValue!,
            grant_type: "client_credentials",
            scope: "https://management.azure.com/.default"
        })
    }
);

const { access_token: token } = await tokenResponse.json();


// -- Interfaces -- //

interface MetricValue {
    timeStamp: string;
    total?: number;
}

interface TimeSeries {
    metadatavalues?: unknown[];
    data: MetricValue[];
}

interface Metric {
    id: string;
    name: { value: string; localizedValue: string };
    timeseries: TimeSeries[];
    unit: string;
}

interface MetricsResponse {
    value: Metric[];
    // cost, interval, namespace, resourceregion, timespan also present
    [key: string]: unknown;
}


// -- Utility Functions -- //

function log(line: string): void {
    appendFileSync(outputFile, line + "\n");
}

function hasValue(p: Record<string, unknown>): boolean {
    return ["total", "average", "maximum", "minimum", "count"].some(k => p[k] !== undefined);
}

async function listMetricDefinitions(): Promise<void> {
    const url =
        `https://management.azure.com${staticWebAppResourceId}/providers/microsoft.insights/metricDefinitions` +
        `?api-version=2018-01-01`;

    const result = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    const body = await result.json();
    const values = body.value
    const metric_specs = []
    for(const value of values) {
        const {  
            displayDescription,
            supportedAggregationTypes,
            metricAvailabilities,
        } = value

        const valuable_data = { 
            name: displayDescription,
            aggregation_types: supportedAggregationTypes,
            supported_metrics: metricAvailabilities
        }

        metric_specs.push(valuable_data)
    }

    return metric_specs
}

async function getMetric(
    metricName: string,
    opts: {
        startTime: string;
        endTime: string;
        interval?: string;
        aggregation?: string;
    }
): Promise<MetricsResponse> {
    const params = new URLSearchParams({
        metricnames: [metricName],
        timespan: `${opts.startTime}/${opts.endTime}`,
        interval: opts.interval ?? "PT1H",
        aggregation: opts.aggregation ?? "Total",
        "api-version": "2019-07-01"
    });

    const url =
        `https://management.azure.com${staticWebAppResourceId}/providers/microsoft.insights/metrics?` +
        params.toString();

    const result = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    return (await result.json()) as MetricsResponse;
}

async function getMetricHistory(
    metricName: string[],
    opts: { interval?: string; aggregation?: string } = {}
): Promise<void> {
    const day = 24 * 60 * 60 * 1000 // One day in milliseconds
    const chunkMs = 30 * day; // 30 days
    const retentionMs = 93 * day; 
    const now = Date.now();
    const earliest = now - retentionMs + 60 * 60 * 1000;

    const merged = new Map<string, Metric>();
    let end = now;

    for (let i = 0; end > earliest; i++) {
        const start = Math.max(end - chunkMs, earliest);

        const body = await getMetric(metricName, {
            startTime: new Date(start).toISOString(),
            endTime: new Date(end).toISOString(),
            interval: opts.interval,
            aggregation: opts.aggregation
        });

        const hasData = (body.value ?? []).some(m =>
            (m.timeseries ?? []).some(s =>
                (s.data ?? []).some(p => hasValue(p as Record<string, unknown>))
            )
        );

        if (!hasData) break;

        for (const metric of body.value ?? []) {
            let acc = merged.get(metric.name.value);
            if (!acc) {
                acc = { ...metric, timeseries: [] };
                merged.set(metric.name.value, acc);
            }
            (metric.timeseries ?? []).forEach((series, j) => {
                acc!.timeseries[j] ??= { ...series, data: [] };
                acc!.timeseries[j].data.push(...(series.data ?? []));
            });
        }

        end = start;
    }

    // Chunks were fetched newest-first; sort each series chronologically.
    for (const metric of merged.values()) {
        for (const series of metric.timeseries) {
            series.data.sort((a, b) => a.timeStamp.localeCompare(b.timeStamp));
        }
    }

    const combined: MetricsResponse = { value: [...merged.values()] };

    return combined.value.length == 0 ? undefined : combined.value[0].timeseries[0].data
}


// -- Core Operations -- // 

/*
Returns an object of the following form, specifically packaged for ease of use in dataviz
{
    metric_name_1: { 
        time_bin_1: [ { timesStamp: <timestamp>, count: <number> } ],
        time_bin_2: [ { timesStamp: <timestamp>, count: <number> } ],
        time_bin_3: ...
        ...
        time_bin_n: ...
    },
    metric_name_2: {
        time_bin_1: ...
        ...
        time_bin_n: ...
    },
    ...,
    metric_name_n: {
        ...
    }
}
*/
export async function getAllMetricsAllBins() {

    // Get metric specs
    let metric_specs = await listMetricDefinitions();

    // Reformat for later ease of enumerating data into a convenient object
    let reformatted_metric_specs = {}
    for(let spec of metric_specs) {
        reformatted_metric_specs[spec.name] = []
        for(let timeGrain of spec.supported_metrics) {
            reformatted_metric_specs[spec.name].push(timeGrain['timeGrain'])
        }
    }

    // Create data object
    let all_data = {}
    for(let name in reformatted_metric_specs) {
        console.log(`Getting ${name}`)
        all_data[name] = {}
        for(let timeBin of reformatted_metric_specs[name]) {
            all_data[name][timeBin] = await getMetricHistory(name, { interval: timeBin, aggregation: "Count" });
        }
        console.log(`Got ${name}`)

    }

    return all_data
}


let all_data = await getAllMetricsAllBins()
console.dir(all_data, { depth: null })
log(JSON.stringify(all_data, null, 2))