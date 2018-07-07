//
// Javascript functions for PoC website
//
const defaultNode = 'https://iotanode.be:443'
const defaultDepth = 14
const defaultMWM = 1

const inputs = ['seed', 'maia']
const date = '2018.07.07'

let forms = ['save', 'update', 'version', 'obtain']
let request = {seed:'', maia:''}
let node = null
let selectedForm
let instance
let saveContent = ''
let content = { fSave: null, fUpdate: null }

// Return Deltangle instance
async function getDeltangle() {
	let auxNode = document.getElementById('node').value
	if (auxNode != node) {
		initRequest()
		node = auxNode
		setInputValue('console', "Checking connection to node '" + node + "'")
		instance = new Deltangle({provider: node})
		let connected = await instance.maia.isConnected()
		finishRequest()
		if (!connected) {
			appendInputValue('console', "\n\nCould not connect to the node '" + node + "'")
			instance = null
			node = null
		}
	}
	if (instance != null) {
		instance.maia.depth = parseInt(document.getElementById('depth').value)
		instance.maia.mwm = parseInt(document.getElementById('mwm').value)
		instance.maia.channelLayers = 1
		instance.maia.channelDepth = 20
	}
	return instance
}

// Execute an action
async function execute(action) {
	let deltangle = await getDeltangle()
	let value = undefined
	switch (selectedForm) {
	case 'save':
		initRequest()
		setInputValue('console', 'Uploading content\n')
		value = await deltangle.post(content.fSave)
		appendInputValue('console', 'Hash: ' + value)
		finishRequest()
		break

	case 'update':
		initRequest()
		setInputValue('console', 'Uploading content\n')
		value = await deltangle.post(content.fUpdate, document.getElementById('bundle-update').value)
		appendInputValue('console', 'Hash: ' + value)
		finishRequest()
		break

	case 'version':
		initRequest()
		setInputValue('console', 'Updating version\n')
		let seed = document.getElementById('seed').value
		seed = iotaWrapper.valid.isAddress(seed) ? seed : Deltangle.MAIACLASS.keyGen()
		value = await deltangle.setVersion(document.getElementById('bundle-version').value, seed)
		appendInputValue('console', 'Seed: ' + value.seed + '\nHash: ' + value.view)
		finishRequest()
		break

	case 'obtain':
		initRequest()
		setInputValue('console', 'Obtaining content\n')
		value = await deltangle.get(document.getElementById('bundle-obtain').value)
		setInputValue('console', value)
		finishRequest()
		break
	}
}

// Clean contents
function clean() {
	let inputs = ['file-save', 'file-update', 'bundle-update', 'bundle-version', 'bundle-obtain', 'seed']
	for (var i in inputs) {
		document.getElementById(inputs[i]).value = ''
	}
	document.getElementById('console').value = ''
	document.getElementById('fSave').value = ''
	document.getElementById('fUpdate').value = ''
	content = { fSave: null, fUpdate: null }
	controlDo()
}

// Set input value
function setInputValue(id, value) {
	if (value != null) {
		document.getElementById(id).value = value
	}
}

// Append value to input
function appendInputValue(id, value) {
	let element = document.getElementById(id)
	element.value = element.value + value
}

// Generate random input
function random(id) {
	document.getElementById(id).value = MAIA.keyGen()
}

// Set web info
function setInfo() {
	document.getElementById('info-date').innerHTML = date
}

// Execute after load
function afterLoad() {
	document.getElementById('node').value = defaultNode
	document.getElementById('depth').value = defaultDepth
	document.getElementById('mwm').value = defaultMWM
	setInfo()
	setForm('save')
}

// Init request
function initRequest() {
	document.getElementById('loader').addEventListener("webkitAnimationIteration", loaderRepeatFunction)
	document.getElementById('loader').addEventListener("animationiteration", loaderRepeatFunction)
	document.getElementById('timer').innerHTML = ''
	document.getElementById('loader').style.display = 'block'
	document.getElementById('timer').style.display = 'block'
	document.getElementById('console').style.opacity = 0.5
}

// Finish request
function finishRequest() {
	document.getElementById('loader').style.display = 'none'
	document.getElementById('timer').style.display = 'none'
	document.getElementById('loader').removeEventListener("webkitAnimationIteration", loaderRepeatFunction)
	document.getElementById('loader').removeEventListener("animationiteration", loaderRepeatFunction)
	document.getElementById('console').style.opacity = 1
}

// Loader repeat function
function loaderRepeatFunction(event) {
	document.getElementById('timer').innerHTML = event.elapsedTime
}

// Set active form
function setForm(selected) {
	selectedForm = selected
	forms.forEach(function(element) {
		if (element.localeCompare(selected) == 0) {
			document.getElementById('button-' + element).className = 'btn btn-dark active disabled'
			document.getElementById('form-' + element).style.display = 'block'
		} else {
			document.getElementById('button-' + element).className = 'btn btn-outline-secondary'
			document.getElementById('form-' + element).style.display = 'none'
		}
	})
	controlDo()
}

function handleFile(files, view) {
	if (files.length == 0) {
		document.getElementById(view).value = ''
		content[view] = null
		controlDo()
	} else {
		let reader = new FileReader()
		reader.readAsText(files[0], 'ASCII')
		reader.onload = function (evt) {
			document.getElementById(view).value = content[view] = evt.target.result
			controlDo()
		}
	}
}

function controlDo() {
	let enabled = true
	switch (selectedForm) {
	case 'save':
		enabled = content.fSave != null
		break

	case 'update':
		enabled = (content.fUpdate) != null && iotaWrapper.valid.isAddress(document.getElementById('bundle-update').value)
		break

	case 'version':
		enabled = iotaWrapper.valid.isAddress(document.getElementById('bundle-version').value)
		// TODO promisify maia
		enabled = false
		break

	case 'obtain':
		enabled = iotaWrapper.valid.isAddress(document.getElementById('bundle-obtain').value)
		break
	}
	document.getElementById('button-do').className = (enabled) ? 'btn btn-outline-secondary' : 'btn btn-outline-secondary disabled'
}