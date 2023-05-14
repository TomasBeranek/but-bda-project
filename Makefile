blockchain:
	npx ganache-cli -l 12500000 --mnemonic "logic comic motion galaxy replace mimic warfare dilemma usual blame palm receive"

run-dapp:
	cd dapp && make run

deploy:
	truffle deploy --network development