const fs = require('fs');
const path = require('path');
const thresholds = require('./thresholds');

const PERFORMANCE_METRICS = [
    'http_req_duration',
    'transaction_time',
    'iteration_duration'
];

const RELIABILITY_METRICS = [
    'checks',
    'http_req_failed',
    'login_success_rate'
];

const BUSINESS_METRICS = [
    'successful_orders',
    'scenario_executions'
];

const ENDPOINT_NAMES = [
    'register',
    'login',
    'create_order',
    'get_order',
    'list_orders',
    'verify_order',
    'delete_order'
];

function readJsonLines(reportPath) {
    if (!fs.existsSync(reportPath)) {
        throw new Error(`Report file not found: ${reportPath}`);
    }

    const content = fs.readFileSync(reportPath, 'utf8');
    const lines = content.split(/\r?\n/);

    const records = [];

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            return;
        }

        try {
            records.push(JSON.parse(trimmedLine));
        } catch (error) {
            throw new Error(
                `Invalid JSON in report at line ${index + 1}`
            );
        }
    });

    if (records.length === 0) {
        throw new Error(`Report is empty: ${reportPath}`);
    }

    return records;
}

function extractMetrics(records) {
    const extracted = {
        performance: {},
        reliability: {},
        business: {},
        endpoints: {}
    };

    records.forEach((record) => {
        if (!record.metric || !record.type) {
            return;
        }

        if (PERFORMANCE_METRICS.includes(record.metric)) {
            if (!extracted.performance[record.metric]) {
                extracted.performance[record.metric] = [];
            }

            extracted.performance[record.metric].push(record);
        }

        if (RELIABILITY_METRICS.includes(record.metric)) {
            if (!extracted.reliability[record.metric]) {
                extracted.reliability[record.metric] = [];
            }

            extracted.reliability[record.metric].push(record);
        }

        if (BUSINESS_METRICS.includes(record.metric)) {
            if (!extracted.business[record.metric]) {
                extracted.business[record.metric] = [];
            }

            extracted.business[record.metric].push(record);
        }

        if (
            record.metric === 'http_req_duration' &&
            record.data &&
            record.data.tags &&
            ENDPOINT_NAMES.includes(record.data.tags.name)
        ) {
            const endpoint = record.data.tags.name;

            if (!extracted.endpoints[endpoint]) {
                extracted.endpoints[endpoint] = [];
            }

            extracted.endpoints[endpoint].push(record);
        }
    });

    return extracted;
}

function round(value) {
    if (value === null || value === undefined) {
        return null;
    }

    return Number(value.toFixed(2));
}

function getNumericValues(records) {
    return records
        .map((record) => {
            if (!record.data) {
                return null;
            }

            const value = record.data.value;

            return typeof value === 'number' && Number.isFinite(value)
                ? value
                : null;
        })
        .filter((value) => value !== null);
}

function calculatePercentile(values, percentile) {
    if (values.length === 0) {
        return null;
    }

    const sortedValues = [...values].sort((a, b) => a - b);

    const rank = (sortedValues.length - 1) * percentile;

    const lowerIndex = Math.floor(rank);
    const upperIndex = Math.ceil(rank);

    const fraction = rank - lowerIndex;

    if (lowerIndex === upperIndex) {
        return sortedValues[lowerIndex];
    }

    return (
        sortedValues[lowerIndex] +
        fraction *
            (sortedValues[upperIndex] - sortedValues[lowerIndex])
    );
}

function aggregateTrend(records) {
    const values = getNumericValues(records);

    if (values.length === 0) {
        return {
            count: 0,
            avg: null,
            min: null,
            max: null,
            p95: null
        };
    }

    const sum = values.reduce((total, value) => total + value, 0);

    return {
        count: values.length,
        avg: round(sum / values.length),
        min: round(Math.min(...values)),
        max: round(Math.max(...values)),
        p95: round(calculatePercentile(values, 0.95))
    };
}

function aggregateRate(records) {
    const values = getNumericValues(records);

    if (values.length === 0) {
        return {
            count: 0,
            rate: null
        };
    }

    const sum = values.reduce((total, value) => total + value, 0);

    return {
        count: values.length,
        rate: round(sum / values.length)
    };
}

function aggregateCounter(records) {
    const values = getNumericValues(records);

    if (values.length === 0) {
        return {
            count: 0,
            total: 0
        };
    }

    const total = values.reduce((sum, value) => sum + value, 0);

    return {
        count: values.length,
        total: round(total)
    };
}

function aggregateExtractedMetrics(extracted) {
    const aggregated = {
        performance: {},
        reliability: {},
        business: {},
        endpoints: {}
    };

    Object.keys(extracted.performance).forEach((metric) => {
        aggregated.performance[metric] =
            aggregateTrend(extracted.performance[metric]);
    });

    Object.keys(extracted.reliability).forEach((metric) => {
        aggregated.reliability[metric] =
            aggregateRate(extracted.reliability[metric]);
    });

    Object.keys(extracted.business).forEach((metric) => {
        aggregated.business[metric] =
            aggregateCounter(extracted.business[metric]);
    });

    Object.keys(extracted.endpoints).forEach((endpoint) => {
        aggregated.endpoints[endpoint] =
            aggregateTrend(extracted.endpoints[endpoint]);
    });

    return aggregated;
}

function getScenario(records) {
    for (const record of records) {
        if (
            record.data &&
            record.data.tags &&
            record.data.tags.scenario
        ) {
            return record.data.tags.scenario;
        }
    }

    return null;
}

function getVusSummary(records) {
    const values = records
        .filter((record) => record.metric === 'vus')
        .map((record) => record.data && record.data.value)
        .filter(
            (value) =>
                typeof value === 'number' &&
                Number.isFinite(value)
        );

    if (values.length === 0) {
        return {
            min: null,
            max: null
        };
    }

    return {
        min: Math.min(...values),
        max: Math.max(...values)
    };
}

function getHttpStatusDistribution(records) {
    const distribution = {};

    records.forEach((record) => {
        if (
            record.type !== 'Point' ||
            !record.data ||
            !record.data.tags ||
            record.metric !== 'http_req_duration'
        ) {
            return;
        }

        const status = record.data.tags.status;

        if (!status) {
            return;
        }

        distribution[status] = (distribution[status] || 0) + 1;
    });

    return distribution;
}

function buildNegativeAnalysis(records, summary) {
    const statusDistribution = getHttpStatusDistribution(records);

    const expectedStatuses = ['400', '401', '404'];

    let expectedFailures = 0;

    expectedStatuses.forEach((status) => {
        expectedFailures += statusDistribution[status] || 0;
    });

    return {
        expectedFailures: {
            count: expectedFailures,
            statuses: expectedStatuses.filter(
                (status) => statusDistribution[status]
            )
        },
        checks: {
            passed: Math.round(
                summary.reliability.checks.count *
                summary.reliability.checks.rate
            ),
            failed: Math.round(
                summary.reliability.checks.count *
                (1 - summary.reliability.checks.rate)
            ),
            rate: summary.reliability.checks.rate
        },
        httpStatusDistribution: statusDistribution
    };
}


function getNestedValue(object, pathArray) {
    return pathArray.reduce((current, key) => {
        if (current === null || current === undefined) {
            return null;
        }

        return current[key];
    }, object);
}

function evaluateThreshold(value, operator, threshold) {
    if (value === null || value === undefined) {
        return false;
    }

    switch (operator) {
        case 'p95<':
        case 'rate<':
        case 'count<':
            return value < threshold;

        case 'p95>':
        case 'rate>':
        case 'count>':
            return value > threshold;

        case 'p95<=':
        case 'rate<=':
        case 'count<=':
            return value <= threshold;

        case 'p95>=':
        case 'rate>=':
        case 'count>=':
            return value >= threshold;

        default:
            throw new Error(
                `Unsupported threshold operator: ${operator}`
            );
    }
}

function evaluateThresholds(summary) {
    return thresholds.map((thresholdDefinition) => {
        const actualValue = getNestedValue(
            summary,
            thresholdDefinition.summaryPath
        );

        const passed = evaluateThreshold(
            actualValue,
            thresholdDefinition.operator,
            thresholdDefinition.threshold
        );

        return {
            metric: thresholdDefinition.metric,
            operator: thresholdDefinition.operator,
            threshold: thresholdDefinition.threshold,
            actual: actualValue,
            status: passed ? 'PASS' : 'FAIL',
            unit: thresholdDefinition.unit
        };
    });
}
function buildSummary(reportPath, records, aggregated) {
    const vus = getVusSummary(records);

    return {
        report: {
            source: reportPath,
            generatedAt: new Date().toISOString()
        },

        execution: {
            scenario: getScenario(records),
            vus: vus,
            iterations:
                aggregated.performance.iteration_duration
                    ? aggregated.performance.iteration_duration.count
                    : 0,
            httpRequests:
                aggregated.performance.http_req_duration
                    ? aggregated.performance.http_req_duration.count
                    : 0
        },

        reliability: {
            checks:
                aggregated.reliability.checks || {
                    count: 0,
                    rate: null
                },

            httpRequestFailed:
                aggregated.reliability.http_req_failed || {
                    count: 0,
                    rate: null
                },

            loginSuccessRate:
                aggregated.reliability.login_success_rate || {
                    count: 0,
                    rate: null
                }
        },

        performance: {
            httpRequestDuration:
                aggregated.performance.http_req_duration || {
                    count: 0,
                    avg: null,
                    min: null,
                    max: null,
                    p95: null
                },

            transactionTime:
                aggregated.performance.transaction_time || {
                    count: 0,
                    avg: null,
                    min: null,
                    max: null,
                    p95: null
                },

            iterationDuration:
                aggregated.performance.iteration_duration || {
                    count: 0,
                    avg: null,
                    min: null,
                    max: null,
                    p95: null
                }
        },

        endpoints: aggregated.endpoints,

        business: {
            successfulOrders:
                aggregated.business.successful_orders
                    ? aggregated.business.successful_orders.total
                    : 0,

            scenarioExecutions:
                aggregated.business.scenario_executions
                    ? aggregated.business.scenario_executions.total
                    : 0
        }
    };
}

function getSummaryPath(reportPath) {
    const directory = path.dirname(reportPath);
    const fileName = path.basename(reportPath);

    const summaryFileName = fileName.replace(
        '-result.json',
        '-summary.json'
    );

    return path.join(directory, summaryFileName);
}

function writeSummary(summaryPath, summary) {
    fs.writeFileSync(
        summaryPath,
        JSON.stringify(summary, null, 2),
        'utf8'
    );
}
function main() {
    const reportPath = process.argv[2];

    if (!reportPath) {
        throw new Error(
            'Usage: node analyzer/analyzeReport.js <report-path>'
        );
    }

    const records = readJsonLines(reportPath);
    const extracted = extractMetrics(records);
    const aggregated = aggregateExtractedMetrics(extracted);

    const summary = buildSummary(
        reportPath,
        records,
        aggregated
    );

    const scenario = summary.execution.scenario;

    if (scenario === 'negative_test') {
        summary.negativeAnalysis = buildNegativeAnalysis(
            records,
            summary
        );

        summary.thresholds = [];
    } else {
        summary.thresholds = evaluateThresholds(summary);
    }

    const summaryPath = getSummaryPath(reportPath);

    writeSummary(summaryPath, summary);

    console.log(`Report: ${reportPath}`);
    console.log(`Records read: ${records.length}`);
    console.log(`Summary written: ${summaryPath}`);
}

try {
    main();
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}