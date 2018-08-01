/**
 * Deltangle Proof of Concept
 */
let Deltangle = require('../../dist/deltangle.js').Deltangle
let fs = require('fs')

// TODO Set configuration
let provider = 'https://iotanode.be:443'
let mwm = 14
let channelLayers = 1
let channelDepth = 20

let doTest = true

let instance = new Deltangle({provider: provider, mwm: mwm, channelLayers: channelLayers, channelDepth: channelDepth})

async function test() {

	// Post file
	console.debug('Post f1')
	var f1 = fs.readFileSync('versions/v1.txt', 'ascii')
	var hash1 = await instance.post(f1)
	console.debug('Done')

	// Update file
	console.debug('Update f1')
	var f2 = fs.readFileSync('versions/v2.txt', 'ascii')
	var hash2 = await instance.post(f2, hash1)
	console.debug('Done')

	let result = await instance.get(hash2)
	if (result.localeCompare(f2) != 0) {
		console.error('Updated fail: ' + result + ' != ' + f2)
		return
	}

	// Create version
	console.debug('Creating version using f1')
	var ref = await instance.setVersion(hash1, 'version 1')
	let version = await instance.getVersion(ref.view)
	console.debug('Done')

	if (version.localeCompare(f1) != 0) {
		console.error('Aborted execution: ' + version + ' != ' + f1)
		return
	}

	console.debug('Updating version using f2')
	await instance.setVersion(hash2, 'version 2', ref.seed)
	version = await instance.getVersion(ref.view)
	console.debug('Done')

	if (version.localeCompare(f2) != 0) {
		console.error('Aborted execution: ' + version + ' != ' + f2)
		return
	}

	console.debug('Everything is fine')
}

async function execute() {
	if (doTest) await test()
}

execute()
