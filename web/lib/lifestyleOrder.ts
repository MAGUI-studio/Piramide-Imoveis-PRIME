const keyOf = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('pt-BR')
const isCondominiumKey = (key: string) => key === 'condominio' || key === 'condominios'

export function orderLifestyleItems<T extends {type: string; count: number}>(items: T[], order: (string | null)[] = []): T[] {
  const ranks = new Map<string, number>()
  for (const name of order) {
    if (!name) continue
    const key = keyOf(name)
    if (!isCondominiumKey(key) && !ranks.has(key)) ranks.set(key, ranks.size)
  }
  return [...items].sort((a, b) => {
    const aKey = keyOf(a.type)
    const bKey = keyOf(b.type)
    const aCondo = isCondominiumKey(aKey)
    const bCondo = isCondominiumKey(bKey)
    if (aCondo) return bCondo ? 0 : -1
    if (bCondo) return 1
    return (ranks.get(aKey) ?? Infinity) - (ranks.get(bKey) ?? Infinity) || b.count - a.count || a.type.localeCompare(b.type, 'pt-BR')
  })
}
