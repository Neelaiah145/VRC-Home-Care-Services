const fs = require('fs');
const content = fs.readFileSync('palliative-care.html', 'utf8');

const matches = content.match(/<section[^>]*class=\"[^\"]*\"[^>]*>[\s\S]*?<\/section>/g);
console.log('Sections in palliative-care.html:');
if (matches) {
  matches.forEach((s, i) => {
    const cls = s.match(/class=\"([^\"]*)\"/);
    const h2 = s.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    console.log(`Sec ${i}: class=${cls ? cls[1] : 'none'}, h2=${h2 ? h2[1].replace(/\s+/g, ' ').trim() : 'none'}`);
  });
}
