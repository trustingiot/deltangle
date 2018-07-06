class Deltangle {
	constructor(obj) {
		this.maia = new MAIA(obj)
		this.iota = this.maia.iota
	}

	async get(hash, callback) {
		if (isNode()) {
			let result = await promisify(this.iota.api.getBundle.bind(this.iota.api))(hash)
			let content = await this.extractContent(result)
			return content

		} else {
			// TODO promisify browser execution
			this.iota.api.getBundle(hash, async (error, bundle) => {
				if (error) {
					return error

				} else {
					let result = await this.extractContent(bundle)
					if (typeof callback === 'function') {
						return callback(result)
					}
					return undefined
				}
			})
		}
	}

	async post(content, previous = null, callback) {
		if (previous != null) {
			let previousContent = await this.get(previous)
			content = jsdiff.createPatch('', previousContent, content, '', '', { context: 1 })
		}
		let message = {content: content, previous: previous}
		let trytes = this.iota.utils.toTrytes(JSON.stringify(message))
		let tokens = trytes.match(/.{1,2187}/g)
		let transfers = []
		for (var i = 0; i < tokens.length; i++) {
			transfers.push({address: MAIA.keyGen(), value: 0, message: tokens[i]})
		}

		if (isNode()) {
			let result = await promisify(this.iota.api.sendTransfer.bind(this.iota.api))('', this.maia.depth, this.maia.mwm, transfers)
			return result[0].hash

		} else {
			// TODO promisify browser execution
			this.iota.api.sendTransfer('', this.depth, this.mwm, transfers, callback)
		}
	}

	async setVersion(hash, seed = MAIA.keyGen()) {
		let maia = MAIA.generateMAIA(seed)
		let view = await this.maia.get(maia)
		let payload = {
			data: {
				file: hash
			}
		}
		let message = await this.maia.post(payload, seed)
		if (view == null) {
			view = await this.maia.createView(maia, 'file')
			payload = {data: {view: view}}
			await this.maia.post(payload, seed)
		}
		return {seed: seed, view: view}
	}

	async getVersion(hash) {
		let ref = await this.maia.readView(hash)
		let result = await this.get(ref)
		return result
	}

	async extractContent(bundle) {
		let message = this.iota.utils.extractJson(bundle)
		if (message != null) {
			message = JSON.parse(message)
			if (message.content !== undefined) {
				if (message.previous != null) {
					let result = await this.get(message.previous)
					return jsdiff.applyPatch(result, message.content)
				}
				return message.content
			}
		}
		return undefined
	}
}

function isNode() {
	return (typeof window === 'undefined')
}

// Backend
if (isNode()) {
	var {promisify} = require('util')
	var IOTA = require('iota.lib.js')
	var MAIA = require('../lib/maia.js').MAIA
	var jsdiff = require('diff')

	exports.IOTA = IOTA
	exports.Deltangle = Deltangle

// Frontend
} else {
	// TODO Frontend
}
