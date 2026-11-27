import { generateKeyPair, GeneralSign, GeneralEncrypt, generalDecrypt } from "jose";
import { User } from "./src/models/user.model.js";


async function genAsymKeyPairJose(type) { // possible : ES, HS, PS, RS, ML-DSA-XX
	const { publicKey, privateKey } = await generateKeyPair(type)
	// User.findByIdAndUpdate($req.user._id, {keyInfo: type, keyPart: privateKey})
  
  // return les deux pour qu'ils soient dans la session du user
  // req.session.user.keyScrap.keyInfo = type;
  // req.session.user.keyScrap.keyPart = publicKey;

	return { publicKey, privateKey }
}

const key = await genAsymKeyPairJose("ML-DSA-65")
console.log(key.privateKey)

