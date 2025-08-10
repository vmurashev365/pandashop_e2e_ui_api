Feature: Product Details UI Components
  As a user
  I want to interact with product detail components
  So that I can view comprehensive product information

  Background:
    Given I am on a product details page
    And product information is loaded
    And all components are properly initialized

  @ui @product-details @image-gallery @safe
  Scenario: Product image gallery functionality
    Given product has multiple images
    When I interact with image gallery
    Then main image should display clearly
    And thumbnail navigation should work
    And image zoom functionality should be available
    And image transitions should be smooth

  @ui @product-details @price-display @safe
  Scenario: Price and currency display
    Given product has pricing information
    When price components are rendered
    Then price should be displayed in MDL currency
    And any discounts should be clearly marked
    And price formatting should be consistent
    And currency symbols should be correct

  @ui @product-details @description @safe
  Scenario: Product description components
    Given product has description content
    When description section is displayed
    Then text should be readable and well-formatted
    And long descriptions should be truncated appropriately
    And expand/collapse functionality should work
    And text should be properly encoded

  @ui @product-details @specifications @safe
  Scenario: Product specifications display
    Given product has technical specifications
    When specifications section is rendered
    Then specs should be organized in readable format
    And technical details should be accurate
    And specification tables should be responsive
    And data should be properly structured

  @ui @product-details @availability @safe
  Scenario: Availability status components
    Given product has availability information
    When availability is displayed
    Then stock status should be clearly indicated
    And availability colors should follow conventions
    And stock levels should be communicated clearly
    And out-of-stock states should be handled

  @ui @product-details @add-to-cart @safe
  Scenario: Add to cart component (safe mode)
    Given add to cart functionality is available
    When I interact with add to cart button
    Then button states should change appropriately
    And quantity selectors should work correctly
    And visual feedback should be provided
    But no real orders should be created

  @ui @product-details @quantity-selector @safe
  Scenario: Quantity selection components
    Given quantity selector is available
    When I adjust product quantity
    Then quantity should increment/decrement correctly
    And input validation should work
    And minimum/maximum limits should be enforced
    And invalid quantities should be prevented

  @ui @product-details @breadcrumbs @safe
  Scenario: Navigation breadcrumbs
    Given breadcrumb navigation is present
    When I view breadcrumb trail
    Then navigation path should be clear
    And breadcrumb links should be functional
    And current page should be indicated
    And breadcrumbs should be responsive

  @ui @product-details @related-products @safe
  Scenario: Related products section
    Given related products are displayed
    When related products section loads
    Then relevant products should be shown
    And product cards should match catalog style
    And navigation to related products should work
    And section should load independently

  @ui @product-details @responsive @safe
  Scenario: Product details responsive behavior
    Given product details on different screen sizes
    When viewport size changes
    Then layout should adapt appropriately
    And all information should remain accessible
    And images should scale correctly
    And text should remain readable
