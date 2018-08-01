/**
 * Deltangle
 */
let Deltangle = require('./lib/deltangle.js').Deltangle
let fs = require('fs')
let arg = require('minimist')(process.argv.slice(2))

const defaultProvider = 'https://iotanode.be:443'
const defaultMWM = 14
const defaultChannelLayers = 1
const defaultChannelDepth = 20

function getInstance() {
	arg.provider = arg.provider || defaultProvider
	arg.mwm = arg.mwm || defaultMWM
	arg.channelLayers = arg.channelLayers || defaultChannelLayers
	arg.channelDepth = arg.channelDepth || defaultChannelDepth

	return new Deltangle({
		provider: arg.provider,
		mwm: arg.mwm,
		channelLayers: arg.channelLayers,
		channelDepth: arg.channelDepth})
}

async function save() {
	let content = arg.save
	if (fs.existsSync(arg.save)){
		content = await fs.readFileSync(arg.save, 'ascii')
	}
	let instance = getInstance()
	let hash = undefined
	if (arg.hash) {
		hash = await instance.post(content, arg.hash)
	} else {
		hash = await instance.post(content)
	}
	console.log(hash)
}

async function obtain() {
	let instance = getInstance()
	let message = (arg.log) ? '*' : ((arg.message) ? arg.message : null)
	let content = await instance.get(arg.obtain, message)
	console.log(content)
}

async function version() {
	let instance = getInstance()
	let result = undefined
	if (!arg.message) {
		console.log('Undefined message')
		process.exit()
	}
	if (arg.seed) {
		result = await instance.setVersion(arg.version, arg.message, arg.seed)
	} else {
		result = await instance.setVersion(arg.version, arg.message)
	}
	console.log(result)
}

if (arg.save) {
	save()
} else if (arg.obtain) {
	obtain()
} else if (arg.version) {
	version()
} else {
	console.log('Usage: deltangle [options] <command>')
	console.log('')
	console.log('where [options] can be zero or more of the following arguments:')
	console.log('  --provider provider')
	console.log('      Provider. Default: ' + defaultProvider)
	console.log('  --mwm mwm')
	console.log('      MWM. Default: ' + defaultMWM)
	console.log('  --channelLayers layers')
	console.log('      Channel layers used for versions. Default: ' + defaultChannelLayers)
	console.log('  --channelDepth depth')
	console.log('      Channel depth used for versions. Default: ' + defaultChannelDepth)
	console.log('')
	console.log('and <command> is one of:')
	console.log('  --save <file or text> [--hash hash]')
	console.log('      Save a file or a string of text')
	console.log('            Add --hash with a given hash to save difference with the previous one')
	console.log('  --obtain hash [--log] [--message message]')
	console.log('      Get a file')
	console.log('            Add --log to list versions if it is a versioned file')
	console.log('            Add --message to obtain a given version if it is a versioned file')
	console.log('            Note: If it is a versioned file and neither --log nor --message are specified, the most recent version is returned')
	console.log('  --version hash --message message [--seed seed]')
	console.log('      Create or update a version')
	console.log('            Add --seed to update a version or create a new version using this seed')
}
