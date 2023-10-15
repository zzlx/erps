/**
 * *****************************************************************************
 *
 * Mime types
 *
 * *****************************************************************************
 */

import path from 'path';
import { paths } from '../settings/paths.mjs';
import { readJSON } from './readJSON.mjs';

const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/
const TEXT_TYPE_REGEXP = /^text\//i
const EXTNAME_REGEXP = /(?:\.\w*)$/
const dbJSON = path.join(paths.SRC, 'json', 'mime-types.json');
const db = readJSON(dbJSON);

export class MimeTypes {
	constructor () {
		this.extensions = Object.create(null)
		this.types = Object.create(null)

		this.populateMaps();
	}

	/**
   * Get the default charset for a MIME type.
	 *
	 * @param {string} type
	 * @return {boolean|string}
	 */
	charset (type = '') {
		const match = EXTRACT_TYPE_REGEXP.exec(type)
		const mime = match && db[match[1].toLowerCase()]

		if (mime && mime.charset) {
			return mime.charset
		}

		// default text/* to utf-8
		if (match && TEXT_TYPE_REGEXP.test(match[1])) {
			return 'UTF-8'
		}

		return false

	}

	/**
	 * Create a full Content-Type header given a MIME type or extension.
	 *
	 * @param {string} str
	 * @return {boolean|string}
	 */
	contentType (str) {

		let mime = str.indexOf('/') === -1
			? this.lookup(str)
			: str

		if (!mime) return false;

		// TODO: use content-type or other module
		if (mime.indexOf('charset') === -1) {
			const charset = this.charset(mime)
			if (charset) mime += '; charset=' + charset.toLowerCase()
		}

		return mime
	}

	/**
	 * Get the default extension for a MIME type.
	 *
	 * @param {string} type
	 * @return {boolean|string}
	 */
	extension (type) {
		const match = EXTRACT_TYPE_REGEXP.exec(type)

		// get extensions
		const exts = match && this.extensions[match[1].toLowerCase()]

		if (!exts || !exts.length) {
			return false
		}

		return exts[0]
	}

	/**
	 * Lookup the MIME type for a file path/extension.
	 *
	 * @param {string} path
	 * @return {boolean|string}
	 */
	lookup (path) {
		const extension = EXTNAME_REGEXP.exec('x.' + path)[0].toLowerCase().substr(1);
		if (!extension) return false;
		return this.types[extension] || false;
	}

	/**
	 * Populate the extensions and types maps.
	 * @private
	 */

	populateMaps () {
		// source preference (least -> most)
		const preference = ['nginx', 'apache', undefined, 'iana']

		Object.keys(db).forEach((type) => {
			const mime = db[type]
			const exts = mime.extensions

			if (!exts || !exts.length) return

			// mime -> extensions
			this.extensions[type] = exts

			// extension -> mime
			for (let i = 0; i < exts.length; i++) {
				const extension = exts[i]

				if (this.types[extension]) {
					const from = preference.indexOf(db[this.types[extension]].source)
					const to = preference.indexOf(mime.source)

					if (this.types[extension] !== 'application/octet-stream' &&
						(from > to || (from === to && this.types[extension].substr(0, 12) === 'application/'))) {
						// skip the remapping
						continue
					}
				}

				// set the extension -> mime
				this.types[extension] = type
			}
		});
	}
}
