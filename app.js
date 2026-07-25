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

    const possedee = !!exemplaire;

                    console.log("Edition :", edition);

                    

                    html += `
    <div class="edition-bloc ${possedee ? "edition-possedee" : "edition-recherchee"}">

<div class="ligne-edition">

    <span class="badge-eo">
    ${edition.type === "EO" ? '<span class="etoile">⭐</span>&nbsp;' : ''}${edition.type}
</span>

    <span class="date-edition">
        ${edition.dateEdition || "Date ?"}
    </span>

    <span class="cote-edition">
    ${
        ("valeurMin" in edition) && ("valeurMax" in edition)
            ? `${edition.valeurMin} - ${edition.valeurMax} €`
            : ""
    }
</span>

</div>
                    `;

                    if (edition.criteres && edition.criteres.length > 0) {

                        edition.criteres.forEach(c => {

                            html += `
                                <div class="critere">
                                    • ${c}
                                </div>
                            `;

                        });

                    }

                });

                                if (fiche.collection && fiche.collection.length > 0) {

                    fiche.collection.forEach(ex => {

                        html += `
                            <div class="collection">
                                ✓ ${ex.proprietaire} - ${ex.etat}
                            </div>
                            ;
                        `}

    html += `
        </div>
    `;

});

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

    // Bouton retour
    const retour = document.createElement("button");
    retour.textContent = "← Retour";

    retour.onclick = () => {

        const serie = SERIES_DATA.find(s => s.id === album.serie);

        afficherAlbums(serie);

    };

    zoneContenu.appendChild(retour);

    // Titre
    const titre = document.createElement("h2");

    titre.textContent = album.numero + " - " + album.titre;

    zoneContenu.appendChild(titre);

    // Recherche de la fiche
    const serieFiches = FICHES[album.serie];

    if (!serieFiches || !serieFiches[album.id]) {

        const info = document.createElement("p");

        info.innerHTML = "<b>Fiche en cours de création</b>";

        zoneContenu.appendChild(info);

        return;

    }

    const fiche = serieFiches[album.id];

    // ============================
    // Editions
    // ============================

    fiche.editions.forEach(edition => {

        const bloc = document.createElement("div");

        const exemplaire = fiche.collection
    ? fiche.collection.find(ex => ex.edition === edition.type)
    : null;

bloc.className = exemplaire ? "edition possedee" : "edition non-possedee";

        bloc.innerHTML = `
            <h3>${edition.type}</h3>

            <p>
                <b>Date :</b> ${edition.dateEdition || "-"}<br>
                <b>Dépôt légal :</b> ${edition.depotLegal || "-"}<br>
                <b>ISBN :</b> ${edition.isbn || "-"}<br>
                <b>Cote :</b> ${edition.valeurMin} € à ${edition.valeurMax} €
            </p>
        `;

        // Critères

        if (edition.criteres && edition.criteres.length > 0) {

            const ul = document.createElement("ul");

            edition.criteres.forEach(critere => {

                const li = document.createElement("li");

                li.textContent = critere;

                ul.appendChild(li);

            });

            bloc.appendChild(ul);

        }

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