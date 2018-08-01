class Deltangle {

	constructor(obj) {
		this.maia = new Deltangle.MAIACLASS(obj)
		this.iota = this.maia.iota
	}

	async get(hash, message = null) {
		let promise = (h) => new Promise((resolve) => this.iota.api.getBundle(h, (a, b) => resolve(b)))
		let result = await promise(hash)
		let content = await this.extractContent(result)
		if (content == undefined) {
			let result = await this.getVersion(hash, message)
			content = result
		}
		return content
	}

	async post(content, previous = null) {
		this.iota.api.getNodeInfo((err, sucess) => {
			if(err) {
				console.log("\nApi not working; Connect to a different host using the flag --provider.")
				process.exit()
			}
		})
		if (previous != null) {
			let previousContent = await this.get(previous)
			content = JsDiff.createPatch('', previousContent, content, '', '', { context: 1 })
		}
		let message = {content: content, previous: previous}
		let trytes = this.iota.utils.toTrytes(JSON.stringify(message))
		let tokens = trytes.match(/.{1,2187}/g)
		let transfers = []
		for (var i = 0; i < tokens.length; i++) {
			transfers.push({address: Deltangle.MAIACLASS.keyGen(), value: 0, message: tokens[i]})
		}

		let promise = (t) => new Promise((resolve) => this.iota.api.sendTransfer('', this.maia.depth, this.maia.mwm, t, (a, b) => resolve(b)))
		let result = await promise(transfers)
		return result[0].hash
	}

	async setVersion(hash, message, seed = Deltangle.MAIACLASS.keyGen()) {
		let maia = Deltangle.MAIACLASS.generateMAIA(seed)
		let view = await this.maia.get(maia)
		let payload = await this.stack(hash, message, view)
		let result = await this.maia.post(payload, seed)
		if (view == null) {
			view = await this.maia.createView(maia, 'file')
			payload = {data: {view: view}}
			await this.maia.post(payload, seed)
		} else {
			view = view.data.view
		}
		return {seed: seed, view: view}
	}

	async stack(hash, message, view) {
		let element = { hash: hash,	message: message }
		let content = undefined
		let stack = undefined
		let previous = null
		if (view != null) {
			previous = await this.maia.readView(view.data.view)
			content = await this.get(previous)
			stack = JSON.parse(content)
			stack.unshift(element)
			content = JSON.stringify(stack)
		} else {
			stack = [element]
			content = JSON.stringify(stack)
		}
		hash = await this.post(content, previous)
		return { data: { file: hash } }
	}

	async getVersion(hash, message = null) {
		let ref = await this.maia.readView(hash)
		let result = await this.get(ref)
		let stack = JSON.parse(result)
		if (message == '*') {
			return stack
		} else if (message == null) {
			result = await this.get(stack[0].hash)
			return result
		} else {
			let element = stack.find(function(item) {
				return item.message == message;
			})
			if (element !== undefined) {
				element = await this.get(element.hash)
			}
			return element
		}
		return stack
	}

	async extractContent(bundle) {
		let message = this.iota.utils.extractJson(bundle)
		if (message != null) {
			message = JSON.parse(message)
			if (message.content !== undefined) {
				if (message.previous != null) {
					let result = await this.get(message.previous)
					return JsDiff.applyPatch(result, message.content)
				}
				return message.content
			}
		}

		return undefined
	}

	// TODO fix this
	static get MAIACLASS() {
		if (isNode()) {
			return MAIANODE
		} else {
			return MAIA
		}
	}
}

function isNode() {
	return (typeof window === 'undefined')
}

// Backend
if (isNode()) {
	var IOTA = require('iota.lib.js')
	var MAIANODE = require('./maia.js').MAIA
	var JsDiff = require('diff')

	exports.IOTA = IOTA
	exports.Deltangle = Deltangle

// Frontend
} else {
	window.Deltangle = Deltangle
}
