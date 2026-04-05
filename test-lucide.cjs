import * as Lucide from 'lucide-react';
const icons = ['ArrowUpRight', 'Github', 'Linkedin', 'Mail', 'ArrowRight', 'Code2', 'Cpu', 'Globe', 'Cube'];
for (const icon of icons) {
  console.log(icon, !!Lucide[icon]);
}
