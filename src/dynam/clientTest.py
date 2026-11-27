import oqs
import json
import time

# Initialize ML-KEM-768
kem = oqs.KeyEncapsulation("ML-KEM-768")

# Recipient generates key pair
public_key = kem.generate_keypair()
print(f"Public key size: {len(public_key)} bytes")

# encapsuler l'octet en string
str_public_key = f"{public_key}"

# envoie public_key
with open(file = 'Xchange.json', mode = "w") as json_file:
    json.dump(obj = str_public_key, fp = json_file)

# ------------------------ fin t1

print("sleep start")
time.sleep(15)
print("sleep end")

# reçoit ciphertext et sss
with open('Xchange.json', "r") as json_file:
    data = json.load(json_file)

# Recipient decapsulates to get the same shared secret
shared_secret_recipient = kem.decap_secret(data['ciphertext']) # ciphertext

# Verify they match
assert data['shared_secret_sender'] == shared_secret_recipient
print("Key exchange successful!")
print(f"Shared secret: {data['shared_secret_sender'].hex()[:32]}...")

# ------------------------ fin t3