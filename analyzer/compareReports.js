const fs = require('fs');
const path = require('path');

function readSummary(summaryPath) {
    if (!fs.existsSync(summaryPath)) {
        throw new Error(`Summary file not found: ${summaryPath}`);
    }

    const content = fs.readFileSync(summaryPath, 'utf8');

    try {
        return JSON.parse(content);
    } catch (error) {
        throw new Error(
            `Invalid JSON in summary file: ${summaryPath}`
        );
    }
}

function validateSummaries(baseline, current) {
    const requiredSections = [
        'execution',
        'reliability',
        'performance',
        'business',
        'endpoints'
    ];

    [baseline, current].forEach((summary, index) => {
        const summaryName = index === 0
            ? 'baseline'
            : 'current';

        requiredSections.forEach((section) => {
            if (!summary[section]) {
                throw new Error(
                    `${summaryName} summary is missing required section: ${section}`
                );
            }
        });
    });

    const baselineScenario = baseline.execution.scenario;
    const currentScenario = current.execution.scenario;

    if (!baselineScenario || !currentScenario) {
        throw new Error(
            'Both summaries must contain execution.scenario'
        );
    }

    if (baselineScenario !== currentScenario) {
        throw new Error(
            `Scenario mismatch: baseline="${baselineScenario}", ` +
            `current="${currentScenario}"`
        );
    }
}

const REGRESSION_TOLERANCE = 5;
function roundToTwoDecimals(value) {
    if (value === null || value === undefined) {
        return value;
    }

    return Number(value.toFixed(2));
}
function compareMetric(
    baselineValue,
    currentValue,
    direction
) {
    if (
        baselineValue === null ||
        baselineValue === undefined ||
        currentValue === null ||
        currentValue === undefined
    ) {
        return {
            baseline:
                baselineValue === undefined
                    ? null
                    : baselineValue,
        
            current:
                currentValue === undefined
                    ? null
                    : currentValue,
        
            absoluteChange: null,
            percentageChange: null,
            status: 'NOT_AVAILABLE'
        };
    }

    const absoluteChange =
    roundToTwoDecimals(
        currentValue - baselineValue
    );

    let percentageChange = null;
let rawPercentageChange = null;

if (baselineValue !== 0) {
    rawPercentageChange =
        ((currentValue - baselineValue) /
            baselineValue) * 100;

    percentageChange =
        roundToTwoDecimals(
            rawPercentageChange
        );
}

    let status = 'NO_CHANGE';

    if (direction === 'lower_better') {
        if (rawPercentageChange > REGRESSION_TOLERANCE) {
            status = 'REGRESSION';
        } else if (
            rawPercentageChange < -REGRESSION_TOLERANCE
        ) {
            status = 'IMPROVEMENT';
        }
    }

    if (direction === 'higher_better') {
        if (rawPercentageChange > REGRESSION_TOLERANCE) {
            status = 'REGRESSION';
        } else if (
            rawPercentageChange < -REGRESSION_TOLERANCE
        ) {
            status = 'IMPROVEMENT';
        }
    }

    if (
        direction === 'lower_better' &&
        baselineValue === 0
    ) {
        if (currentValue > 0) {
            status = 'REGRESSION';
        } else {
            status = 'NO_CHANGE';
        }
    }

    return {
        baseline: baselineValue,
        current: currentValue,
        absoluteChange,
        percentageChange,
        status
    };
}

function getMetricValue(
    summary,
    metricName,
    statisticName
) {
    if (
        !summary ||
        !summary[metricName]
    ) {
        return undefined;
    }

    return summary[metricName][statisticName];
}

function compareMetrics(baseline, current) {
    const successfulOrders = compareMetric(
        baseline.business.successfulOrders,
        current.business.successfulOrders,
        'higher_better'
    );

    successfulOrders.status = 'INFORMATIONAL';

    const scenarioExecutions = compareMetric(
        baseline.business.scenarioExecutions,
        current.business.scenarioExecutions,
        'higher_better'
    );

    scenarioExecutions.status = 'INFORMATIONAL';

    const endpoints = {};

    Object.keys(baseline.endpoints).forEach((endpoint) => {
        if (!current.endpoints[endpoint]) {
            endpoints[endpoint] = {
                avg: {
                    baseline: baseline.endpoints[endpoint].avg,
                    current: null,
                    absoluteChange: null,
                    percentageChange: null,
                    status: 'NOT_COMPARABLE'
                },

                p95: {
                    baseline: baseline.endpoints[endpoint].p95,
                    current: null,
                    absoluteChange: null,
                    percentageChange: null,
                    status: 'NOT_COMPARABLE'
                }
            };

            return;
        }

        endpoints[endpoint] = {
            avg: compareMetric(
                baseline.endpoints[endpoint].avg,
                current.endpoints[endpoint].avg,
                'lower_better'
            ),

            p95: compareMetric(
                baseline.endpoints[endpoint].p95,
                current.endpoints[endpoint].p95,
                'lower_better'
            )
        };
    });

    Object.keys(current.endpoints).forEach((endpoint) => {
        if (!baseline.endpoints[endpoint]) {
            endpoints[endpoint] = {
                avg: {
                    baseline: null,
                    current: current.endpoints[endpoint].avg,
                    absoluteChange: null,
                    percentageChange: null,
                    status: 'NOT_COMPARABLE'
                },

                p95: {
                    baseline: null,
                    current: current.endpoints[endpoint].p95,
                    absoluteChange: null,
                    percentageChange: null,
                    status: 'NOT_COMPARABLE'
                }
            };
        }
    });

    const execution = {
        vus: {
            min: compareMetric(
                baseline.execution.vus.min,
                current.execution.vus.min,
                'higher_better'
            ),

            max: compareMetric(
                baseline.execution.vus.max,
                current.execution.vus.max,
                'higher_better'
            )
        },

        iterations: compareMetric(
            baseline.execution.iterations,
            current.execution.iterations,
            'higher_better'
        ),

        httpRequests: compareMetric(
            baseline.execution.httpRequests,
            current.execution.httpRequests,
            'higher_better'
        )
    };

    execution.vus.min.status = 'INFORMATIONAL';
    execution.vus.max.status = 'INFORMATIONAL';
    execution.iterations.status = 'INFORMATIONAL';
    execution.httpRequests.status = 'INFORMATIONAL';

    return {
        performance: {
            httpRequestDuration: {
                avg: compareMetric(
                    baseline.performance.httpRequestDuration.avg,
                    current.performance.httpRequestDuration.avg,
                    'lower_better'
                ),

                p95: compareMetric(
                    baseline.performance.httpRequestDuration.p95,
                    current.performance.httpRequestDuration.p95,
                    'lower_better'
                )
            },

            transactionTime: {
                avg: compareMetric(
                    getMetricValue(
                        baseline.performance,
                        'transactionTime',
                        'avg'
                    ),
                    getMetricValue(
                        current.performance,
                        'transactionTime',
                        'avg'
                    ),
                    'lower_better'
                ),
            
                p95: compareMetric(
                    getMetricValue(
                        baseline.performance,
                        'transactionTime',
                        'p95'
                    ),
                    getMetricValue(
                        current.performance,
                        'transactionTime',
                        'p95'
                    ),
                    'lower_better'
                )
            },

            iterationDuration: {
                avg: compareMetric(
                    baseline.performance.iterationDuration.avg,
                    current.performance.iterationDuration.avg,
                    'lower_better'
                ),

                p95: compareMetric(
                    baseline.performance.iterationDuration.p95,
                    current.performance.iterationDuration.p95,
                    'lower_better'
                )
            }
        },

        reliability: {
            checks: compareMetric(
                baseline.reliability.checks.rate,
                current.reliability.checks.rate,
                'higher_better'
            ),

            httpRequestFailed: compareMetric(
                baseline.reliability.httpRequestFailed.rate,
                current.reliability.httpRequestFailed.rate,
                'lower_better'
            ),

            loginSuccessRate: compareMetric(
                baseline.reliability.loginSuccessRate.rate,
                current.reliability.loginSuccessRate.rate,
                'higher_better'
            )
        },

        business: {
            successfulOrders: successfulOrders,
            scenarioExecutions: scenarioExecutions
        },

        endpoints: endpoints,

        execution: execution
    };
}

function buildComparison(
    baselinePath,
    currentPath,
    baseline,
    current
) {
    const metrics = compareMetrics(
        baseline,
        current
    );

    return {
        comparison: {
            baseline: baselinePath,
            current: currentPath,
            scenario: current.execution.scenario,
            generatedAt: new Date().toISOString(),
            tolerance: REGRESSION_TOLERANCE
        },

        execution: metrics.execution,

        performance: metrics.performance,

        reliability: metrics.reliability,

        business: metrics.business,

        endpoints: metrics.endpoints
    };
}

function collectRegressions(comparison) {
    const regressions = [];

    function addRegression(
        metricPath,
        metric
    ) {
        if (
            metric &&
            metric.status === 'REGRESSION'
        ) {
            regressions.push({
                metric: metricPath,
                baseline: metric.baseline,
                current: metric.current,
                absoluteChange:
                    metric.absoluteChange,
                percentageChange:
                    metric.percentageChange,
                status: metric.status
            });
        }
    }

    Object.keys(comparison.performance).forEach(
        (metricName) => {
            const metricGroup =
                comparison.performance[metricName];

            Object.keys(metricGroup).forEach(
                (statisticName) => {
                    addRegression(
                        `performance.${metricName}.${statisticName}`,
                        metricGroup[statisticName]
                    );
                }
            );
        }
    );

    Object.keys(comparison.reliability).forEach(
        (metricName) => {
            addRegression(
                `reliability.${metricName}`,
                comparison.reliability[metricName]
            );
        }
    );

    Object.keys(comparison.endpoints).forEach(
        (endpoint) => {
            const endpointMetrics =
                comparison.endpoints[endpoint];

            Object.keys(endpointMetrics).forEach(
                (statisticName) => {
                    addRegression(
                        `endpoints.${endpoint}.${statisticName}`,
                        endpointMetrics[statisticName]
                    );
                }
            );
        }
    );

    return regressions;
}

function buildComparisonSummary(comparison, regressions) {
    let improvementCount = 0;
    let noChangeCount = 0;
    let notComparableCount = 0;

    function countMetrics(section) {
        Object.keys(section).forEach((metricName) => {
            const metric = section[metricName];

            if (!metric) {
                return;
            }

            if (metric.status === 'IMPROVEMENT') {
                improvementCount++;
            } else if (metric.status === 'NO_CHANGE') {
                noChangeCount++;
            } else if (
                metric.status === 'NOT_COMPARABLE' ||
                metric.status === 'NOT_AVAILABLE'
            ) {
                notComparableCount++;
            }
        });
    }

    Object.keys(comparison.performance).forEach(
        (metricName) => {
            countMetrics(
                comparison.performance[metricName]
            );
        }
    );
    countMetrics(comparison.reliability);

    Object.keys(comparison.endpoints).forEach(
        (endpoint) => {
            countMetrics(
                comparison.endpoints[endpoint]
            );
        }
    );

    return {
        status:
            regressions.length > 0
                ? 'REGRESSION_DETECTED'
                : 'NO_REGRESSION_DETECTED',

        regressionCount: regressions.length,

        improvementCount: improvementCount,

        noChangeCount: noChangeCount,

        notComparableCount: notComparableCount
    };
}

function getComparisonPath(currentPath) {
    const directory = path.dirname(currentPath);
    const fileName = path.basename(currentPath);

    const comparisonFileName = fileName.replace(
        '-summary.json',
        '-comparison.json'
    );

    return path.join(directory, comparisonFileName);
}

function writeComparison(comparisonPath, comparison) {
    const content = JSON.stringify(
        comparison,
        null,
        2
    );

    fs.writeFileSync(
        comparisonPath,
        content,
        'utf8'
    );
}

function main() {
    const baselinePath = process.argv[2];
    const currentPath = process.argv[3];

    if (!baselinePath || !currentPath) {
        throw new Error(
            'Usage: node analyzer/compareReports.js ' +
            '<baseline-summary> <current-summary>'
        );
    }

    const baseline = readSummary(
        baselinePath
    );

    const current = readSummary(
        currentPath
    );

    validateSummaries(
        baseline,
        current
    );

    const comparison = buildComparison(
        baselinePath,
        currentPath,
        baseline,
        current
    );

    const regressions =
        collectRegressions(
            comparison
        );

    comparison.regressions =
        regressions;

    comparison.summary =
        buildComparisonSummary(
            comparison,
            regressions
        );

    const comparisonPath =
        getComparisonPath(
            currentPath
        );

    writeComparison(
        comparisonPath,
        comparison
    );

    console.log(
        `Comparison report written to: ${comparisonPath}`
    );
    if (regressions.length > 0) {
        process.exitCode = 1;
    } else {
        process.exitCode = 0;
    }
}

try {
    main();
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}