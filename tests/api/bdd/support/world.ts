import { setWorldConstructor, World as CucumberWorld } from '@cucumber/cucumber';

/**
 * World object for Cucumber scenarios
 * Contains shared state and context for test steps
 */
export interface World extends CucumberWorld {
  // HTTP Response data
  response?: any;
  responseTime?: number;
  startTime?: number;
  
  // Test data and context
  testData?: Record<string, any>;
  headers?: Record<string, string>;
  
  // User authentication state
  authToken?: string;
  currentUser?: any;
  
  // Cart and session state
  cartId?: string;
  sessionId?: string;
  
  // Test utilities
  cleanup?: () => Promise<void>;
  debug?: boolean;
}

/**
 * Custom World class implementing the World interface
 */
class CustomWorld implements World {
  // HTTP Response data
  public response?: any;
  public responseTime?: number;
  public startTime?: number;
  
  // Test data and context
  public testData?: Record<string, any>;
  public headers?: Record<string, string>;
  
  // User authentication state
  public authToken?: string;
  public currentUser?: any;
  
  // Cart and session state
  public cartId?: string;
  public sessionId?: string;
  
  // Test utilities
  public cleanup?: () => Promise<void>;
  public debug?: boolean;

  // Cucumber World required properties
  public parameters: any;
  public attach: (data: string | Buffer, mediaType?: string) => void;
  public log: (text: string) => void;

  constructor(options: any) {
    this.parameters = options.parameters;
    this.attach = options.attach;
    this.log = options.log;
    
    // Initialize default values
    this.testData = {};
    this.headers = {};
    this.debug = process.env.DEBUG === 'true';
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    this.headers = { ...this.headers, Authorization: `Bearer ${token}` };
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.authToken = undefined;
    delete this.headers?.Authorization;
  }

  /**
   * Add test data for cleanup
   */
  addCleanupData(key: string, value: any): void {
    if (!this.testData) {
      this.testData = {};
    }
    if (!this.testData.cleanup) {
      this.testData.cleanup = {};
    }
    this.testData.cleanup[key] = value;
  }

  /**
   * Log debug information if debug mode is enabled
   */
  debugLog(message: string, data?: any): void {
    if (this.debug) {
      this.log(`🐛 DEBUG: ${message}`);
      if (data) {
        this.log(JSON.stringify(data, null, 2));
      }
    }
  }

  /**
   * Attach screenshot or other media to the test report
   */
  attachData(data: string | Buffer, mediaType: string = 'text/plain', name?: string): void {
    const attachmentName = name ? `${name} - ` : '';
    this.attach(data, mediaType);
    this.log(`📎 ${attachmentName}Attached ${mediaType}`);
  }

  /**
   * Measure and store response time
   */
  startTimer(): void {
    this.startTime = Date.now();
  }

  /**
   * Calculate and store response time
   */
  stopTimer(): void {
    if (this.startTime) {
      this.responseTime = Date.now() - this.startTime;
      this.debugLog(`Response time: ${this.responseTime}ms`);
    }
  }

  /**
   * Reset state for new scenario
   */
  reset(): void {
    this.response = undefined;
    this.responseTime = undefined;
    this.startTime = undefined;
    this.testData = {};
    this.headers = {};
    this.cartId = undefined;
    this.sessionId = undefined;
  }
}

// Set the custom World constructor for Cucumber
setWorldConstructor(CustomWorld);

export { CustomWorld };
