const fs = require('fs');
const file = 'src/datos/proyectos.ts';
let data = fs.readFileSync(file, 'utf8');

const replacement = `    link: '/engineering/aetheria'
  },
  {
    id: 'hub-social',
    title: 'Nexus Social',
    description: 'Red de juego masiva, servidores dedicados y emparejamiento.',
    tech: ['Prisma', 'Supabase', 'Serverless'],
    color: '#ff00ff',
    position: [0, 15, 0] as [number, number, number],
    link: '/social'
  }
];`;

data = data.replace(/link:\s?'\/engineering\/aetheria'\r?\n\s*}\r?\n];/g, replacement);

fs.writeFileSync(file, data);
console.log("Success");
