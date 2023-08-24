/**
 * *****************************************************************************
 *
 * error middleware
 *
 * *****************************************************************************
 */

import { HttpError } from '../HttpError.mjs';

export const error = () => async function errorMiddleware (ctx, next) {
  try {
    await next();
  } catch (err) {
    return Promise.reject(new HttpError(err));
  }
} 
