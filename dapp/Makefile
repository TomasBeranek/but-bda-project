run:
	python3 -m http.server

abi:
	rm -rf blockchain
	mkdir blockchain
	mkdir blockchain/build
	mkdir blockchain/contracts
	cp ../contracts/BDAERC20.sol blockchain/contracts/BDAERC20.sol
	cp ../contracts/Admins.sol blockchain/contracts/Admins.sol
	../node_modules/.bin/solcjs --abi --include-path ../node_modules/ --base-path . blockchain/contracts/BDAERC20.sol --output-dir blockchain/build