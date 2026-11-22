export function cnpjValido(value: string): boolean {
  if (!/^\d{14}$/.test(value) || /^(\d)\1+$/.test(value)) return false
  const digit = (base: string) => {
    let weight = base.length - 7
    let sum = 0
    for (const char of base) {
      sum += Number(char) * weight--
      if (weight < 2) weight = 9
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  return digit(value.slice(0, 12)) === Number(value[12]) &&
    digit(value.slice(0, 13)) === Number(value[13])
}
