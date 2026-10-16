// Regroupe les constantes utilisées par la configuration de l'application.
export const DB_NAME = "TestBackend";

export function sessionCheck(S_ID, SS_IDs) { // S_ID = session id du current user | SS_IDs = les sessions du session store

    Object.keys(SS_IDs).every(key => { // c'est bien dla merde pcq si tu veux faire un return d'ici  
                                         // ça marche juste pour le bloc et pas pour la fonction
        if(key == S_ID) {
            S_ID = "good";
            return false;
        }
        return true;
    });

    if(S_ID == "good") return "good";
    else {
        return { statusCode: 400, message: "user pas identifiable ou non connecté, reconnectez-vous" };
    }
}