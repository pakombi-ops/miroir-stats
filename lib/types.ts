export interface Criteria {
  genre: string
  ageMin: number
  ageMax: number
  age: number              // ← pour "Je suis"
  revenuMin: number
  revenu: number           // ← pour "Je suis"
  revenuType: 'mensuel' | 'annuel'
  zone: string
  ethnie: string
  dejaMarie: string
  tailleMin: number
  taille: number           // ← pour "Je suis"
  tailleUnit: 'cm' | 'pieds'
  obesite: string
  enfants: string          // ← nouveau
  religion: string         // ← nouveau
  cheveuxCouleur: string
  yeuxCouleur: string
}

export interface AnalysisResult {
  percentage: number
  count: string
  reasoning: string
  confidence: 'faible' | 'moyen' | 'élevé'
}

export interface ComparisonResult {
  ratio: number
  verdictLevel: string
  verdictTitle: string
  verdictDesc: string
  color: string
}

export function getDefaultCriteria(): Criteria {
  return {
    genre: 'Tous',
    ageMin: 18,
    ageMax: 80,
    age: 30,
    revenuMin: 0,
    revenu: 0,
    revenuType: 'mensuel',
    zone: 'Monde entier',
    ethnie: 'Toutes',
    dejaMarie: 'Peu importe',
    tailleMin: 0,
    taille: 170,
    tailleUnit: 'cm',
    obesite: 'Peu importe',
    enfants: 'Peu importe',
    religion: 'Toutes',
    cheveuxCouleur: 'Toutes',
    yeuxCouleur: 'Toutes',
  }
}

export function getActiveCriteria(criteria: Criteria): string[] {
  const def = getDefaultCriteria()
  const active: string[] = []
  if (criteria.genre !== def.genre) active.push(`- Genre : ${criteria.genre}`)
  if (criteria.ageMin !== def.ageMin || criteria.ageMax !== def.ageMax)
    active.push(`- Âge : ${criteria.ageMin} - ${criteria.ageMax} ans`)
  if (criteria.age !== def.age) active.push(`- Âge : ${criteria.age} ans`)
  if (criteria.revenuMin > 0)
    active.push(`- Revenu min : ${criteria.revenuMin.toLocaleString()} € / ${criteria.revenuType === 'mensuel' ? 'mois' : 'an'}`)
  if (criteria.revenu > 0)
    active.push(`- Revenu : ${criteria.revenu.toLocaleString()} € / ${criteria.revenuType === 'mensuel' ? 'mois' : 'an'}`)
  if (criteria.zone !== def.zone) active.push(`- Zone : ${criteria.zone}`)
  if (criteria.ethnie !== def.ethnie) active.push(`- Origine : ${criteria.ethnie}`)
  if (criteria.dejaMarie !== def.dejaMarie) active.push(`- Marital : ${criteria.dejaMarie}`)
  if (criteria.tailleMin > 0) active.push(`- Taille min : ${criteria.tailleMin} ${criteria.tailleUnit}`)
  if (criteria.taille !== def.taille) active.push(`- Taille : ${criteria.taille} cm`)
  if (criteria.obesite !== def.obesite) active.push(`- Obésité : ${criteria.obesite}`)
  if (criteria.enfants !== def.enfants) active.push(`- Enfants : ${criteria.enfants}`)
  if (criteria.religion !== def.religion) active.push(`- Religion : ${criteria.religion}`)
  if (criteria.cheveuxCouleur !== def.cheveuxCouleur) active.push(`- Cheveux : ${criteria.cheveuxCouleur}`)
  if (criteria.yeuxCouleur !== def.yeuxCouleur) active.push(`- Yeux : ${criteria.yeuxCouleur}`)
  return active
}

export function formatPercentage(n: number): string {
  if (n >= 10) return n.toFixed(1)
  if (n >= 1) return n.toFixed(2)
  if (n >= 0.01) return n.toFixed(3)
  if (n >= 0.0001) return n.toFixed(5)
  return n.toExponential(2)
}

export function getComparisonVerdict(searchPct: number, selfPct: number): ComparisonResult {
  const ratio = searchPct > 0 ? selfPct / searchPct : 999
  if (ratio <= 0.5) return { ratio, verdictLevel: 'calibre', verdictTitle: 'Standards calibrés', verdictDesc: "Tu cherches quelqu'un plus commun que toi.", color: '#22c55e' }
  if (ratio <= 2) return { ratio, verdictLevel: 'raisonnable', verdictTitle: 'Standards raisonnables', verdictDesc: "Tu cherches quelqu'un d'un profil similaire au tien.", color: '#84cc16' }
  if (ratio <= 10) return { ratio, verdictLevel: 'eleve', verdictTitle: 'Standards légèrement élevés', verdictDesc: "Tu cherches quelqu'un un peu plus rare que toi.", color: '#f59e0b' }
  if (ratio <= 100) return { ratio, verdictLevel: 'tres_eleve', verdictTitle: 'Standards élevés', verdictDesc: "Tu cherches quelqu'un significativement plus rare que toi.", color: '#f97316' }
  if (ratio <= 10000) return { ratio, verdictLevel: 'extreme', verdictTitle: 'Standards très élevés', verdictDesc: "L'écart est très important. Rencontre quasi improbable.", color: '#ef4444' }
  return { ratio, verdictLevel: 'extreme', verdictTitle: 'Standards hors normes', verdictDesc: "Ce que tu cherches est des milliers de fois plus rare que toi.", color: '#dc2626' }
}