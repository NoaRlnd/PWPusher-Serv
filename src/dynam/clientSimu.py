import oqs
import json
import time
import asyncio

class customError(Exception):
    pass

def bytes2string(aDict):
    for k in aDict.keys():
        aDict[k] = aDict[k].decode('utf-8')
    return aDict

def string2bytes(aDict): # aDict = {"clé": bytes, "clé": bytes}
    for k in aDict.keys():
        aDict[k] = bytes(aDict[k], 'utf-8')
    return aDict

def waitForCorrectInfo(dataName):
    try:
        data = checkContent()
        while data["dataName"] != dataName:
            data = checkContent()
        return data
    except:
        return "erreur au moment de lancer checkContent depuis waitForC"

def checkContent():
    try:
        data = readJSON()
        while not data:
            if len(data) < 2 or type(data) != dict:
                raise customError("mauvaise structure de données lues dans Xchange.json : ", {data})
            else:
                data = readJSON()
                time.sleep(2)
        return data
    except:
        return "erreur au moment de lancer readJSON depuis checkContent"


def readJSON():
    try:
        with open('Xchange.json', "r") as json_file:
            data = json.load(json_file)
            if len(data['dataContent']) < 2:
                data['dataContent'] = bytes(data['dataContent'], 'utf-8')
            else:
                data['dataContent'] = string2bytes(data['dataContent'])
        return data
    except json.JSONDecodeError as e:
        return {e}

def writeJSON(contentKey, contentValue): # mais pk j'ai appelé ça contentKey ?? je suis complètement ravagé
    try:
        if type(contentValue) == str: # si contentValue = "string"
            data = {
                'dataName': contentKey,
                'dataContent': contentValue 
            }

        elif type(contentValue) == dict: # si contentValue = {"clé": "valeur", "clé": "valeur"}
            for v in contentValue.keys():
                if type(contentValue[v]) == bytes:
                    data = {
                        'dataName': contentKey,
                        'dataContent': bytes2string(contentValue)
                    }
                    break
                else:
                    data = {
                        'dataName': contentKey,
                        'dataContent': contentValue
                    }
                    break

        elif type(contentValue) == bytes: # si contentValue = b'bytes'
            data = {
                'dataName': contentKey,
                'dataContent': contentValue.decode(encoding = 'utf-8')
            }

        with open(file = 'Xchange.json', mode = "w") as json_file:
            json.dump(obj = data, fp = json_file)
        return "good"
    
    except json.JSONDecodeError or UnboundLocalError as e:
        return {e}
    except:
        return "erreur dans la fonction writeJSON", data

def client():

    # t1 - initialise et envoie la clé publique ------------------------------------------------------------------
    try:

        print("début")
        kem_client = oqs.KeyEncapsulation("ML-KEM-768")
        print("KEM initialisé")

        public_key_client = kem_client.generate_keypair()
        print("key pair générée")

        # writeJSON marche pas
        result = writeJSON("clientPublicKey", public_key_client)
        if result == "good":
            print("t1 fini")
        else:
            raise customError("writeJSON t1 foiré", result)

        # t4 - génère les secrets et les envoie ------------------------------------------------------------------


        data = waitForCorrectInfo("cipher+sss") # data = {"dataName": "cipher+sss", "dataContent": {"ciphertext": ciphertext, "shared_secret_server": shared_secret_server}}

        shared_secret_client = kem_client.decap_secret(data['dataContent']['ciphertext']) # cipher du serv

        # t5 - reçoit le secret du client et compare les secrets ------------------------------------------------------------------


        writeJSON("shared_secret_client", shared_secret_client)

        if data['dataContent']["shared_secret_server"] == shared_secret_client:
            return "vérif client réussie", data

    except customError as e:
        print(e)
        return(e)


if __name__ == "__main__":
    print(client())
