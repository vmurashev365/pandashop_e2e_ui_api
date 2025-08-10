Feature: Product Catalog UI Components
  As a user
  I want to interact with catalog UI components
  So that I can browse products effectively

  Background:
    Given I am on the product catalog page
    And catalog components are loaded correctly
    And GitHub-enhanced selectors are available

  @ui @catalog @grid @safe
  Scenario: Product grid display verification
    When product grid is rendered
    Then products should be displayed in grid layout
    And each product card should show essential information
    And product images should load correctly
    And grid should be responsive across screen sizes

  @ui @catalog @product-card @safe
  Scenario: Product card component functionality
    Given product cards are displayed in catalog
    When I hover over a product card
    Then hover effects should be visible
    And additional product information should appear
    And card should remain clickable
    And animations should be smooth

  @ui @catalog @filtering @safe
  Scenario: Category filter components
    Given category filters are available
    When I click on different category filters
    Then filter UI should update correctly
    And active filter should be highlighted
    And product grid should update accordingly
    And filter state should be maintained

  @ui @catalog @sorting @safe
  Scenario: Product sorting functionality
    Given sorting options are available
    When I select different sorting criteria
    Then sort dropdown should show selected option
    And products should reorder correctly
    And sort state should persist during navigation
    And loading indicators should appear during reordering

  @ui @catalog @pagination @safe
  Scenario: Pagination components
    Given catalog has multiple pages of products
    When I navigate through pagination
    Then page numbers should update correctly
    And current page should be highlighted
    And previous/next buttons should work appropriately
    And page state should be maintained

  @ui @catalog @search @safe
  Scenario: Catalog search interface
    Given search functionality is available
    When I use the search input field
    Then search suggestions should appear
    And search results should update in real-time
    And search history should be accessible
    And clear search button should work

  @ui @catalog @responsive @safe
  Scenario: Responsive catalog behavior
    Given catalog is viewed on different screen sizes
    When screen size changes
    Then grid layout should adapt appropriately
    And navigation should remain accessible
    And text should remain readable
    And images should scale correctly

  @ui @catalog @loading @safe
  Scenario: Loading states for catalog
    Given catalog data is being loaded
    When loading process is active
    Then loading skeletons should be displayed
    And progress indicators should be visible
    And user should understand loading state
    And interface should not appear broken

  @ui @catalog @github-selectors @safe
  Scenario: GitHub-enhanced selector verification
    Given catalog uses GitHub repository selectors
    When I verify enhanced selectors
    Then .digi-product--desktop elements should be accessible
    And language switch (#hypRu, #hypRo) should work
    And cart icon (.cartIco.ico) should be functional
    And all GitHub patterns should be implemented correctly

  @ui @catalog @error-states @safe
  Scenario: Catalog error state handling
    Given catalog encounters display errors
    When error conditions occur
    Then appropriate error messages should be shown
    And retry mechanisms should be available
    And fallback content should be displayed
    And user should be guided to resolve issues
