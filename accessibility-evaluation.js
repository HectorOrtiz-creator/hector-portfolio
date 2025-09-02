/**
 * Accessibility Evaluation Framework
 * Integrates WAVE analysis and provides comprehensive reporting
 * 
 * @author Hector Ortiz
 * @version 1.0.0
 */

class AccessibilityEvaluator {
    constructor() {
        this.waveResults = null;
        this.accessibilityScore = 0;
        this.issues = {
            errors: [],
            warnings: [],
            alerts: [],
            features: []
        };
        this.metrics = {
            totalIssues: 0,
            errors: 0,
            warnings: 0,
            alerts: 0,
            features: 0,
            score: 0
        };
    }

    /**
     * Initialize WAVE evaluation
     */
    async initializeWave() {
        console.log('🔍 Initializing WAVE accessibility evaluation...');
        
        // Check if WAVE extension is available
        if (typeof wave !== 'undefined') {
            return this.runWaveAnalysis();
        } else {
            console.warn('⚠️ WAVE extension not detected. Using fallback evaluation.');
            return this.runFallbackEvaluation();
        }
    }

    /**
     * Run WAVE analysis if extension is available
     */
    async runWaveAnalysis() {
        try {
            // Trigger WAVE analysis
            if (wave && wave.analyze) {
                wave.analyze();
                
                // Wait for results
                await this.waitForWaveResults();
                
                // Parse WAVE results
                this.parseWaveResults();
                
                return true;
            }
        } catch (error) {
            console.error('❌ Error running WAVE analysis:', error);
            return false;
        }
    }

    /**
     * Wait for WAVE results to be available
     */
    async waitForWaveResults() {
        return new Promise((resolve) => {
            const checkResults = () => {
                // Check if WAVE results are available in DOM
                const waveResults = document.querySelector('[data-wave-id]') || 
                                   document.querySelector('.wave-results') ||
                                   document.querySelector('[class*="wave"]');
                
                if (waveResults) {
                    resolve();
                } else {
                    setTimeout(checkResults, 500);
                }
            };
            
            checkResults();
        });
    }

    /**
     * Parse WAVE analysis results
     */
    parseWaveResults() {
        try {
            // Extract WAVE results from DOM
            const waveElements = document.querySelectorAll('[data-wave-id], .wave-results, [class*="wave"]');
            
            waveElements.forEach(element => {
                const issueType = this.determineIssueType(element);
                const description = this.extractDescription(element);
                const elementInfo = this.extractElementInfo(element);
                
                if (issueType && description) {
                    this.issues[issueType].push({
                        description,
                        element: elementInfo,
                        severity: this.getSeverity(issueType),
                        timestamp: new Date().toISOString()
                    });
                }
            });
            
            this.calculateMetrics();
            
        } catch (error) {
            console.error('❌ Error parsing WAVE results:', error);
        }
    }

    /**
     * Fallback accessibility evaluation
     */
    runFallbackEvaluation() {
        console.log('🔄 Running comprehensive fallback accessibility evaluation...');
        
        this.evaluatePageStructure();
        this.evaluateNavigation();
        this.evaluateForms();
        this.evaluateImages();
        this.evaluateColorContrast();
        this.evaluateKeyboardNavigation();
        this.evaluateScreenReader();
        
        this.calculateMetrics();
        return true;
    }

    /**
     * Evaluate page structure and semantic HTML
     */
    evaluatePageStructure() {
        console.log('📋 Evaluating page structure...');
        
        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level - previousLevel > 1) {
                this.issues.errors.push({
                    description: `Heading hierarchy skipped: ${previousLevel} → ${level}`,
                    element: { tag: heading.tagName, text: heading.textContent?.substring(0, 50) },
                    severity: 'high',
                    timestamp: new Date().toISOString()
                });
            }
            
            previousLevel = level;
        });

        // Check for landmark elements
        const landmarks = ['nav', 'header', 'main', 'footer', 'aside'];
        landmarks.forEach(landmark => {
            const elements = document.querySelectorAll(landmark);
            if (elements.length === 0) {
                this.issues.warnings.push({
                    description: `Missing landmark element: <${landmark}>`,
                    element: { tag: 'body', text: 'Page structure' },
                    severity: 'medium',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Evaluate navigation accessibility
     */
    evaluateNavigation() {
        console.log('🧭 Evaluating navigation accessibility...');
        
        // Check for skip links
        const skipLinks = document.querySelectorAll('a[href^="#"], a[href^="#main"], a[href^="#content"]');
        if (skipLinks.length === 0) {
            this.issues.warnings.push({
                description: 'Missing skip navigation links',
                element: { tag: 'nav', text: 'Navigation' },
                severity: 'medium',
                timestamp: new Date().toISOString()
            });
        }

        // Check navigation ARIA labels
        const navs = document.querySelectorAll('nav');
        navs.forEach((nav, index) => {
            const ariaLabel = nav.getAttribute('aria-label');
            const ariaLabelledby = nav.getAttribute('aria-labelledby');
            
            if (!ariaLabel && !ariaLabelledby) {
                this.issues.warnings.push({
                    description: `Navigation element ${index + 1} missing ARIA label`,
                    element: { tag: 'nav', text: nav.textContent?.substring(0, 50) },
                    severity: 'medium',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Evaluate form accessibility
     */
    evaluateForms() {
        console.log('📝 Evaluating form accessibility...');
        
        const forms = document.querySelectorAll('form');
        forms.forEach((form, formIndex) => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach((input, inputIndex) => {
                const id = input.getAttribute('id');
                const name = input.getAttribute('name');
                const type = input.getAttribute('type');
                
                // Check for proper labels
                if (id) {
                    const label = document.querySelector(`label[for="${id}"]`);
                    if (!label) {
                        this.issues.errors.push({
                            description: `Input missing associated label: ${type || 'input'}`,
                            element: { tag: input.tagName, id, name },
                            severity: 'high',
                            timestamp: new Date().toISOString()
                        });
                    }
                } else if (type !== 'hidden') {
                    this.issues.warnings.push({
                        description: `Input missing ID attribute: ${type || 'input'}`,
                        element: { tag: input.tagName, name },
                        severity: 'medium',
                        timestamp: new Date().toISOString()
                    });
                }

                // Check for required field indicators
                if (input.hasAttribute('required')) {
                    const ariaRequired = input.getAttribute('aria-required');
                    if (ariaRequired !== 'true') {
                        this.issues.warnings.push({
                            description: `Required input missing aria-required attribute`,
                            element: { tag: input.tagName, id, name },
                            severity: 'medium',
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            });
        });
    }

    /**
     * Evaluate image accessibility
     */
    evaluateImages() {
        console.log('🖼️ Evaluating image accessibility...');
        
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            const alt = img.getAttribute('alt');
            const src = img.getAttribute('src');
            
            // Check for alt text
            if (!alt && !img.hasAttribute('role') && !img.hasAttribute('aria-label')) {
                this.issues.errors.push({
                    description: `Image missing alt text: ${src?.substring(0, 30)}`,
                    element: { tag: 'img', src, index },
                    severity: 'high',
                    timestamp: new Date().toISOString()
                });
            }

            // Check for decorative images
            if (alt === '' && !img.hasAttribute('role')) {
                this.issues.warnings.push({
                    description: `Decorative image should have role="presentation"`,
                    element: { tag: 'img', src, index },
                    severity: 'low',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Evaluate color contrast (basic check)
     */
    evaluateColorContrast() {
        console.log('🎨 Evaluating color contrast...');
        
        // This is a basic check - full contrast analysis requires specialized tools
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            // Basic contrast check (simplified)
            if (color && backgroundColor) {
                // This is a placeholder - actual contrast calculation would be more complex
                this.issues.warnings.push({
                    description: 'Color contrast should be verified with specialized tools',
                    element: { tag: element.tagName, text: element.textContent?.substring(0, 30) },
                    severity: 'low',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Evaluate keyboard navigation
     */
    evaluateKeyboardNavigation() {
        console.log('⌨️ Evaluating keyboard navigation...');
        
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
        
        interactiveElements.forEach(element => {
            const tabindex = element.getAttribute('tabindex');
            
            // Check for logical tab order
            if (tabindex && parseInt(tabindex) > 0) {
                this.issues.warnings.push({
                    description: `Positive tabindex may disrupt natural tab order: ${tabindex}`,
                    element: { tag: element.tagName, text: element.textContent?.substring(0, 30) },
                    severity: 'medium',
                    timestamp: new Date().toISOString()
                });
            }

            // Check for focus indicators
            const hasFocusStyles = element.style.outline || 
                                  element.style.border || 
                                  element.getAttribute('class')?.includes('focus');
            
            if (!hasFocusStyles) {
                this.issues.warnings.push({
                    description: 'Interactive element missing visible focus indicator',
                    element: { tag: element.tagName, text: element.textContent?.substring(0, 30) },
                    severity: 'medium',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Evaluate screen reader compatibility
     */
    evaluateScreenReader() {
        console.log('🔊 Evaluating screen reader compatibility...');
        
        // Check for ARIA attributes
        const elementsWithAria = document.querySelectorAll('[aria-*]');
        elementsWithAria.forEach(element => {
            const ariaAttributes = Array.from(element.attributes)
                .filter(attr => attr.name.startsWith('aria-'));
            
            ariaAttributes.forEach(attr => {
                // Validate common ARIA patterns
                if (attr.name === 'aria-label' && !attr.value.trim()) {
                    this.issues.errors.push({
                        description: 'ARIA label attribute has empty value',
                        element: { tag: element.tagName, text: element.textContent?.substring(0, 30) },
                        severity: 'high',
                        timestamp: new Date().toISOString()
                    });
                }
            });
        });

        // Check for live regions
        const liveRegions = document.querySelectorAll('[aria-live]');
        if (liveRegions.length === 0) {
            this.issues.warnings.push({
                description: 'No live regions defined for dynamic content',
                element: { tag: 'body', text: 'Page content' },
                severity: 'low',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Determine issue type from WAVE element
     */
    determineIssueType(element) {
        const className = element.className || '';
        const textContent = element.textContent || '';
        
        if (className.includes('error') || textContent.includes('Error')) return 'errors';
        if (className.includes('warning') || textContent.includes('Warning')) return 'warnings';
        if (className.includes('alert') || textContent.includes('Alert')) return 'alerts';
        if (className.includes('feature') || textContent.includes('Feature')) return 'features';
        
        return null;
    }

    /**
     * Extract description from WAVE element
     */
    extractDescription(element) {
        return element.textContent?.trim() || element.getAttribute('title') || 'Unknown issue';
    }

    /**
     * Extract element information
     */
    extractElementInfo(element) {
        return {
            tag: element.tagName,
            id: element.getAttribute('id'),
            class: element.getAttribute('class'),
            text: element.textContent?.substring(0, 50)
        };
    }

    /**
     * Get severity level
     */
    getSeverity(issueType) {
        const severityMap = {
            errors: 'high',
            warnings: 'medium',
            alerts: 'low',
            features: 'info'
        };
        return severityMap[issueType] || 'medium';
    }

    /**
     * Calculate accessibility metrics
     */
    calculateMetrics() {
        this.metrics.errors = this.issues.errors.length;
        this.metrics.warnings = this.issues.warnings.length;
        this.metrics.alerts = this.issues.alerts.length;
        this.metrics.features = this.issues.features.length;
        this.metrics.totalIssues = this.metrics.errors + this.metrics.warnings + this.metrics.alerts;
        
        // Calculate accessibility score (0-100)
        const maxIssues = 50; // Arbitrary baseline
        const issuePenalty = Math.min(this.metrics.totalIssues * 2, 80);
        this.metrics.score = Math.max(100 - issuePenalty, 0);
        
        this.accessibilityScore = this.metrics.score;
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            metrics: this.metrics,
            issues: this.issues,
            recommendations: this.generateRecommendations(),
            summary: this.generateSummary()
        };
        
        return report;
    }

    /**
     * Generate accessibility recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.errors > 0) {
            recommendations.push({
                priority: 'Critical',
                action: 'Fix all accessibility errors immediately',
                impact: 'High impact on user experience'
            });
        }
        
        if (this.metrics.warnings > 0) {
            recommendations.push({
                priority: 'Important',
                action: 'Address accessibility warnings',
                impact: 'Medium impact on user experience'
            });
        }
        
        if (this.metrics.score < 80) {
            recommendations.push({
                priority: 'Enhancement',
                action: 'Improve overall accessibility score',
                impact: 'Better user experience for all users'
            });
        }
        
        return recommendations;
    }

    /**
     * Generate executive summary
     */
    generateSummary() {
        const score = this.metrics.score;
        let status, description;
        
        if (score >= 90) {
            status = 'Excellent';
            description = 'Website meets high accessibility standards';
        } else if (score >= 80) {
            status = 'Good';
            description = 'Website has good accessibility with minor issues';
        } else if (score >= 70) {
            status = 'Fair';
            description = 'Website has moderate accessibility issues';
        } else if (score >= 60) {
            status = 'Poor';
            description = 'Website has significant accessibility issues';
        } else {
            status = 'Critical';
            description = 'Website has severe accessibility issues requiring immediate attention';
        }
        
        return { status, description, score };
    }

    /**
     * Export report to various formats
     */
    exportReport(format = 'json') {
        const report = this.generateReport();
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'csv':
                return this.exportToCSV(report);
            case 'html':
                return this.exportToHTML(report);
            default:
                return report;
        }
    }

    /**
     * Export to CSV format
     */
    exportToCSV(report) {
        let csv = 'Issue Type,Description,Element,Severity,Timestamp\n';
        
        Object.keys(report.issues).forEach(type => {
            report.issues[type].forEach(issue => {
                csv += `${type},${issue.description},${issue.element.tag},${issue.severity},${issue.timestamp}\n`;
            });
        });
        
        return csv;
    }

    /**
     * Export to HTML format
     */
    exportToHTML(report) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Accessibility Report - ${report.url}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; }
                    .issue { margin: 5px 0; padding: 5px; border-left: 3px solid #ccc; }
                    .error { border-left-color: #ff0000; }
                    .warning { border-left-color: #ffa500; }
                    .alert { border-left-color: #ffff00; }
                </style>
            </head>
            <body>
                <h1>Accessibility Report</h1>
                <p><strong>URL:</strong> ${report.url}</p>
                <p><strong>Score:</strong> ${report.metrics.score}/100</p>
                <p><strong>Status:</strong> ${report.summary.status}</p>
                <p><strong>Description:</strong> ${report.summary.description}</p>
                
                <h2>Metrics</h2>
                <div class="metric">
                    <strong>Total Issues:</strong> ${report.metrics.totalIssues}<br>
                    <strong>Errors:</strong> ${report.metrics.errors}<br>
                    <strong>Warnings:</strong> ${report.metrics.warnings}<br>
                    <strong>Alerts:</strong> ${report.metrics.alerts}
                </div>
                
                <h2>Issues</h2>
                ${Object.keys(report.issues).map(type => `
                    <h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                    ${report.issues[type].map(issue => `
                        <div class="issue ${type}">
                            <strong>${issue.description}</strong><br>
                            Element: ${issue.element.tag}<br>
                            Severity: ${issue.severity}
                        </div>
                    `).join('')}
                `).join('')}
            </body>
            </html>
        `;
    }
}

// Initialize accessibility evaluator
const accessibilityEvaluator = new AccessibilityEvaluator();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityEvaluator;
} else {
    window.AccessibilityEvaluator = AccessibilityEvaluator;
}

console.log('✅ Accessibility Evaluation Framework loaded successfully!');
console.log('🔍 Run accessibilityEvaluator.initializeWave() to start evaluation');
