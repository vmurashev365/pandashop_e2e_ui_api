Feature: Cross-Browser E2E Testing
  As a quality assurance engineer
  I want to ensure the application works across different browsers
  So that all users have consistent experience

  Background:
    Given the application is tested across multiple browsers
    And safety measures are in place to prevent real orders
    And popup handling is configured for all browsers

  @e2e @cross-browser @chrome @safe
  Scenario: Chrome browser compatibility
    Given I am using Chrome browser
    When I perform basic shopping flow
    Then all features should work correctly
    And performance should meet standards
    And no Chrome-specific errors should occur

  @e2e @cross-browser @firefox @safe
  Scenario: Firefox browser compatibility
    Given I am using Firefox browser
    When I perform basic shopping flow
    Then all features should work correctly
    And performance should be acceptable
    And no Firefox-specific errors should occur

  @e2e @cross-browser @edge @safe
  Scenario: Edge browser compatibility
    Given I am using Edge browser
    When I perform basic shopping flow
    Then all features should work correctly
    And performance should be acceptable
    And no Edge-specific errors should occur

  @e2e @accessibility @safe
  Scenario: Accessibility compliance verification
    Given I am testing with accessibility tools
    When I navigate through the application
    Then keyboard navigation should work
    And screen reader compatibility should be maintained
    And color contrast should meet standards
    And ARIA labels should be present where needed

  @e2e @mobile @safe
  Scenario: Mobile device compatibility
    Given I am testing on mobile viewport
    When I interact with touch gestures
    Then mobile navigation should be responsive
    And touch targets should be appropriately sized
    And mobile-specific features should work
    And performance should remain acceptable

  @e2e @tablet @safe
  Scenario: Tablet device compatibility
    Given I am testing on tablet viewport
    When I use both touch and mouse interactions
    Then interface should adapt to tablet size
    And both input methods should work correctly
    And layout should be optimized for tablet viewing
