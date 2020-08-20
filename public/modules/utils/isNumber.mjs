export default function isNumber (value) {
	const decimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
	const thousandsFormatRegExp = /\B(?=(\d{3})+(?!\d))/g;

	return typeof value === 'number' || 
		typeof value === 'string' && Number.isFinite(Number(value.replace(/[,?]/g, '')));
}
