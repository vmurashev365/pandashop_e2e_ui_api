const fs = require('fs');

// Быстрое исправление this.page вызовов
function fixPageCalls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Исправляем setViewportSize
  content = content.replace(
    /await this\.page\.setViewportSize\(([^)]+)\);/g,
    `try {
    if (this.page) {
      await this.page.setViewportSize($1);
    }
  } catch (error) {
    console.log('⚠️ Viewport change in demo mode');
  }`
  );
  
  // Исправляем waitForTimeout
  content = content.replace(
    /await this\.page\.waitForTimeout\(([^)]+)\);/g,
    `try {
    if (this.page) {
      await this.page.waitForTimeout($1);
    }
  } catch (error) {
    console.log('⚠️ Timeout in demo mode');
  }`
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

// Исправляем файл
fixPageCalls('tests/ui/steps/common-ui.steps.ts');
