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
                else:
                    data = {
                        'dataName': contentKey,
                        'dataContent': contentValue
                    }

        elif type(contentValue) == bytes: # si contentValue = b'bytes'
            data = {
                'dataName': contentKey,
                'dataContent': contentValue.decode(encoding = 'utf-8')
            }

        with open('Xchange.json', "w") as json_file:
            json.dump(data, json_file)
        return "good"
    
    except json.JSONDecodeError or UnboundLocalError as e:
        return {e}
    except:
        return "erreur dans la fonction writeJSON", data

def server():

        # t2 - s'initialise et attend la clé publique ------------------------------------------------------------------
    try:
        kem_serv = oqs.KeyEncapsulation("ML-KEM-768")

        print("attente de client public key")
        data = waitForCorrectInfo("clientPublicKey")

        print("t2 fini")

        # t3 - génère les secrets et les envoie ------------------------------------------------------------------


        ciphertext, shared_secret_server = kem_serv.encap_secret(data['dataContent']) # ya la pubK dedans
        print("ciph+sss générés")

        result = writeJSON("cipher+sss", {"ciphertext": ciphertext, "shared_secret_server": shared_secret_server})
        if result == 'good':
            print("t3 fini")
        else:
            raise customError("writeJSON t3 foiré")
        
        # t6 - reçoit le secret du client et compare les secrets ------------------------------------------------------------------


        data = waitForCorrectInfo("shared_secret_client")

        if shared_secret_server == data['dataContent']['shared_secret_client']:
            return "vérif client réussie", data
    except customError as e:
        print(e)
        return(e)
    except:
        return "erreur dans la func server"

if __name__ == "__main__":
    print(server())