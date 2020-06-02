/**
 * *****************************************************************************
 * 
 * constants
 *
 * *****************************************************************************
 */


export const RES_HEADERS = Symbol.for('context#response_headers'); // respond header
export const RES_BODY = Symbol('context#body');
export const REQ_IP = Symbol('context#ip');

export const EMPTY_CODE = [
	204, // no content
	205, // reset content
	304, // not modified
];

export const RETRY_CODE = [
	502, 
	503, 
	504
];

export const REDIRECT_CODE = [
	300, 
	301, 
	302, 
	303, 
	305, 
	307, 
	308
];
