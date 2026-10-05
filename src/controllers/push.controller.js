import { Push } from "../models/push.model.js";

const createPush = async (req, res) => {
    try {
        const { payload, passphrase, expiration, maxViews, files } = req.body;

        if(!payload && files) {
            // envoi de fichiers
        }

        if(!files && payload) {
            // envoi de plain text classique
        }

        if(passphrase) {
            // ajout de la gestion de passphrase dans la pipeline
        }

        if(!expiration || !maxViews) {
            return res.status(400).json({
                message: "erreur requête API : expiration et/ou vuesMax non reçues"
            });
        }

        const push = await Push.create({
            // les bons contenu du schema en fonction de la structure de la requête reçue 
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        });
    }
}

export {
    createPush
};