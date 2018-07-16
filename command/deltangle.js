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
        	let content = await fs.readFileSync(arg.save, 'ascii')
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
	let content = await instance.get(arg.obtain)
	console.log(content)
}

async function version() {
	let instance = getInstance()
	let result = undefined
	if (arg.seed) {
		result = await instance.setVersion(arg.version, arg.seed)
	} else {
		result = await instance.setVersion(arg.version)
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
	console.log('\nwhere [options] can be zero or more of the following arguments:')
	console.log('  --provider provider\n      Provider. Default: ' + defaultProvider)
	console.log('  --mwm mwm\n      MWM. Default: ' + defaultMWM)
	console.log('  --channelLayers layers\n      Channel layers used for versions. Default: ' + defaultChannelLayers)
	console.log('  --channelDepth depth\n      Channel depth used for versions. Default: ' + defaultChannelDepth)
	console.log('\nand <command> is one of:')
	console.log('  --save <file> [--hash hash]\n      Save a file. Add --hash with a given hash to save difference with the previous one')
	console.log('  --obtain hash\n      Get a file')
	console.log('  --version hash [--seed seed]\n      Create or update a version. Add --seed to update a version or create a new version using this seed')
}
