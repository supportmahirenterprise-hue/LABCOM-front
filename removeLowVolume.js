const fs = require('fs');
const filePath = 'app/customer-analysis/page.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split(/\r?\n/);

let startIndex = lines.findIndex(l => l.includes('{/* Low Volume / Emerging Regions */}'));
let endIndex = lines.findIndex(l => l.includes('{/* Top State Hubs */}'));

if (startIndex !== -1 && endIndex !== -1) {
    // Remove lines from startIndex to endIndex - 1
    lines.splice(startIndex, endIndex - startIndex);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Removed from ${startIndex} to ${endIndex - 1}`);
} else {
    console.log('Could not find the block boundaries.');
}
