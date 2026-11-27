import { createMlKem1024 } from "mlkem";
import { argon2id, hash } from "argon2";
import { User } from "./src/models/user.model.js";
import { generateKeyPair, GeneralSign, generalVerify } from "jose";

// // auth status
// jwt.verify(accessToken, process.env.JWT_PUBLIC, (err) => {
//     if (err) throw { thyErr: err, thyMessage: "non-autorisé", thyStatusCode: 401 }
// });

// // loginUser
// const token = jwt.sign(
//     { email: user.email, role: "user", sub: user._id, iss: "PWP-auth-server" },  //ù penser à ajouter aud et mettre une logique de vérif dérrière iss, role et aud
//     process.env.JWT_PRIVATE,
//     { expiresIn: 60 * 5, algorithm: "ES384" }
// );

//---------------------------------------JOSE-----------------------------------------

// async function genAsymKeyPairJose(type) { // possible : ES, HS, PS, RS, ML-DSA-XX
//   const { publicKey, privateKey } = await generateKeyPair(type)
//   User.findByIdAndUpdate($req.user._id, {keyInfo: type, keyPart: {privateKey, publicKey}})
//   // c dla merde pcq il faut append les clés au lieu de les écraser pcq il y a 3 algos pr 1 user 
//   // return les deux pour qu'ils soient dans la session du user
//   // req.session.user.keyScrap.keyInfo = type;
//   // req.session.user.keyScrap.keyPart = publicKey;

//   return privateKey
// }


// // JWS
// const JWS = await new GeneralSign(
//   new TextEncoder().encode({ email: user.email, role: "user", sub: user._id, iss: "PWP-auth-server" }),
// )
//   .addSignature(genAsymKeyPairJose("ML-DSA-65"))
//   .setProtectedHeader({ alg: 'ML-DSA-65' })
//   .sign()


// // JWE nested
// const JWE = await new GeneralEncrypt(                   // utilise un HPKE
//   new TextEncoder().encode(JWS),
// )
//   .setProtectedHeader({ enc: 'A256GCM' })               //ù à enlever jpense
//   .addRecipient(ecPublicKey)
//   .setUnprotectedHeader({ alg: 'PBES2-HS512+A256KW' })  //ù à enlever jpense
//   .encrypt()


// // déchiffrage pour le client lourd :
// const { plaintext, protectedHeader, additionalAuthenticatedData } =
//   await generalDecrypt(JWE, privateKey)

// console.log(protectedHeader)
// const decoder = new TextDecoder()
// console.log(decoder.decode(plaintext))
// console.log(decoder.decode(additionalAuthenticatedData))

async function genAsymKeyPairJose(type) { // possible : ES, HS, PS, RS, ML-DSA-XX
	const { publicKey, privateKey } = await generateKeyPair(type)

	return { publicKey, privateKey }
}

const loginUser = async (req, res) => {
    try {
        
        const { email, password } = req.body;

        if(!email || !password) return res.status(400).json({
            message: "les 2 champs n'ont pas été reçus"
        });

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if(!user) return res.status(404).json({
            message: "user pas trouvé"
        });

        const isMatch = await user.comparePassword(password);
        if(!isMatch) return res.status(400).json({
            message: "crédentiels invalides"
        });


        req.session.user = user._id                      // dans session.user il y a : user: { _id: new ObjectId('6ac...'), password: 'le mdp en argon2', email: 'email', MFA: false, createdAt: format heure, updatedAt: format heure, __v: 0}
        req.session.visited = true;

        // envoie le cookie max age (qui sert à rien btw)
        // res.cookie("maxAge", "5minutes", { maxAge: 60000 * 5, signed: true});

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
                    }
                    for (let i = 0; i < ssS.length; i++) {
                        if (ssS[i] != ssR[i]) {
                            reject(false)
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

        const {resu, stringifiedSSR} = await doMlKem()
        console.log(stringifiedSSR)


		const keys = await genAsymKeyPairJose("ML-DSA-65")
        const JWS = await new GeneralSign(
          	new TextEncoder().encode({ email: "random mail", role: "user", sub: "random user_id", iss: "PWP-auth-server" }),
        )
          	.addSignature(keys.privateKey)
          	.setProtectedHeader({ alg: 'ML-DSA-65' })
          	.sign()





        res.status(200).json({ 
            message: "user connecté",
            user: {
                id: req.session.user,
                email: user.email,
                MFA: user.MFA,
                debug: req.session,
                token: token
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }
};

// utiliser kdf pour passer de la clé en typed array à la secret key AES-GCM

// client ini, gen Ckeypair, envoie CpubKey				k | pkey 
// server ini, gen ct + ssS avec CpubKey, envoie ct		k, ct | pkey, ssS, ct
// client gen ssR avec ct + CpriKey, 					k, ct, ssR | pkey, ssS, ct

// 
const ssrNumbers = new Int8Array([21, 65, 112, 69, 74, 35])
// console.log(ssrNumbers.length, ssrNumbers[0])
// let ssR = ssrNumbers[0]
// ssR = (ssR*100) + ssrNumbers[1] 
// console.log(ssR)

// si le x fait 1digit : numFlat = numFlat*10 + x       donc 
// si le x fait 2digit : numFlat = numFlat*100 + x
// si le x fait 3digit : numFlat = numFlat*1000 + x

let ssR;

async function jsp(str, numTab){
    str += numTab[0];
    for (let i = 1; i < numTab.length; i++) {
        str += numTab[i];
    }
    return str;
}

const leHash = await hash(ssrNumbers)
console.log(leHash)

// permet de convertir le shared secret en string et de le kdf
// const ssR = new Int8Array([21, 65, 112, 69, 74, 35])
// console.log("l'array est un " + typeof x[1])
// console.log(ssR.toString())

// const hash = await argon2.hash(ssR, {
//     type: argon2.argon2id
// });
// console.log(hash)