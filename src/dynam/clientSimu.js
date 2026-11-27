// import { createMlKem1024 } from "mlkem";
// import { generateKeyPair, GeneralSign, generalVerify } from "jose";

// // ce code fonctionne.
// async function doMlKem() {
// 	try {
// 		const recipient = await createMlKem1024();
	
// 		// A recipient generates a key pair.
// 		const [pkR, skR] = recipient.generateKeyPair();
		
	
// 		// A sender generates a ciphertext and a shared secret with pkR.
// 		const sender = await createMlKem1024();
// 		const [ct, ssS] = sender.encap(pkR);
	
// 		// The recipient decapsulates the ciphertext and generates the same shared secret with skR.
// 		const ssR = recipient.decap(ct, skR);
	
// 		const isEqualArray = new Promise((resolve, reject) => {
// 			if (ssS.length != ssR.length) {
// 				reject(false)
// 			}
// 			for (let i = 0; i < ssS.length; i++) {
// 				if (ssS[i] != ssR[i]) {
// 					reject(false)
// 				}
// 			}
// 			resolve(true)
// 		});
	
// 		return await isEqualArray
// 	} 
// 	catch (error) {
// 		console.log(error) //ù améliorer le error handling
// 	}
// }

// async function genAsymKeyPairJose(type) { // possible : ES, HS, PS, RS, ML-DSA-XX
// 	const { publicKey, privateKey } = await generateKeyPair(type)

// 	return { publicKey, privateKey }
// }

// //	---------------------- tokens :


// // JWS
// const pki = await genAsymKeyPairJose("ML-DSA-65")
// const JWS = await new GeneralSign(
// 	new TextEncoder().encode({ email: "random mail", role: "user", sub: "random user_id", iss: "PWP-auth-server" }),
// )
// 	.addSignature(pki.privateKey)
// 	.setProtectedHeader({ alg: 'ML-DSA-65' })
// 	.sign()

// /*
// formats des jws = {
// 	signatures: [
// 		{
// 			signature: 'signature',
// 			protected: 'le header protégé avec les infos dedans genre l'algo utilisé'
// 		}
// 	],
// 	payload: 'le contenu principalement protégé type email, iss, aud...'
// }
// */

// const { payload, protectedHeader } = await generalVerify(JWS, pki.publicKey) // JWS + publikey à mettre en argument

// console.log(protectedHeader)
// console.log(new TextDecoder().decode(payload))



import { createMlKem1024 } from "mlkem";
import { argon2id, hash } from "argon2";
import { generateKeyPair, GeneralSign, generalVerify, generateSecret, GeneralEncrypt } from "jose";


async function jsp(str, numTab){
    str += numTab[0];
    for (let i = 1; i < numTab.length; i++) {
        str += numTab[i];
    }
    return str;
}


// server
async function doMlKem() { 
	try {
		const recipient = await createMlKem1024();
	
		// A recipient generates a key pair.
		const [pkR, skR] = recipient.generateKeyPair();
		
	
		// A sender generates a ciphertext and a shared secret with pkR.
		const sender = await createMlKem1024(); 
		const [ct, ssS] = sender.encap(pkR); 
	
		// The recipient decapsulates the ciphertext and generates the same shared secret with skR.
		const ssR = recipient.decap(ct, skR);
	
		const isEqualArray = new Promise((resolve, reject) => {
			if (ssS.length != ssR.length) {
				reject(false)
				throw "bad shared secret"
			}
			for (let i = 0; i < ssS.length; i++) {
				if (ssS[i] != ssR[i]) {
					reject(false)
					throw "bad shared secret"
				}
			}
			resolve(true)
		});
	
		return { isEqualArray, ssR }
	} 
	catch (error) {
		console.log(error) //ù améliorer le error handling
	}
}

async function genAsymKeyPairJose(type) { // possible : ES, HS, PS, RS, ML-DSA-XX
	const { publicKey, privateKey } = await generateKeyPair(type)

	return { publicKey, privateKey }
}

async function genSecretJose(type) { // possible : 
	const secret = await generateSecret(type)

	return secret
}

//	---------------------- tokens :


// JWS
const pki = await genAsymKeyPairJose("ML-DSA-65")
const JWS = await new GeneralSign(
	new TextEncoder().encode({ email: "random mail", role: "user", sub: "random user_id", iss: "PWP-auth-server" }),
)
	.addSignature(pki.privateKey)
	.setProtectedHeader({ alg: 'ML-DSA-65' })
	.sign()


// KEM
const resu = await doMlKem() // contient réussite ou non et shared secret


// JWE
const jwe = await new GeneralEncrypt(
  new TextEncoder().encode(JWS),
)
  	.setProtectedHeader({ enc: 'A256GCM' })
  	.addRecipient(pki.publicKey)					// pkey du JWS (envoyer celle du JWE spéraément)
  	.setUnprotectedHeader({alg: 'dir'})
  	.encrypt(await hash(resu.ssR))

console.log(jwe)


	/*
formats des jws = {
	signatures: [
		{
			signature: 'signature',
			protected: 'le header protégé avec les infos dedans genre l'algo utilisé'
		}
	],
	payload: 'le contenu principalement protégé type email, iss, aud...'
}
*/



// const { payload, protectedHeader } = await generalVerify(JWS, pki.publicKey) // JWS + publikey à mettre en argument

// console.log(protectedHeader)
// console.log(new TextDecoder().decode(payload))

// vérif JWE
// const { plaintext, protectedHeader, additionalAuthenticatedData } = await jose.generalDecrypt(jwe, resu.ssR)

// console.log(protectedHeader)
// const decoder = new TextDecoder()
// console.log(decoder.decode(plaintext))
// console.log(decoder.decode(additionalAuthenticatedData))