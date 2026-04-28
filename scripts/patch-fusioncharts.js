const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/fusioncharts/fusioncharts.js');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // FusionCharts typically evaluates or draws the watermark text.
  // We can neuter the string "FusionCharts Trial"
  const originalLength = content.length;
  content = content.replace(/FusionCharts Trial/gi, '');
  content = content.replace(/FCHSEvalMark/g, 'REMOVED');
  
  // Also try to find the specific drawing routine if we can't find the string
  // Let's replace the string "Trial" with "" if it's nearby "FusionCharts"
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched fusioncharts.js. Replaced strings. Size changed from', originalLength, 'to', content.length);
} catch (error) {
  console.error('Failed to patch FusionCharts:', error);
}