const Mnemonic = require('bitcore-mnemonic')
const crypto = require('crypto')
const base58 = require('bs58')
const bigint = require('big-integer')
const secp256k1 = require('secp256k1')
const ripemd160 = require('ripemd160')
const TWO_31ST = Math.pow(2, 31)
const ARGV = require('minimist')(process.argv.slice(2))


function privateKeyToWif(key) {
  let data = Buffer.concat([
    Buffer.from('80', 'hex'),
    key,
    Buffer.from('01', 'hex')
  ])

  let h1 = crypto.createHash('sha256').update(data).digest()
  let s2 = crypto.createHash('sha256').update(h1).digest()
  
  let checksum = Buffer.allocUnsafe(4)
  s2.copy(checksum, 0, 0, 4)
  let keyWithChecksum = Buffer.concat([data, checksum])
  
  return base58.encode(keyWithChecksum)
}

function serializeExtendedKey(key, chainCode, type, depth, parentKey, pos) {
    pos = pos || 0
    let fp = parentKey ? fingerprint(parentKey) : intToBuffer(0, 4)
    let typeCd = type === "private" ? '0488ADE4' : '0488B21E'
    let sData = type === "private" ? Buffer.concat([Buffer.from('00', 'hex'), key]) : key
    
    let bytes = Buffer.concat([
      Buffer.from(typeCd, 'hex'), //version
      intToBuffer(depth, 1),
      fp, // the fingerprint of the parent's key (0x00000000 if master key)
      intToBuffer(pos, 4), // child number. This is ser32(i) for i in xi = xpar/i, with xi the key being serialized. (0x00000000 if master key)
      chainCode,
      sData], 78)
      
    let sha1 = crypto.createHash('sha256').update(bytes).digest()
    let sha2 = crypto.createHash('sha256').update(sha1).digest()
    let checkSum = Buffer.allocUnsafe(4)
    sha2.copy(checkSum, 0, 0, 4)
    let extKey = Buffer.concat([bytes, checkSum])

    return base58.encode(extKey)
}

function intToBuffer(int, bufLen) {
    let intHex = int.toString(16).padStart(bufLen * 2, "0")
    let buf = Buffer.alloc(bufLen)
    buf.write(intHex, 'hex')
    return buf
}

function fingerprint(key) {
  let fp = Buffer.allocUnsafe(4)
  let sha = crypto.createHash('sha256').update(key).digest()
  let hash160 = new ripemd160().update(sha).digest()
  hash160.copy(fp, 0)
  return fp
}

// hardened key position
function h(int) {
  return TWO_31ST + int
}

// child key derivation function
function ckdPriv(parPrivKey, parCc, i) {
    if ( i >= TWO_31ST ) {
      let slot = intToBuffer(i, 4)
      let sData = Buffer.concat([Buffer.from('00', 'hex'), parPrivKey, slot])
      let hash = crypto.createHmac('sha512', parCc).update(sData).digest()
      let hleft = Buffer.allocUnsafe(32)
      let chainCode = Buffer.allocUnsafe(32)
      hash.copy(hleft, 0, 0, 32)
      hash.copy(chainCode, 0, 32)

      // need bigint lib to support adding left part of hash to parent privkey
      // converted back and forth via hex
      let kint = bigint(parPrivKey.toString('hex'), 16)
      let hlint = bigint(hleft.toString('hex'), 16)
      let pkhex = kint.add(hlint).toString(16)
      let privKey = Buffer.from(pkhex, 'hex')
      
      return { privKey, chainCode }
    } else {
      throw Error(`non-hardened key creation not supported`)
    }
}

function generateKeysForSeed(seedString) {
  let hmac = crypto.createHmac('sha512', "Bitcoin seed")
  let seed = new Buffer(seedString, "hex")

  hmac.update(seed)
  let master = hmac.digest()
  console.log(`master key:`, master.toString('hex'))
  console.log(``)

  let masterPrivKey = Buffer.allocUnsafe(32)
  let masterChainCode = Buffer.allocUnsafe(32)
  master.copy(masterPrivKey, 0, 0, 32)
  master.copy(masterChainCode, 0, 32)
  
  // get the public seed in a compressed format
  const masterPubKey = secp256k1.publicKeyCreate(masterPrivKey)
   
  console.log(`master private key hex:`, masterPrivKey.toString('hex'))
  console.log(` master public key hex:`, masterPubKey.toString('hex'))
  console.log(`master private key wif:`, privateKeyToWif(masterPrivKey))
  console.log(`     master chain code:`, masterChainCode.toString('hex'))
  console.log(``)
  console.log('master xprv:', serializeExtendedKey(masterPrivKey, masterChainCode, 'private', 0))
  console.log('master xpub:', serializeExtendedKey(masterPubKey, masterChainCode, 'public', 0))

  
  let m0H = ckdPriv(masterPrivKey, masterChainCode, h(0))
  m0H.pubKey = secp256k1.publicKeyCreate(m0H.privKey)
  console.log(``)
  console.log(`m0H`, serializeExtendedKey(m0H.privKey, m0H.chainCode, 'private', 1, masterPubKey, h(0)))
  console.log(`m0H`, serializeExtendedKey(m0H.pubKey, m0H.chainCode, 'public', 1, masterPubKey, h(0)))
}

function generateMnemonic() {
  let code = new Mnemonic();
  let phrase = code.toString()
  
  console.log('mnemonic:', phrase)
}

switch(ARGV.op) {
  case 'keys':
    generateKeysForSeed(ARGV.seed)
    break
  case 'mnemonic':
    generateMnemonic()
    break
  case 'mnemonic-to-seed':
    let seed = crypto.pbkdf2Sync(ARGV.mnemonic, 'mnemonic', 2048, 64, 'sha512')
    console.log(`seed`, seed.toString('hex'))
    break
  default:
    console.log(`unknown --op command: ${ARGV.op}`)
    break
}
