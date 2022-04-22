import {
  JSEncrypt
} from './jsencrypt.min.js'

const rsa = {
  public_key: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCi8+NXa27wtcVviKOCYVltuohvqRSwWXJ8gReSqH3C0avjCaoXGznpxCXcywiupLt/EuFYd6gqYQ0jRr/qVz5qZXnE3r4VO7pdLT3GcgCfFvES/1o6WQuCQC0sq1AbZj8vF2goKAmGlSahMDM4uqnTbIsBZ9XtP7x10asuyvnfYwIDAQAB'
}



// rsa_encode 加密
export function rsa_encode(str) {
  var encrypt = new JSEncrypt()
  encrypt.setPublicKey(rsa.public_key)
  return encrypt.encrypt(str)
}

// rsa_decode 解密
// export function rsa_decode(str) {
//   var decrypt = new JSEncrypt();
//   decrypt.setPrivateKey(rsa.private_key);
//   return decrypt.decrypt(str);
// }

// 生成密钥对
// function generateKeys() {
//   var crypt = new JSEncrypt({
//     default_key_size: 1024
//   });
//   crypt.getKey();
//   var publicKey = crypt.getPublicKey();
//   var privateKey = crypt.getPrivateKey();
//   // 去除-----*** RSA **** KEY----- 和空格换行
//   publicKey = (publicKey.split('-----'))[2];
//   publicKey = publicKey.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "").replace(/\s*/g, "");
//   privateKey = (privateKey.split('-----'))[2];
//   privateKey = privateKey.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "").replace(/\s*/g, "");
//   // 返回生成的秘钥对
//   return [publicKey, privateKey];
// }
