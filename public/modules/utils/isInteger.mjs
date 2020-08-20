export default function isInteger (value) {
	//const integerStringRegExp = /^-?(0|[1-9][0-9]*)$/;
  return typeof value === 'number' && 
		Number.isFinite(value) && 
		Math.floor(value) === value;
}
