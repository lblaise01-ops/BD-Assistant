// ==========================================
// BD Assistant
// Moteur principal
// Version 0.07
// ==========================================

const lettres = [
    "#",
    "A","B","C","D","E","F","G","H","I","J",
    "K","L","M","N","O","P","Q","R","S","T",
    "U","V","W","X","Y","Z"
];

const zoneLettres = document.getElementById("lettres");
const zoneContenu = document.getElementById("contenu");

let SERIES_DATA = [];
let ALBUMS = [];
let FICHES = {};


// ==========================================
// Initialisation
// ==========================================

init();

async function init() {

    await chargerDonnees();

    afficherAlphabet();

}


// ==========================================
// Alphabet
// ==========================================

function afficherAlphabet() {

    zoneLettres.innerHTML = "";

    lettres.forEach(lettre => {

        const bouton = document.createElement("button");

        bouton.textContent = lettre;

        bouton.onclick = () => afficherSeries(lettre);

        zoneLettres.appendChild(bouton);

    });

}

// ==========================================
// Chargement des données
// ==========================================

async function chargerDonnees() {

    console.log("Chargement des séries...");
    const repSeries = await fetch("data/series.json");
    SERIES_DATA = await repSeries.json();

    console.log("Chargement des albums...");

ALBUMS = [];

// Chargement de l'index des séries
const repIndex = await fetch("data/albums/index.json");
const fichiersAlbums = await repIndex.json();

for (const fichier of fichiersAlbums) {

    const rep = await fetch(`data/albums/${fichier}.json`);

    if (!rep.ok) {
        console.warn(`Impossible de charger ${fichier}.json`);
        continue;
    }

    const liste = await rep.json();

    ALBUMS.push(...liste);

}

    console.log("Chargement des fiches...");
    FICHES = {};

    for (const album of ALBUMS) {

        try {

            const rep = await fetch(
    `fiches/${album.serie}/${album.id}.json?v=${Date.now()}`,
    { cache: "no-store" }
);

            if (!rep.ok)
                continue;

            const fiche = await rep.json();

            if (!FICHES[album.serie]) {
                FICHES[album.serie] = {};
            }

            FICHES[album.serie][album.id] = fiche;

        } catch (e) {

    alert(`Erreur ${album.id}\n\n${e.message}`);
    console.error(`Erreur pour ${album.id} :`, e);

}

    }

    console.log(JSON.stringify(FICHES, null, 2));

}


// ==========================================
// Classement alphabétique
// ==========================================

function lettreSerie(nom) {

    let texte = nom.trim();

    texte = texte.replace(/^l['’]/i, "");
    texte = texte.replace(/^les /i, "");
    texte = texte.replace(/^le /i, "");
    texte = texte.replace(/^la /i, "");
    texte = texte.replace(/^un /i, "");
    texte = texte.replace(/^une /i, "");
    texte = texte.replace(/^des /i, "");

    const premiere = texte.charAt(0).toUpperCase();

    if (premiere >= "A" && premiere <= "Z")
        return premiere;

    return "#";

}

// ==========================================
// Affichage des séries
// ==========================================

function afficherSeries(lettre) {

    zoneContenu.innerHTML = "";

    const liste = SERIES_DATA
        .filter(serie => lettreSerie(serie.nom) === lettre)
        .sort((a, b) => a.nom.localeCompare(b.nom));

    if (liste.length === 0) {

        zoneContenu.innerHTML = "<p>Aucune série.</p>";
        return;

    }

    liste.forEach(serie => {

        const carte = document.createElement("div");
        carte.className = "serie";

        carte.innerHTML = `
            <h2>${serie.nom}</h2>
        `;

        carte.onclick = () => afficherAlbums(serie);

        zoneContenu.appendChild(carte);

    });

}

// ==========================================
// Affichage des albums
// ==========================================

function afficherAlbums(serie) {

    zoneContenu.innerHTML = "";

    const albums = ALBUMS
        .filter(a => a.serie === serie.id)
        .sort((a, b) => a.numero.localeCompare(b.numero, undefined, { numeric: true }));

    albums.forEach(album => {

        const bloc = document.createElement("div");
        bloc.className = "album";

        let html = `
            <div class="album-titre">
                <strong>${album.numero} - ${album.titre}</strong>
            </div>
        `;

        const ficheSerie = FICHES[album.serie];

        if (ficheSerie && ficheSerie[album.id]) {

            const fiche = ficheSerie[album.id];

            if (fiche.editions.length === 0) {

                html += `
                    <div class="edition vide">
                        🟩 Fiche en cours de création
                    </div>
                `;

            } else {

                fiche.editions.forEach(edition => {

    const exemplaire = fiche.collection
        ? fiche.collection.find(ex => ex.edition === edition.type)
        : null;

    const recherchee = !exemplaire;

    html += `
        <div class="edition-bloc ${recherchee ? "edition-recherchee" : "edition-possedee"}">

            <div class="ligne-edition">

                <span class="badge-eo">
                    ${edition.type === "EO"
                        ? '<span class="etoile">⭐</span>&nbsp;'
                        : ""}
                    ${edition.type}
                </span>

                <span class="date-edition">
                    ${edition.dateEdition || ""}
                </span>

                <span class="cote-edition">
                    ${
                        (edition.valeurMin !== undefined &&
                         edition.valeurMax !== undefined)
                            ? `${edition.valeurMin} - ${edition.valeurMax} €`
                            : ""
                    }
                </span>

            </div>
    `;

    if (edition.criteres) {

        edition.criteres.forEach(critere => {

            html += `
                <div class="critere">
                    • ${critere}
                </div>
            `;

        });

    }

    if (exemplaire) {

        html += `
            <div class="collection">
                ✓ ${exemplaire.proprietaire} - ${exemplaire.etat}
            </div>
        `;

    }

    html += `
        </div>
    `;

});


                html += `
                    </div>
                `;

            }

        } else {

            html += `
                <div class="edition vide">
                    🟩 Fiche en cours de création
                </div>
            `;

        }

        bloc.innerHTML = html;

// Ouvre la fiche détaillée lorsqu'on clique sur un album
bloc.onclick = () => afficherFiche(album);

zoneContenu.appendChild(bloc);

    });

}


// ==========================================
// Affichage d'une fiche
// ==========================================

function afficherFiche(album) {

    zoneContenu.innerHTML = "";

    // Retour
    const retour = document.createElement("button");
    retour.textContent = "← Retour";

    retour.onclick = () => {

        const serie = SERIES_DATA.find(s => s.id === album.serie);
        afficherAlbums(serie);

    };

    zoneContenu.appendChild(retour);

    // Titre

    const titre = document.createElement("h2");
    titre.textContent = `${album.numero} - ${album.titre}`;
    zoneContenu.appendChild(titre);

    const fiche = FICHES?.[album.serie]?.[album.id];

    if (!fiche) {

        zoneContenu.innerHTML += `
            <p><b>Fiche en cours de création</b></p>
        `;

        return;

    }

    fiche.editions.forEach(edition => {

        const exemplaire = fiche.collection
            ? fiche.collection.find(ex => ex.edition === edition.type)
            : null;

        const recherchee = !exemplaire;

        const bloc = document.createElement("div");

        bloc.className =
            `edition-bloc ${recherchee ? "edition-recherchee" : "edition-possedee"}`;

        let html = `

            <div class="ligne-edition">

                <span class="badge-eo">

                    ${edition.type === "EO"
                        ? '<span class="etoile">⭐</span>&nbsp;'
                        : ""}

                    ${edition.type}

                </span>

                <span class="date-edition">

                    ${edition.dateEdition || ""}

                </span>

                <span class="cote-edition">

                    ${(edition.valeurMin !== undefined &&
                      edition.valeurMax !== undefined)

                        ? `${edition.valeurMin} - ${edition.valeurMax} €`

                        : ""}

                </span>

            </div>

        `;

        if (edition.criteres) {

            edition.criteres.forEach(critere => {

                html += `
                    <div class="critere">
                        • ${critere}
                    </div>
                `;

            });

        }

        if (exemplaire) {

            html += `
                <div class="collection">
                    ✓ ${exemplaire.proprietaire} - ${exemplaire.etat}
                </div>
            `;

        }

        bloc.innerHTML = html;

        zoneContenu.appendChild(bloc);

    });

}

// ==========================================
// Fonctions utilitaires
// ==========================================

function trouverSerie(idSerie) {

    return SERIES_DATA.find(serie => serie.id === idSerie);

}

function trouverAlbum(idAlbum) {

    return ALBUMS.find(album => album.id === idAlbum);

}

function ficheExiste(album) {

    if (!FICHES[album.serie])
        return false;

    return FICHES[album.serie][album.id] !== undefined;

}


// ==========================================
// Version
// ==========================================

console.log("BD Assistant V0.07 chargé");