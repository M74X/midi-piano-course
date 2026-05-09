export interface Exercise {
  name: string;
  description: string;
  notes: number[];
  tip: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  color: string;
  exercises: Exercise[];
}

export const scales = {
  C_MAJOR: [60, 62, 64, 65, 67, 69, 71, 72],
  G_MAJOR: [55, 57, 59, 60, 62, 64, 66, 67],
  D_MAJOR: [50, 52, 54, 55, 57, 59, 61, 62],
};

export const exercises = {
  scales: [
    { name: 'Do Mayor (C)', notes: [60, 62, 64, 65, 67, 69, 71, 72], tip: 'Do-Re-Mi-Fa-Sol-La-Si-Do' },
  ],
  chords: [
    { name: 'Do Mayor', notes: [60, 64, 67], tip: 'Presiona las 3 notas simultáneamente' },
  ],
};

export const lessons: Lesson[] = [
  {
    id: 1,
    title: '🎵 Introducción al Teclado',
    description: 'Aprende la ubicación de las notas y cómo leer el teclado',
    difficulty: 'Principiante',
    color: 'bg-blue-500',
    exercises: [
      {
        name: 'Notas Blancas - Centro',
        description: 'Encuentra las notas Do (C) en el teclado',
        notes: [60, 72, 48],
        tip: 'Las teclas Do están siempre entre dos teclas negras',
      },
      {
        name: 'Escala de Do Mayor',
        description: 'Toca la escala ascendente: Do Re Mi Fa Sol La Si Do',
        notes: [60, 62, 64, 65, 67, 69, 71, 72],
        tip: 'Mantén un ritmo constante, usa metrónomo a 60 BPM',
      },
    ],
  },
  {
    id: 2,
    title: '🎼 Escalas Básicas',
    description: 'Practica las escalas más importantes para desarrollar técnica',
    difficulty: 'Principiante',
    color: 'bg-green-500',
    exercises: [
      {
        name: 'Escala de Do Mayor - Ambas Manos',
        description: 'Toca la escala ascendente y descendente',
        notes: [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60],
        tip: 'Comienza lentamente, aumenta velocidad gradualmente',
      },
      {
        name: 'Escala de Sol Mayor',
        description: 'Toca Sol La Si Do Re Mi Fa# Sol',
        notes: [55, 57, 59, 60, 62, 64, 66, 67],
        tip: 'Sol Mayor tiene un Fa# natural',
      },
      {
        name: 'Escala de Re Mayor',
        description: 'Toca Re Mi Fa# Sol La Si Do# Re',
        notes: [50, 52, 54, 55, 57, 59, 61, 62],
        tip: 'Re Mayor tiene dos sostenidos: Fa# y Do#',
      },
    ],
  },
  {
    id: 3,
    title: '🎹 Acordes Básicos',
    description: 'Aprende los acordes fundamentales para acompañar canciones',
    difficulty: 'Principiante',
    color: 'bg-purple-500',
    exercises: [
      {
        name: 'Acorde de Do Mayor (C)',
        description: 'Presiona las notas C-E-G simultáneamente',
        notes: [60, 64, 67],
        tip: 'Todos los dedos juntos, presión uniforme',
      },
      {
        name: 'Acorde de Fa Mayor (F)',
        description: 'Presiona las notas F-A-C simultáneamente',
        notes: [53, 57, 60],
        tip: 'Fa Mayor es un acorde muy usado en pop y rock',
      },
      {
        name: 'Acorde de Sol Mayor (G)',
        description: 'Presiona las notas G-B-D simultáneamente',
        notes: [55, 59, 62],
        tip: 'Sol Mayor frecuentemente tiene un Re menor como debajo (G7)',
      },
    ],
  },
  {
    id: 4,
    title: '🎶 Patrones Rítmicos',
    description: 'Desarrolla tu sentido del ritmo con patrones básicos',
    difficulty: 'Intermedio',
    color: 'bg-orange-500',
    exercises: [
      {
        name: 'Ritmo Cuarto - Metrónomo',
        description: 'Toca una nota por pulso, en sincronía con el metrónomo',
        notes: [60, 60, 60, 60],
        tip: 'Activa el metrónomo a 80 BPM en tu DAW',
      },
      {
        name: 'Patrón 1-2-3-1',
        description: 'Alterna entre notas graves y agudas',
        notes: [48, 60, 64, 60],
        tip: 'Usa la mano derecha para las notas agudas',
      },
      {
        name: 'Arpegio Ascendente',
        description: 'Toca las notas del acorde una por una, ascendiendo',
        notes: [60, 64, 67, 72],
        tip: 'Los arpegios son la base de mucha música',
      },
    ],
  },
  {
    id: 5,
    title: '🎸 Progresiones de Acordes',
    description: 'Aprende progresiones clásicas que se usan en miles de canciones',
    difficulty: 'Intermedio',
    color: 'bg-red-500',
    exercises: [
      {
        name: 'Progresión I-IV-V-I (C-F-G-C)',
        description: 'La progresión más básica y universal',
        notes: [60, 64, 67, 53, 57, 60, 55, 59, 62, 60, 64, 67],
        tip: 'Esta progresión aparece en miles de canciones pop',
      },
      {
        name: 'Progresión I-V-vi-IV (C-G-Am-F)',
        description: 'La progresión más popular en música moderna',
        notes: [60, 64, 67, 55, 59, 62, 57, 60, 53, 55, 57, 60],
        tip: 'Conocida como la progresión "pop punk" o "four chord song"',
      },
      {
        name: 'Blues de 12 compases (simplificado)',
        description: 'El blues básico en Do',
        notes: [60, 65, 67, 60, 65, 67, 67, 65, 60, 67, 60, 55],
        tip: 'El blues es la base del rock, jazz y mucha música moderna',
      },
    ],
  },
  {
    id: 6,
    title: '🌟 Técnicas Avanzadas',
    description: 'Explora técnicas de nivel superior para expandir tu estilo',
    difficulty: 'Avanzado',
    color: 'bg-yellow-500',
    exercises: [
      {
        name: 'Staccato vs Legato',
        description: 'Practica notas cortas vs notas conectadas',
        notes: [60, 62, 64, 65, 67, 69, 71, 72],
        tip: 'Staccato: golpe corto, Legato: conecta las notas',
      },
      {
        name: 'Escala Cromática',
        description: 'Todas las notas del teclado consecutivamente',
        notes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72],
        tip: 'La escala cromática usa todas las teclas, blancas y negras',
      },
      {
        name: 'Escalas Menores (La menor natural)',
        description: 'La escala menor más común',
        notes: [57, 59, 60, 62, 64, 65, 67, 69],
        tip: 'La menor tiene un sonido más melancólico que Do Mayor',
      },
    ],
  },
];