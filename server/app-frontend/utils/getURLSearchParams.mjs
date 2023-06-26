/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

export const getURLSearchParams = (search) => 
  Object.fromEntries(new URLSearchParams(search))
