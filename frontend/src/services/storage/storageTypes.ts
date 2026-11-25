import type { ResultadoModelo } from "../../data/resultados";
import type { RegistroHistorialEntrenamiento } from "../../data/historialEntrenamiento";

/**
 * Representa un archivo adjunto (PDF o Jupyter Notebook)
 * asociado a un experimento y almacenado en IndexedDB.
 */
export interface Evidencia {
  id: string;
  experimentoId: string;
  experimentoIds?: string[];
  esCompartida?: boolean;
  nombre: string;
  tipo: string;
  fecha: string;
  archivo: Blob;
}

export type { ResultadoModelo, RegistroHistorialEntrenamiento };
