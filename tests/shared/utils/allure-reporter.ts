import { test } from '@playwright/test';

/**
 * Allure Reporter Helper for Test Pyramid Framework
 * Provides beautiful reporting utilities for enhanced test documentation
 */
export class AllureReporter {
  
  /**
   * Add epic information to test report
   */
  static epic(name: string) {
    return test.info().annotations.push({
      type: 'epic',
      description: name
    });
  }

  /**
   * Add feature information to test report
   */
  static feature(name: string) {
    return test.info().annotations.push({
      type: 'feature', 
      description: name
    });
  }

  /**
   * Add story information to test report
   */
  static story(name: string) {
    return test.info().annotations.push({
      type: 'story',
      description: name
    });
  }

  /**
   * Add severity level to test report
   */
  static severity(level: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial') {
    return test.info().annotations.push({
      type: 'severity',
      description: level
    });
  }

  /**
   * Add test owner information
   */
  static owner(name: string) {
    return test.info().annotations.push({
      type: 'owner',
      description: name
    });
  }

  /**
   * Add custom tag to test report
   */
  static tag(name: string) {
    return test.info().annotations.push({
      type: 'tag',
      description: name
    });
  }

  /**
   * Add test step description
   */
  static step<T>(name: string, body: () => Promise<T>): Promise<T> {
    return test.step(name, body);
  }

  /**
   * Add attachment to test report
   */
  static async attachment(name: string, content: string | Buffer, type: string = 'text/plain') {
    await test.info().attach(name, { 
      body: content, 
      contentType: type 
    });
  }

  /**
   * Add description to test report
   */
  static description(text: string) {
    return test.info().annotations.push({
      type: 'description',
      description: text
    });
  }

  /**
   * Add test case link
   */
  static testCase(id: string, url?: string) {
    return test.info().annotations.push({
      type: 'testId',
      description: url ? `${id} (${url})` : id
    });
  }

  /**
   * Add issue link
   */
  static issue(id: string, url?: string) {
    return test.info().annotations.push({
      type: 'issue',
      description: url ? `${id} (${url})` : id
    });
  }

  /**
   * Add test execution environment info
   */
  static environment(key: string, value: string) {
    return test.info().annotations.push({
      type: 'environment',
      description: `${key}: ${value}`
    });
  }

  /**
   * Mark test as production safe
   */
  static productionSafe() {
    AllureReporter.tag('production-safe');
    AllureReporter.description('This test is safe to run in production environment - no real orders created');
    return test.info().annotations.push({
      type: 'safety',
      description: 'Production Safe - No real transactions'
    });
  }

  /**
   * Add API performance metrics
   */
  static async apiMetrics(endpoint: string, responseTime: number, statusCode: number) {
    await AllureReporter.attachment(
      `API Metrics - ${endpoint}`,
      JSON.stringify({
        endpoint,
        responseTime: `${responseTime}ms`,
        statusCode,
        timestamp: new Date().toISOString()
      }, null, 2),
      'application/json'
    );
  }

  /**
   * Add browser information
   */
  static browserInfo(browserName: string, version?: string) {
    AllureReporter.environment('Browser', browserName);
    if (version) {
      AllureReporter.environment('Browser Version', version);
    }
  }

  /**
   * Add screenshot with description
   */
  static async screenshot(page: any, name: string, description?: string) {
    const screenshot = await page.screenshot();
    await AllureReporter.attachment(
      name, 
      screenshot, 
      'image/png'
    );
    
    if (description) {
      AllureReporter.description(description);
    }
  }

  /**
   * Add test pyramid level information
   */
  static pyramidLevel(level: 'API' | 'UI' | 'E2E') {
    AllureReporter.epic('Test Pyramid Framework');
    AllureReporter.feature(`${level} Tests`);
    
    const descriptions = {
      'API': '70% of test suite - Fast, reliable business logic validation',
      'UI': '20% of test suite - Component and integration testing',
      'E2E': '10% of test suite - Critical user journey validation'
    };
    
    AllureReporter.tag(`pyramid-${level.toLowerCase()}`);
    AllureReporter.description(descriptions[level]);
  }

  /**
   * Add GitHub integration information
   */
  static githubIntegration() {
    AllureReporter.tag('github-enhanced');
    AllureReporter.description('Enhanced with selectors from vmurashev365/pandashop_md repository');
    AllureReporter.environment('GitHub Repository', 'vmurashev365/pandashop_md');
  }
}

// Export for easy importing
export default AllureReporter;
