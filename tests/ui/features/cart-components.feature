Feature: Shopping Cart UI Components
  As a user
  I want to interact with cart UI components
  So that I can manage my selected products safely

  Background:
    Given I have access to cart functionality
    And cart components are properly loaded
    And safe testing mode prevents real purchases

  @ui @cart @icon @safe
  Scenario: Cart icon component
    Given cart icon is displayed in header
    When I view the cart icon
    Then cart item count should be visible
    And icon should be clickable
    And GitHub selector (.cartIco.ico) should work
    And icon state should update with cart changes

  @ui @cart @dropdown @safe
  Scenario: Cart dropdown preview
    Given cart icon has dropdown functionality
    When I hover over or click cart icon
    Then cart preview should appear
    And mini cart should show items
    And quick actions should be available
    And dropdown should close appropriately

  @ui @cart @item-display @safe
  Scenario: Cart item display components
    Given cart contains products
    When cart items are displayed
    Then each item should show product information
    And item images should be displayed correctly
    And quantities should be editable
    And individual prices should be shown

  @ui @cart @quantity-controls @safe
  Scenario: Cart quantity control components
    Given cart items have quantity controls
    When I adjust item quantities
    Then quantity inputs should respond correctly
    And increase/decrease buttons should work
    And quantity validation should occur
    And total prices should update automatically

  @ui @cart @item-removal @safe
  Scenario: Remove item functionality
    Given cart contains removable items
    When I use remove item controls
    Then remove buttons should be clearly marked
    And confirmation dialogs should appear if needed
    And items should be removed smoothly
    And cart should update automatically

  @ui @cart @total-calculation @safe
  Scenario: Cart total calculation display
    Given cart has items with various prices
    When cart totals are calculated
    Then subtotal should be displayed correctly
    And currency should be shown as MDL
    And total formatting should be consistent
    And calculations should update in real-time

  @ui @cart @empty-state @safe
  Scenario: Empty cart state components
    Given cart is empty
    When empty cart state is displayed
    Then appropriate empty message should appear
    And call-to-action buttons should be present
    And user should be guided to add products
    And empty state should be visually appealing

  @ui @cart @checkout-prevention @safe
  Scenario: Checkout button safety measures
    Given cart has items and checkout button exists
    When I attempt to access checkout functionality
    Then checkout should be disabled or hidden
    And safety message should be displayed
    And no real purchase process should begin
    And user should understand testing limitations

  @ui @cart @persistent-state @safe
  Scenario: Cart state persistence
    Given cart has items across page navigation
    When I navigate between pages
    Then cart state should persist
    And item count should remain accurate
    And cart contents should be maintained
    And cart icon should show consistent state

  @ui @cart @responsive @safe
  Scenario: Cart responsive behavior
    Given cart components on different screen sizes
    When viewport changes
    Then cart dropdown should adapt appropriately
    And cart page layout should be responsive
    And all cart controls should remain accessible
    And text and buttons should remain usable
