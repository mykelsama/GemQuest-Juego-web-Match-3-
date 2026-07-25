import bosqueCristalino from "../gems/fondo_bosque_cristalino.png";
import cuevaRubies from "../gems/fondo_cueva_de_rubies.png";
import temploObsidiana from "../gems/fondo_templo_de_obsidiana.png";

/** Mapa de identificador de nivel a su imagen de fondo. */
export const levelBackgrounds: Record<number, string> = {
    1: bosqueCristalino,
    2: cuevaRubies,
    3: temploObsidiana
};

/** Devuelve la imagen de fondo asociada a un nivel; usa nivel 1 como fallback. */
export function getLevelBackground(levelId: number): string {
    return levelBackgrounds[levelId] ?? levelBackgrounds[1];
}
