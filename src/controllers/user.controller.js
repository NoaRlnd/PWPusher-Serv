import { sessionCheck } from "../config/constants.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";

const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body; 

        if (!email || !password) {
            return res.status(400).json({ message: "les 2 champs n'ont pas été reçus"});
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "user existe déjà" });
        }

        //ù vérification synthaxe email (pcq tout est accepté là) sinon mise en place d'un pré-register en t'envoie un mail avec un lien de vérification (mieux)

        const user = await User.create({
            email: email.toLowerCase(),
            password,
        });

        res.status(201).json({
            message: "user enregistré",
            user: { id: user._id, email: user.email}
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }
};

const authStatus = async (req, res) => {

    try {

        const result = sessionCheck(req.session.id, req.sessionStore.sessions);
        if(result !== "good") {
            return res.status(result.statusCode).json({
                message: result.message,
            });
        }

        let APIkeyOn = true;
        if(!req.session.user.APIkey) {
            APIkeyOn = false;
        }

        res.status(200).json({
            message: "user connecté",
            request_session_ID: req.session.id,
            MFAon: req.session.user.MFA,
            APIkeyOn: APIkeyOn, 
        });
        
    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }
};

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

        // mettre dans session.user seulement l'essentiel
        req.session.user = user; // dans session.user il y a : user: { _id: new ObjectId('6ac...'), password: 'le mdp en argon2', email: 'email', MFA: false, createdAt: format heure, updatedAt: format heure, __v: 0}
        req.session.visited = true;

        // envoie le cookie max age (qui sert à rien btw)
        res.cookie("maxAge", "5minutes", { maxAge: 60000 * 5, signed: true});

        res.status(200).json({
            message: "user connecté",
            user: {
                id: req.session.user._id,
                email: req.session.user.email,
                MFA: req.session.user.MFA,
                debug: req.session
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }
};

const logoutUser = async (req, res) => { // req.session contient "cookie" + "user" + "visited"
    try {

        if (!req.session) return res.status(404).json({ // étrangement ya toujours une session en cours mais bon...
            message: "aucune session en cours"
        });

        await req.session.destroy()
        if (req.session) {
            throw (`la suppression de session à échouée : ${req.session}`)
        }
        
        res.status(200).json({
            message: "user déconnecté",
            proof: req.session || "session empty"
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }
};

const deleteUser = async (req, res) => {
    try {

        const result = sessionCheck(req.session.id, req.sessionStore.sessions);
        if(result !== "good") {
            return res.status(result.statusCode).json({
                message: result.message,
            });
        }

        const { email, password } = req.body;

        //--------------------||||||||||||--------------------

        if(!email || !password) return res.status(400).json({
            message: "il manque un des 2 champs"
        });

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if(!user) return res.status(404).json({
            message: "user pas trouvé",
        });

        let anteDelete;
        if(user.MFA == false) {
            await user.deleteOne();
            anteDelete = {message: "user supprimé", statusCode: 200 };
        }
        else {
            anteDelete = {message: "crédentiels validés, redirection pour la suppression en cours", statusCode: 303 }; //ù MFA check + ajout d'un champs : "..., uri: https://...}" pour rediriger avec le front-end 
        }

        return res.status(anteDelete.statusCode).json({
            message: anteDelete.message,
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }
}

const generateApiKey = async (req, res) => {
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

        if(!user) throw ('session vérifiée mais utilisateur innexistant ??');

        //--------------------||||||||||||--------------------

        if(user.APIkey) return res.status(409).json({
            message: "vous possédez déjà une clé API",
        });

        function generateApiKeyBase64(length = 48) {
            return crypto.randomBytes(length)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        };
        
        const apiKey = generateApiKeyBase64(48);

        await user.updateOne({APIkey: apiKey}); // c'est pas censé marcher du tout mais ça marche ? wtf ?
        
        res.status(200).json({
            message: "clé API générée",
            APIkey: apiKey,
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }
};

const checkApiInfo = async (req, res) => {
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

        //--------------------||||||||||||--------------------

        if(!user || !user.APIkey) return res.status(404).json({
            message: "user pas trouvé, ou clé innexistante"
        });
        
        res.status(200).json({
            message: "voici votre clé",
            APIkey: user.APIkey,
        });
        
    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }
};

const deleteApiKey = async (req, res) => { // marche pas pcq ma tourmente n'est qu'un passe temps pour l'indexe

    try {

        const { email, password } = req.body;

        const result = sessionCheck(req.session.id, req.sessionStore.sessions);
        if(result !== "good") {
            return res.status(result.statusCode).json({
                message: result.message,
            });
        }

        //--------------------||||||||||||--------------------

        if(!email || !password) return res.status(400).json({
            message: "il manque un des 2 champs"
        });

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if(!user) throw ('session vérifiée mais utilisateur innexistant ??');

        let anteDelete;
        if(user.MFA == false) {
            await User.updateOne({ _id: req.session.user._id }, { $unset: { APIkey: "" }})
            anteDelete = {message: "clé supprimée", statusCode: 200 };
        }
        else {
            anteDelete = {message: "crédentiels validés, redirection pour la suppression en cours", statusCode: 303 }; // add vérif MFA
        }

        res.status(anteDelete.statusCode).json({
            message: anteDelete.message,
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error",
            error: error || "error",
        });
    }

}

// ajouter delete key

export {
    registerUser,
    authStatus,
    loginUser,
    logoutUser,
    deleteUser,
    generateApiKey,
    checkApiInfo,
    deleteApiKey
};