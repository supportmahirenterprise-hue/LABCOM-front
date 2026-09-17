const fs = require('fs');
const filePath = 'app/customer-analysis/page.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('<span>?? ${s.name}</span>', '<span>dY-? {s.name}</span>');
content = content.replace('${s.count} Orders', '{s.count} Orders');
content = content.replace('??? Top High-Volume State Hubs', 'dY-,? Top High-Volume State Hubs');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax');
