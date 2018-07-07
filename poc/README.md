# Instructions

## Node.js

1.Install node

    curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
    sudo apt-get install -y nodejs

2.Install libs

    npm install iota.lib.js
    npm install diff

    
## Web

1.Copy web and resources to your webserver folder

    mkdir <webserver>/deltangle
    mkdir <webserver>/deltangle/css
    mkdir <webserver>/deltangle/js
    cp web.html <webserver>/deltangle/
    cp css/* <webserver>/deltangle/css/
    cp js/* <webserver>/deltangle/js/

2.Copy libs to your webserver folder

    mkdir <webserver>/deltangle/lib
    cp ../lib/iota-bindings-emscripten.wasm <webserver>/deltangle/lib/
    cp ../lib/mam.web.js <webserver>/deltangle/lib/
    cp ../lib/iota.min.js <webserver>/deltangle/lib/
    cp ../lib/maia.js <webserver>/deltangle/lib/
    cp ../dist/deltangle.js <webserver>/deltangle/lib/

3.Modify deltangle.html

    ...
	<script type="text/javascript" src="../../lib/iota.min.js"></script>  <!-- ./lib/iota.min.js -->
	<script type="text/javascript" src="../../lib/mam.web.js"></script>   <!-- ./lib/mam.web.js  -->
	<script type="text/javascript" src="../../lib/maia.js"></script>   <!-- ./lib/maia.js  -->
	<script type="text/javascript" src="../../dist/deltangle.js"></script>     <!-- ./lib/deltangle.js     -->
    ...

4.Modify mam.web.js

    // Line 22556
    })({"wasmBinaryFile":"/deltangle/lib/iota-bindings-emscripten.wasm","ENVIRONMENT":"WEB"}) // 'YOUR PATH'