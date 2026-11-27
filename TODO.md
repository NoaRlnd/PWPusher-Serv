# PWPusher Serv

comprends serv-API, serv-AA, MFA, key gen et BDD (logs aussi ?)

### Portail ID et Front-end

- [ ] auth et MFA  
  - [ ] ajout de secrets de récupération  
  - [ ] gestion des secrets de récupération  
  - [ ] ajouter automatiquement les token reçus par les serveurs aux requêtes suivantes à travèrs le front-end  

### Back-end

- [ ] logique BDD finie  
  - [ ] mettre httpOnly et sameSite cookies  
  - [ ] ajouter une fonction unix pour les champs exp dans les tokens  
  - [ ] passer tout en post-qantum  
  - [ ] vérifier que les SID changent bien après chaque auth  
  - [x] évoluer le hashing de mdp vers argon2 (depuis bcrypt)  
  - [ ] mettre en place des échanges de token crsf  
  - [ ] cacher des headers entre les requêtes (ex : X-powered-by)  
  - [ ] trouver un issuer valide pour les tokens  
  - [ ] ajouter aud et mettre une logique de vérif dérrière iss, role et aud dans les tokens  
  - [ ] chiffrer les tokens avant de les envoyer au client (JWE)  
  - [ ] ajouter une manière de changer la clé publique du client en même temps que les access tokens se font rafraîchir  
  - [ ] faire un script de rotation de clé publique
  - [ ] avoir un serveur AA et le serv de l'API
  - [ ] logging avancé doit être implémenté correctement et accessible aux bonnes personnes (ReBAC pour le coup), et être analysé automatiquement pour être prévenu si ya un soucis  
    - [ ] events classiques : logins, failed logins, transactions pertinentes...
    - [ ] erreurs et warnings
    - [ ] backup des logs
    - [ ] éventuellement, faire des honeypots loggés pour voir quand ya une attaque
    - [ ] logger les erreur de run de code

  - [ ] avant de register un compte, valider les crédentiels avec une liste de crédentiels compromis (ex : haveibeenpwned.com)
  - [ ] les données doivent être correctement supprimées quand on a fini avec elles
  - [ ] implémenter versionning et vérif de push avec signature digitale
  - [ ] set up les crit et AAD de JOSE pour check les tokens correctement
  - [ ] trouver une meilleure solution que le json pour échanges entre py et js  

### déploi du code source

- [ ] code prêt à l'envoi  
  - [ ] solution pour générer un .env  
  - [ ] solution pour générer les paire de clés  
  - [ ] process qui permet de vérifier l'éfficacité des paramètrages de l'appli. algos buggy, API bearers invalides, incompatibilités de protocols (tls1.3 invalable...)  
- [ ] readme complet  
- [ ] clear les packages useless  
- [ ] pousser par x moyens l'utilisation de gestionnaires de MDP  
- [ ] coder un espace de gestion admin pour gérer les utilisateurs (changer mdp, supprimer users, accéder aux codes de récupération MFA...) (en vrai c'est un peu une backdoor non ?)  
- [ ] version control. le code doit être versionné, tout en soyant revertible  
- [ ] déployer une page 'https://--YOUR DOMAIN----/.well-known/jwks.json' ou il y aura les JWKs
- [ ] vérif si t'as vraiment besoin de gitignore le .venv
- [ ] rajouter une implémentation/template loop ou P-Automate pour afficher le timer d'expiration des liens dans les solutions microsoft
- [ ] ajouter un WAF

### objectif de vesqui trucs bizarres/risques à contrer

- [ ] énumération de compte. si pwpusher te révèle quand l'utilisateur est inconnu ou si le mdp est incorrect ça donne trop d'infos.  
- [ ] botproofness. CAPTCHA ?, limitation de débit ? WAF obligé  
- [ ] faiblesse mémoire en tous genres. coder l'app client-lourd en rust ? assebly ? autre solution foireuse ?  
- [ ] access control (ou IAM en général). PoLP, SoD, RBAC inférieur à attribute ou relationship based, stateful access mal gérés, web server directory listing...  
- [ ] valider les permissions à chaque requêtes/étapes. même si la requête est initiée par les serveur ou x truc bizarres  
- [ ] dissimuler les ID (UID, OID, PID...). contrairement à ce que tout le monde dit c'est des données sensibles, donc doit cacher (acccessoirement, ne pas mettre dans l'URL).  
- [ ] errors and privileges handling, chaque sorties doit pouvoir être prédite et préconçue pour éviter les surprises.  
- [ ] surconfiance JWT. même sur un JWT signé, un compte admin peut avoir été désac ou changé de rôle. toujours revérifier les états des users/champs JWT  
- [ ] réduire les constantes dans le code. essai de use des fichiers .ini au lieu de hard-coder des constantes, et sécu les accès aux fichiers .ini (check les .ini avant de valider)  
- [ ] bloquer les mots de passe faibles. typiquement : "Password1!", "admin1234!", "123456789...."  
- [ ] récupération de MDP. à faire de manière sécure depuis l'admin  
- [ ] accès et cohérence des logs, dissimuler certains logs, immuabilitée et résilience, flux de logs vers l'admin, commission et décommision des données gérées  
