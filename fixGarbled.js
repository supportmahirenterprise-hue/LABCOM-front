const fs = require('fs');
const filePath = 'app/customer-analysis/page.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('dY-,? Top High-Volume State Hubs', 'Top High-Volume State Hubs');
content = content.replace('dY-? {s.name}', '{s.name}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed garbled text');
