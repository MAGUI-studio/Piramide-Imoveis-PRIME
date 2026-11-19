const keyOf = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('pt-BR')

export function orderLifestyleItems<T extends {type: string; count: number}>(items: T[], order: (string | null)[] = []): T[] {
  const ranks = new Map<string, number>()
  for (const name of order) {
    if (!name) continue
    const key = keyOf(name)
    if (key !== 'condominio' && !ranks.has(key)) ranks.set(key, ranks.size)
  }
  return [...items].sort((a, b) => {
    const aKey = keyOf(a.type)
    const bKey = keyOf(b.type)
    if (aKey === 'condominio') return bKey === 'condominio' ? 0 : -1
    if (bKey === 'condominio') return 1
    return (ranks.get(aKey) ?? Infinity) - (ranks.get(bKey) ?? Infinity) || b.count - a.count || a.type.localeCompare(b.type, 'pt-BR')
  })
}
