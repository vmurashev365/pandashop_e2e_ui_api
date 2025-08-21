const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to replace for Phase 2
const replacements = [
  // Products interface fixes
  { from: /response\.products/g, to: 'response.data' },
  { from: /productsResponse\.products/g, to: 'productsResponse.data' },
  { from: /lastPageResponse\.products/g, to: 'lastPageResponse.data' },
  
  // Result interface fixes  
  { from: /result\.products/g, to: 'result.data' },
  
  // Security response fixes
  { from: /Array\.isArray\(result\.products\)/g, to: 'Array.isArray(result.data)' },
  { from: /expect\(result\.products\)/g, to: 'expect(result.data)' },
  { from: /if \(result\.products/g, to: 'if (result.data' },
  
  // Performance timeout fixes - reduce timeout for problematic tests
  { from: /timeout.*30000/g, to: 'timeout: 15000' },
];

// Files to process
const testFiles = glob.sync('tests/api/**/*.spec.ts', { 
  cwd: process.cwd(),
  ignore: ['**/dry-api-tests.spec.ts', '**/realistic-*.spec.ts'] // Skip working files
});

let totalReplacements = 0;

testFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;
    
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        fileReplacements += matches.length;
      }
    });
    
    if (fileReplacements > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath}: ${fileReplacements} replacements`);
      totalReplacements += fileReplacements;
    }
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎯 Phase 2 Complete: ${totalReplacements} total replacements across ${testFiles.length} files`);
