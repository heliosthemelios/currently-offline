# Checkers UI

Ce projet est une interface web de dames en HTML/CSS, connectée au moteur de jeu `rapid-draughts` installé localement via `node_modules`.

## Contenu du projet

- `index.html` : page principale de l’interface
- `styles.css` : style du plateau, des pièces et des états visuels
- `script.js` : logique du jeu, interaction utilisateur et appel au moteur installé
- `README.md` : documentation du projet
- `.gitignore` : ignore les dépendances locales comme `node_modules`

## Prérequis

Installez les dépendances avec :

```sh
npm install
```

## Lancer le projet

1. Ouvrez un terminal dans ce dossier.
2. Démarrez un serveur local :

```sh
python3 -m http.server 8000
```

3. Ouvrez ensuite l’adresse suivante dans votre navigateur :

```text
http://127.0.0.1:8000/
```

## Fonctionnement

- Le plateau affiche un damier 8 × 8.
- Les pièces blanches sont jouées par l’utilisateur.
- Les pièces noires jouent automatiquement avec le moteur `rapid-draughts`.
- Les coups valides sont calculés par le moteur réel installé dans `node_modules`.
- La partie peut se terminer avec une victoire d’un joueur ou une nulle, selon l’état renvoyé par le moteur.

## Dépendances

Le projet utilise :

- `rapid-draughts` : moteur de dames
- `npm` : gestion des dépendances locales

Le fichier `.gitignore` évite que Git suive `node_modules` et `package-lock.json`, afin de garder le dépôt propre.

## Note

La version actuelle est fonctionnelle et utilise la logique de jeu réelle du moteur installé, avec une interface graphique simple et interactive.
