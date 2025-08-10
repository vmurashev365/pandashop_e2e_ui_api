Feature: Navigation UI Components
  As a user
  I want to use navigation components effectively
  So that I can move through the site easily

  Background:
    Given I am on Pandashop.md website
    And navigation components are loaded
    And GitHub-enhanced navigation patterns are active

  @ui @navigation @header @safe
  Scenario: Header navigation component
    Given main header navigation is displayed
    When I view the header
    Then logo should be visible and clickable
    And main navigation menu should be accessible
    And language switcher should be functional
    And cart icon should be present

  @ui @navigation @language-switch @safe
  Scenario: Language switching components
    Given language switcher is available
    When I use language switching functionality
    Then Romanian (#hypRo) option should work
    And Russian (#hypRu) option should work
    And active language should be highlighted
    And page content should update appropriately

  @ui @navigation @main-menu @safe
  Scenario: Main navigation menu
    Given main navigation menu exists
    When I interact with navigation menu
    Then menu items should be clearly labeled
    And hover effects should work appropriately
    And dropdown menus should function correctly
    And menu should be keyboard accessible

  @ui @navigation @breadcrumbs @safe
  Scenario: Breadcrumb navigation components
    Given breadcrumb navigation is present
    When I navigate through different pages
    Then breadcrumb trail should update correctly
    And each breadcrumb link should be functional
    And current page should be indicated clearly
    And breadcrumbs should show proper hierarchy

  @ui @navigation @footer @safe
  Scenario: Footer navigation component
    Given page footer contains navigation
    When I scroll to footer
    Then footer links should be organized properly
    And all footer links should be functional
    And contact information should be displayed
    And footer should be responsive

  @ui @navigation @mobile @safe
  Scenario: Mobile navigation behavior
    Given navigation on mobile viewport
    When viewing on mobile screen size
    Then mobile menu should be accessible
    And hamburger menu should work correctly
    And mobile navigation should be touch-friendly
    And all navigation should remain functional

  @ui @navigation @search @safe
  Scenario: Search navigation component
    Given search functionality is integrated in navigation
    When I use search from navigation
    Then search input should be easily accessible
    And search suggestions should appear
    And search results navigation should work
    And search state should be maintained

  @ui @navigation @responsive @safe
  Scenario: Navigation responsive behavior
    Given navigation components on different screen sizes
    When screen size changes
    Then navigation should adapt appropriately
    And all navigation elements should remain accessible
    And navigation hierarchy should be maintained
    And user experience should be consistent
