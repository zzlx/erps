/**
 * *****************************************************************************
 *
 * Date and time
 *
 * iso8601-utc:   YYYY-MM-DDTHH:mm:ss.sssZ
 * iso8601-local: YYYY-MM-DDTHH:mm:ss.sss+0800
 *
 * 最新标准:
 * [ISO 8601-1:2019](https://www.iso.org/obp/ui/#iso:std:iso:8601:-1:ed-1:v1:en)
 *
 * @return {string} locale iso string
 * *****************************************************************************
 */

export function dateToISOString (date) {
  const d = date ? new Date(date) : new Date(); 
	const tzOffset = (d.getTimezoneOffset())/60;
	const timestamp = d.valueOf() - tzOffset * 3600000;
	const trail = `+0${Math.abs(tzOffset)}00`; // @todo: 需要优化
  return new Date(timestamp).toISOString().replace(/Z$/g, trail)
}
