/**
 * *****************************************************************************
 * 
 * constants
 *
 * *****************************************************************************
 */


export const EMPTY_CODE = [
	204, // no content
	205, // reset content
	304, // not modified
];

export const RETRY_CODE = [
	502, // BAD_GATEWAY
	503, // SERVICE_UNAVAILABLE
	504, // GATEWAY_TIMEOUT
];

export const REDIRECT_CODE = [
	300,  // MULTIPLE_CHOICES 
	301,  // MOVED_PERMANENTLY
	302,  // FOUND
	303,  // SEE_OTHER
	305,  // USE_PROXY
	307,  // TEMPORARY_REDIRECT
	308,  // PERMANENT_REDIRECT
];
