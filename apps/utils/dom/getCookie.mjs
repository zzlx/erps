/**
 * *****************************************************************************
 *
 * Get cookie value from docuemnt.cookie
 *
 * *****************************************************************************
 */

export const cookie = name => 
  `; ${document.cookie}`.split(`; ${name}=`).pop().split(';').shift();
