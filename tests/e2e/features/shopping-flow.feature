Feature: Safe Shopping Flow E2E
  As a customer
  I want to browse and shop products safely
  So that I can complete purchasing journey without creating real orders

  Background:
    Given I am on Pandashop.md homepage
    And all popups are handled safely
    And I am in safe testing mode preventing real orders

  @e2e @smoke @safe
  Scenario: Browse catalog to product details safely
    When I browse the product catalog
    And I click on a product from the catalog
    Then I should see product details page
    And product information should be displayed correctly
    And I should see price in MDL currency
    And no real order process should be initiated

  @e2e @critical @safe
  Scenario: Add product to cart safely (no checkout)
    Given I am viewing a product details page
    When I add the product to cart
    Then cart should show updated quantity
    And cart total should be calculated correctly
    And I should see cart icon with items count
    But I should NOT be able to complete real purchase

  @e2e @navigation @safe
  Scenario: Navigate through categories safely
    When I click on different product categories
    Then each category should display relevant products
    And category filters should work correctly
    And page navigation should be smooth
    And no purchase forms should be submitted

  @e2e @search @safe
  Scenario: Search for products safely
    When I use the search functionality
    And I enter "phone" as search term
    Then I should see relevant search results
    And search results should contain phones
    And I can browse search results safely
    But no purchase actions should be triggered

  @e2e @responsive @safe
  Scenario: Test responsive design safely
    Given I am testing on different screen sizes
    When I view the site on mobile viewport
    Then mobile navigation should work correctly
    And product grids should adapt properly
    And cart functionality should remain accessible
    And all interactions should remain safe

  @e2e @cart @safe
  Scenario: Cart management without checkout
    Given I have products in my cart
    When I modify cart quantities
    And I remove items from cart
    Then cart should update correctly
    And total price should recalculate
    And empty cart message should appear when empty
    But checkout button should be disabled or hidden

  @e2e @multilang @safe
  Scenario: Language switching safely
    When I switch between Romanian and Russian languages
    Then page content should change language
    And product names should be translated
    And navigation should work in both languages
    And safe testing mode should be maintained

  @e2e @performance @safe
  Scenario: Page load performance verification
    When I navigate between different pages
    Then each page should load within 3 seconds
    And images should load progressively
    And no JavaScript errors should occur
    And memory usage should remain reasonable
