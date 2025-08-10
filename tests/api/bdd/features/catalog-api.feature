Feature: Product Catalog API
  As a system user
  I want to access the product catalog API
  So that I can retrieve product information through API

  Background:
    Given Pandashop.md API is available
    And request headers contain "Content-Type: application/json"

  Scenario: Getting list of products
    When I send GET request to "/api/v1/products"
    Then response status should be 200
    And response body contains products list
    And each product contains required fields:
      | field        | type   |
      | id           | string |
      | name         | string |
      | price        | number |
      | currency     | string |
      | availability | string |
    And response time does not exceed 2000 ms

  Scenario: Getting product by ID
    Given product with ID "test-product-123" exists
    When I send GET request to "/api/v1/products/test-product-123"
    Then response status should be 200
    And response body contains product with ID "test-product-123"
    And product contains complete information:
      | field       | required |
      | id          | yes         |
      | name        | yes         |
      | description | yes         |
      | price       | yes         |
      | images      | yes         |
      | category    | yes         |
    And response time does not exceed 1000 ms

  Scenario: Getting non-existent product
    When I send GET request to "/api/v1/products/non-existent-id"
    Then response status should be 404
    And response body contains error message
    And header "Content-Type" contains "application/json"

  Scenario: Searching products by query
    When I send GET request to "/api/v1/products/search" with parameters:
      | parameter | value   |
      | query     | phone   |
      | page      | 1       |
      | limit     | 20      |
    Then response status should be 200
    And response body contains search results
    And found products contain word "phone" in name or description
    And result count does not exceed 20
    And response time does not exceed 3000 ms

  Scenario: Search with empty results
    When I send GET request to "/api/v1/products/search" with parameters:
      | parameter | value               |
      | query     | nonexistentitem123  |
    Then response status should be 200
    And response body contains empty products list
    And total result count equals 0

  Scenario: Filter products by category
    Given category "Electronics" with ID "electronics-123" exists
    When I send GET request to "/api/v1/products" with parameters:
      | parameter  | value           |
      | categoryId | electronics-123 |
    Then response status should be 200
    And all products in response belong to category "electronics-123"

  Scenario: Filter products by price
    When I send GET request to "/api/v1/products" with parameters:
      | parameter | value |
      | priceMin  | 100   |
      | priceMax  | 500   |
    Then response status should be 200
    And all products in response have price between 100 and 500 MDL

  Scenario Outline: Product pagination
    When I send GET request to "/api/v1/products" with parameters:
      | parameter | value  |
      | page      | <page> |
      | limit     | <limit>|
    Then response status should be 200
    And response contains pagination information:
      | field      | value  |
      | page       | <page> |
      | limit      | <limit>|
      | total      | >= 0   |
      | totalPages | >= 1   |
    And product count does not exceed <limit>

    Examples:
      | page | limit |
      | 1    | 10    |
      | 2    | 20    |
      | 1    | 50    |

  Scenario: Validation of incorrect pagination parameters
    When I send GET request to "/api/v1/products" with parameters:
      | parameter | value |
      | page      | 0     |
    Then response status should be 400
    And response body contains validation error message

  Scenario: Getting product categories
    When I send GET request to "/api/v1/categories"
    Then response status should be 200
    And response body contains categories list
    And each category contains fields:
      | field | type   |
      | id    | string |
      | name  | string |
    And response time does not exceed 1000 ms

  Scenario: Check API availability
    When I send GET request to "/api/v1/health"
    Then response status should be 200
    And response body contains:
      | field     | value   |
      | status    | healthy |
      | timestamp | present |
    And response time does not exceed 500 ms

  Scenario: Check CORS headers
    When I send OPTIONS request to "/api/v1/products"
    Then response status should be 200
    And response headers contain:
      | header                      | value                      |
      | Access-Control-Allow-Origin | *                          |
      | Access-Control-Allow-Methods| GET, POST, PUT, DELETE     |

  Scenario: Handle Rate Limiting
    Given I have sent more than 100 requests in the last minute
    When I send GET request to "/api/v1/products"
    Then response status should be 429
    And response headers contain:
      | header                | present |
      | X-RateLimit-Limit     | yes     |
      | X-RateLimit-Remaining | yes     |
      | Retry-After           | yes     |
