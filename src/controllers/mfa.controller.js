import { User } from "../models/user.model.js";
import { sessionCheck } from "../config/constants.js";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import jwt from "jsonwebtoken";



const setupMFA = async (req, res) => {
    try {
        
        const result = sessionCheck(req.session.id, req.sessionStore.sessions); 
        if(result !== "good") {
            return res.status(result.statusCode).json({
                message: result.message,
            });
        }

        const user = await User.findOne({
            email: req.session.user.email.toLowerCase()
        });

        if(!user) throw ('session vérifiée mais utilisateur innexistant ??'); // impossible que la session soit différente de l'utilisateur connecté non ?

        //--------------------||||||||||||--------------------

        if(user.MFA == true) { return res.status(409).json({
            message: "vous avez déjà la 2FA", 
        });}
        else { 

            const secrets = await speakeasy.generateSecret();
            await User.updateOne({_id: req.session.user._id}, { $set: { MFAsecret: secrets.base32, MFA: true }}); // l'initialisation de l'user est avant la méthode donc les logs type : "user.MFAsecret" seront faux 
            const url = speakeasy.otpauthURL({
                secret: secrets.base32,
                label: req.session.user.email,
                issuer: "localhost:4000",             //ù changer en fonction du front end
                encoding: "base32",
            });

            const qrCodeUrl = await qrCode.toDataURL(url);

            return res.status(200).json({
                secret: secrets.base32,
                qrCode: qrCodeUrl, 
            });
        }

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
        console.log(error)
    }

};

const verifyMFA = async (req, res) => {
    try {
        
        const result = sessionCheck(req.session.id, req.sessionStore.sessions);
        if(result !== "good") {
            return res.status(result.statusCode).json({
                message: result.message,
            });
        }

        const { token } = req.body;

        if(!token || token.length !== 6) return res.status(400).json({
            message: "le format du token n'est pas valide"
        });

        const user = await User.findOne({
            email: req.session.user.email.toLowerCase()
        });

        const verified = speakeasy.totp.verify({
            secret: user.MFAsecret,
            encoding: "base32",
            token: token,
        });

        if(verified) { //ù il faut s'occuper des refresh token
            const jwtToken = jwt.sign(
                { email: req.session.user.email },  // (pas sûr de l'info) le payload est entre accolades et les headers jsp
                process.env.JWT_SECRET,
                { expiresIn: 60 * 5}, //ù 5 min mais idéalement faudra le passer à une minute quand y'aura des refresh token
                { role: "USER" },
                { userID: req.session.id }
            );
            return res.status(200).json({
                message: "vérif MFA réussie", 
                token: jwtToken                 //ù adapter les header du jwt en fonction des infos dans le bloc notes
            });
        } else {
            res.status(400).json({
                message: "token MFA invalide"
            });
        }

    } catch (error) {
        res.status(500).json({
        message: "internal serv error", error
        });
    }

};

const resetMFA = async (req, res) => {
    try {

        const result = sessionCheck(req.session.id, req.sessionStore.sessions);
        if(result !== "good") { 
            return res.status(result.statusCode).json({
                message: result.message,
            });
        }
        
        res.status(503).json({
            message: "pas encore implémenté"
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }

};

const deleteMFA = async (req, res) => {
    try {
        
        const result = sessionCheck(req.session.id, req.sessionStore.sessions);
        if(result !== "good") {
            return res.status(result.statusCode).json({
                message: result.message,
            });
        }

        const { email, password } = req.body;

        if(!email || !password) return res.status(400).json({
            message: "il manque un des 2 champs"
        });

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if(!user || email !== req.session.user.email) return res.status(404).json({
            message: "session validée, mais utilisateur inconnu ou différent de la session"
        });

        //--------------------||||||||||||--------------------

        if(user.MFA == true) {

            //ù déjà, lancer MFA
            
            await User.updateOne({_id: req.session.user._id}, { $set: { MFA: false }, $unset: { MFAsecret: "" } });

            return res.status(201).json({
                message: "MFA supprimé",
            });
        }

        res.status(204).json({
            message: "user n'a aucun MFA à supprimer",
            userMFA: user.MFA || null,
        });


    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }

}

export {
    setupMFA,
    verifyMFA,
    resetMFA,
    deleteMFA
};