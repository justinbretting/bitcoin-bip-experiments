
# Bitcoin Tools - bip32 & HD Wallet Derivation

Brief set of tools for experimenting with HD wallet creation

## Usage

Generate a new mnemonic

```
$ node index.js --op mnemonic
amazing army wisdom fury relief enact buddy fossil frown royal sick conduct
```

Convert the mnemonic to a seed

```
$ node index.js --op mnemonic-to-seed --mnemonic "amazing army wisdom fury relief enact buddy fossil frown royal sick conduct"
0b091c353ca7bdd25b3feb729dbceb4ecc55abced754e08da747ad7710a714492760f84cf842c9ddda4be529510ee51c5208a4633350800bd8c12340a9d93c5c
```

Generate a set of master keys from the seed

```
$ node index.js --op keys --seed "000102030405060708090a0b0c0d0e0f"
master key: e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508

master private key hex: e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35
 master public key hex: 0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2
master private key wif: L52XzL2cMkHxqxBXRyEpnPQZGUs3uKiL3R11XbAdHigRzDozKZeW
     master chain code: 873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508

master xprv: xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi
master xpub: xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8

m0H xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7
m0H xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw
```

Note that the output from the `--op keys` example shows that it satisfies the [initial test cases for BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#test-vector-1)