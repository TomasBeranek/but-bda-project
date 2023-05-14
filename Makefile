blockchain:
	npx ganache-cli -l 12500000 --mnemonic "logic comic motion galaxy replace mimic warfare dilemma usual blame palm receive"

run-dapp:
	cd dapp && make run

deploy:
	truffle deploy --network development

zip:
	zip -9 -r xberan46.zip .secret assignment.pdf config/ contracts/ doc-src/ documentation.pdf LICENSE Makefile migrations/ package.json package-lock.json README.md test/ truffle-config.js dapp/bdat-dapp.html dapp/index.html dapp/Makefile dapp/script.js dapp/styles.css