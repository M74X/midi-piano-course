export function getNoteColor(midi: number): string {
  if (midi < 48) return '#4f46e5'   // C2-B2: índigo
  if (midi < 60) return '#7c3aed'   // C3-B3: violeta
  if (midi < 72) return '#a855f7'   // C4-B4: púrpura
  if (midi < 84) return '#ec4899'   // C5-B5: rosa
  return '#22d3ee'                   // C6+: cian
}
