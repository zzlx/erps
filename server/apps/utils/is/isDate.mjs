/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

export function isDate (v) {
  if (v instanceof Date) return true

  return (
    typeof v.toDateString === 'function' &&
    typeof v.getDate === 'function' &&
    typeof v.setDate === 'function'
  )
}
