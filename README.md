# Modified ERC20 Token (BDAERC20)
The BDAERC20 project aims to create a modified ERC20 token in Solidity 0.8.13 using the Truffle framework. The modifications are listed in the ```assignment.pdf``` file. The project provides the source files for smart contracts, their compilation, testing and deployment, as well as the source files for the decentralized application (DAPP). A list of all public functions provided by the implemented smart contracts is given in the ```documentation.pdf```, where there is also a link to a demonstration video of the use of DAPP (in Czech).

## How To Install (Ubuntu 20.04)
This project (smart contracts and DAPP) was built for and tested on a local blockchain emulated by **ganache-cli** and managed by **Truffle** framework (compilation, testing and deployment of smart contracts) and **MetaMask** wallet (DAPP).

To install the **Truffle** framework, run:
```
sudo apt-get install -y nodejs build-essential
sudo npm install -g truffle
```

To install **ganache-cli**, run:
```
sudo npm install ganache-cli
```

Next, install the necessary smart contract dependencies using:
```
npm install
```

Install the **MetaMask** add-on in your browser (tested in Mozilla Firefox 112.0.2 (64-bit) with MetaMask 10.29.0).

## How To Run
Since DAPP needs the address of the deployed contract, this address is hardcoded at the beginning of the ```dapp/script.js``` file. In real world conditions, the address of the contract does not change, but when the local blockchain is restarted, the address will change unless **mnemonic** is specified. Mnemonic is already set inside ```Makefile```. To start the local blockchain, run:
```
make blockchain
```

To deploy the BDAERC20 smart contract, run:
```
make deploy
```

To run DAPP using the ```http.server``` Python module, run:
```
make run-dapp
```

DAPP is now available through a web browser at [http://localhost:8000](http://localhost:8000).

To run Truffle tests and/or gas measurements, run:
```
truffle test
```

## Repository Structure
    .
    ├── config/                 # Truffle default values for contracts
    ├── contracts               # Source code of contracts
    ├── dapp/                   # Source code of DAPP
    ├── doc-src/                # Source code of documentation (LaTex)
    ├── migrations/             # Truffle deploy scripts
    ├── test/                   # Truffle tests
    ├── .gitignore
    ├── .secret                 # Truffle .secret
    ├── assignment.pdf          # Specification of modification of ERC20 token
    ├── documentation.pdf
    ├── LICENSE
    ├── Makefile                # Provides some basic targets
    ├── package.json            # Dependencies for npm
    ├── package-lock.json       # Dependencies for npm
    ├── README.md
    └── truffle-config.js       # Truffle config

## Contact
Author: Tomáš Beránek (xberan46@stud.fit.vutbr.cz)

Repository: [https://github.com/TomasBeranek/but-bda-project](https://github.com/TomasBeranek/but-bda-project)


## License
MIT License

Copyright (c) 2023 Tomáš Beránek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
