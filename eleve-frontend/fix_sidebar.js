const fs = require('fs');
let content = fs.readFileSync('src/components/admin/Sidebar.jsx', 'utf8');

// Replace classes for Dark Mode
content = content.replace(/!bg-white/g, '!bg-slate-900');
content = content.replace(/!border-teal-100/g, '!border-slate-800');
content = content.replace(/border-teal-100/g, 'border-slate-800');
content = content.replace(/border-teal-200/g, 'border-slate-700');
content = content.replace(/border-white/g, 'border-slate-700');

content = content.replace(/bg-teal-50/g, 'bg-slate-800');
content = content.replace(/bg-teal-100/g, 'bg-slate-700');
content = content.replace(/from-teal-500 to-teal-600/g, 'from-cyan-600 to-cyan-700');
content = content.replace(/from-teal-50 to-teal-100/g, 'from-slate-800 to-slate-700');

content = content.replace(/text-teal-800/g, 'text-slate-100');
content = content.replace(/text-teal-600/g, 'text-slate-300');
content = content.replace(/text-teal-500/g, 'text-slate-400');
content = content.replace(/text-teal-700/g, 'text-slate-200');

content = content.replace(/hover:text-teal-700/g, 'hover:text-cyan-400');
content = content.replace(/hover:bg-teal-100/g, 'hover:bg-slate-700');

content = content.replace(/rgba\(8, 151, 156, 0.1\)/g, 'rgba(19, 194, 194, 0.15)');

fs.writeFileSync('src/components/admin/Sidebar.jsx', content);
console.log('Sidebar.jsx updated!');
