Feature: Pandashop Product Catalog API - Complete Coverage
  As an e-commerce system
  I want to access Pandashop.md product catalog
  So that I can provide product information to customers

  Background:
    Given Pandashop.md API is available and responsive
    And API client is properly configured

  @smoke @critical
  Scenario: Health check verification
    When I perform API health check
    Then health status should be "healthy"
    And response time should be less than 3000 milliseconds
    And timestamp should be valid ISO format

  @products @core
  Scenario: Retrieve product catalog
    When I request product list with limit 5
    Then I should receive 5 or fewer products
    And each product should have valid structure:
      | field        | type   | required |
      | id           | string | yes      |
      | name         | string | yes      |
      | price        | number | yes      |
      | currency     | string | yes      |
      | availability | string | yes      |
      | category     | string | no       |
      | brand        | string | no       |
      | url          | string | no       |
    And all prices should be greater than 0
    And all currencies should be "MDL"

  @products @pagination
  Scenario: Product pagination functionality
    When I request products with page 1 and limit 3
    Then pagination should show page 1
    And pagination should show limit 3
    And pagination should have valid total count
    When I request products with page 2 and limit 3
    Then pagination should show page 2
    And total count should remain consistent

  @search @filtering
  Scenario: Product search functionality
    Given I have search criteria:
      | query | limit |
      | test  | 5     |
    When I perform product search
    Then I should receive relevant search results
    And all products should contain search term in name or ID
    And results should not exceed 5 products

  @search @price-filtering
  Scenario: Price range filtering
    Given I have price range criteria:
      | minPrice | maxPrice | limit |
      | 100      | 500      | 10    |
    When I perform filtered product search
    Then all returned products should have price between 100 and 500 MDL
    And results should not exceed 10 products

  @search @availability-filtering  
  Scenario: Availability filtering
    Given I want products with availability "available"
    When I search products with availability filter
    Then all returned products should have availability "available"
    And I should receive at least 1 product

  @products @individual
  Scenario: Retrieve individual product details
    Given I have a valid product ID from catalog
    When I request product details by ID
    Then I should receive complete product information
    And product ID should match requested ID
    And product should have valid price and currency
    And product URL should be properly formatted

  @products @error-handling
  Scenario: Handle non-existent product ID
    Given I have a non-existent product ID "invalid-product-12345"
    When I request product details by ID
    Then I should receive null response
    And no error should be thrown

  @categories @structure
  Scenario: Retrieve product categories
    When I request available categories
    Then I should receive categories list
    And categories should include common e-commerce types:
      | category    |
      | electronics |
      | clothing    |
      | home-garden |
    And all categories should be non-empty strings

  @cart @basic
  Scenario: Cart operations functionality
    When I request current cart
    Then cart should be empty initially
    And cart total should be 0
    And cart currency should be "MDL"
    When I add product "test-product" with quantity 2 to cart
    Then add operation should succeed
    And product ID should be recorded as "test-product"
    And quantity should be recorded as 2

  @performance @response-time
  Scenario: API response time requirements
    When I measure API operation times:
      | operation    | maxTime |
      | healthCheck  | 3000    |
      | getProducts  | 5000    |
      | searchProd   | 4000    |
      | getCateg     | 2000    |
      | cartOps      | 1000    |
    Then all operations should complete within time limits
    And average response time should be acceptable

  @reliability @concurrent
  Scenario: Concurrent API access
    When I perform 5 concurrent health checks
    Then all health checks should succeed
    And total time should be less than 10 seconds
    When I perform 3 concurrent product requests
    Then all product requests should return valid data
    And no conflicts should occur

  @security @input-validation
  Scenario: Input validation and sanitization
    Given I have potentially malicious inputs:
      | input                           | type        |
      | <script>alert('xss')</script>   | xss         |
      | '; DROP TABLE products; --      | sql_inject  |
      | ../../../../etc/passwd          | path_trav   |
      | javascript:alert('evil')        | js_inject   |
    When I search products with malicious input
    Then system should handle input safely
    And no script execution should occur
    And no system information should be exposed

  @boundary @limits
  Scenario: Boundary value testing
    Given I test boundary values:
      | parameter | value    | expected     |
      | limit     | 0        | handle_safe  |
      | limit     | -1       | handle_safe  |
      | limit     | 1000000  | handle_safe  |
      | page      | 0        | handle_safe  |
      | page      | -1       | handle_safe  |
      | page      | 999999   | handle_safe  |
    When I request products with boundary values
    Then system should handle all cases gracefully
    And no system errors should occur

  @integration @end-to-end
  Scenario: Complete user shopping flow simulation
    Given I start with API health verification
    When I browse available product categories
    And I search for products in "electronics" category
    And I view details of first search result
    And I add selected product to cart
    And I verify cart contents
    Then complete flow should work seamlessly
    And all data should be consistent throughout
    And total time should be under 30 seconds

  @data-integrity @consistency
  Scenario: Data consistency verification
    When I retrieve same product list twice
    Then both responses should have identical structure
    And product IDs should be consistent
    And total counts should match
    When I retrieve individual products from list
    Then individual product data should match list data
    And no data corruption should occur

  @error-recovery @resilience
  Scenario: Error recovery and resilience
    Given API client encounters potential issues
    When I simulate network delays and retries
    And I handle timeout scenarios
    And I test rapid successive requests
    Then system should maintain stability
    And error messages should be user-friendly
    And no system crashes should occur

  @baseline @performance-benchmark
  Scenario: Establish performance baselines
    When I measure comprehensive API performance:
      | metric           | target     |
      | health_check_avg | < 2000ms   |
      | product_list_avg | < 4000ms   |
      | search_avg       | < 3000ms   |
      | category_avg     | < 1500ms   |
      | individual_prod  | < 2500ms   |
    Then all metrics should meet targets
    And baselines should be established for monitoring
    And performance should be consistent across runs
