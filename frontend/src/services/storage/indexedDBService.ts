import type { Evidencia } from "./storageTypes";
import type { RegistroHistorialEntrenamiento } from "../../data/historialEntrenamiento";

const DB_NAME = "pulmovision_evidencias";
const DB_VERSION = 2; // Versión incrementada para incorporar historiales_entrenamiento

export const STORE_ARCHIVOS = "archivos";
export const STORE_HISTORIALES = "historiales_entrenamiento";

export const EXPERIMENTOS_CANONICOS = [
  "unet-v1",
  "unet-cbam-v1",
  "modcbam-v1",
  "transunet-v1",
];

/**
 * Determina si el nombre de archivo corresponde al notebook benchmark
 * que integra el desarrollo y entrenamiento de las cuatro arquitecturas.
 */
export function esNombreNotebookCompartido(nombre: string): boolean {
  if (!nombre) return false;
  const n = nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    n.includes("lidcidrc") ||
    (n.includes("cbam") && n.includes("transformer")) ||
    n.includes("modifiedcbam")
  );
}

/**
 * Verifica si una evidencia está asociada a un experimento específico,
 * soportando tanto la clave única original (experimentoId) como la relación
 * múltiple (experimentoIds).
 */
export function esEvidenciaAsociada(
  evidencia: Evidencia,
  experimentoId: string
): boolean {
  if (evidencia.experimentoId === experimentoId) {
    return true;
  }
  if (Array.isArray(evidencia.experimentoIds)) {
    return evidencia.experimentoIds.includes(experimentoId);
  }
  return false;
}

/**
 * Abre o migra la base de datos IndexedDB garantizando la coexistencia de ambos almacenes.
 */
export function abrirBaseDatos(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const solicitud = indexedDB.open(DB_NAME, DB_VERSION);

    solicitud.onupgradeneeded = () => {
      const db = solicitud.result;

      // Almacén 1: Archivos PDF y Notebooks (se preserva intacto si ya existía en versión 1)
      if (!db.objectStoreNames.contains(STORE_ARCHIVOS)) {
        db.createObjectStore(STORE_ARCHIVOS, {
          keyPath: "id",
        });
      }

      // Almacén 2: Historiales de entrenamiento por época (incorporado en versión 2)
      if (!db.objectStoreNames.contains(STORE_HISTORIALES)) {
        const storeHistoriales = db.createObjectStore(STORE_HISTORIALES, {
          keyPath: "id",
        });
        storeHistoriales.createIndex("modeloId", "modeloId", { unique: false });
      }
    };

    solicitud.onsuccess = () => resolve(solicitud.result);

    solicitud.onerror = () =>
      reject(
        solicitud.error ??
          new Error("Error al abrir la base de datos IndexedDB")
      );
  });
}

/* =========================================================================
 * GESTIÓN DE EVIDENCIAS (PDF / Notebooks IPYNB)
 * ========================================================================= */

/**
 * Recupera todas las evidencias guardadas en el almacén de archivos.
 * Normaliza las evidencias compartidas para garantizar que sus asociaciones
 * a los cuatro experimentos estén disponibles en memoria.
 */
export async function consultarEvidencias(): Promise<Evidencia[]> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(STORE_ARCHIVOS, "readonly");
    const solicitud = transaccion.objectStore(STORE_ARCHIVOS).getAll();

    solicitud.onsuccess = () => {
      const lista = ((solicitud.result as Evidencia[]) || []).map((evidencia) => {
        if (
          evidencia.tipo === "ipynb" &&
          esNombreNotebookCompartido(evidencia.nombre)
        ) {
          const idsActuales = evidencia.experimentoIds || [evidencia.experimentoId];
          const faltaAlguno = EXPERIMENTOS_CANONICOS.some(
            (id) => !idsActuales.includes(id)
          );
          if (faltaAlguno || !evidencia.esCompartida) {
            return {
              ...evidencia,
              experimentoIds: [...EXPERIMENTOS_CANONICOS],
              esCompartida: true,
            };
          }
        }
        return evidencia;
      });
      resolve(lista);
    };

    solicitud.onerror = () =>
      reject(
        solicitud.error ??
          new Error("Error al consultar evidencias en IndexedDB")
      );

    transaccion.oncomplete = () => db.close();
    transaccion.onabort = () => db.close();
  });
}

/**
 * Migración segura y transparente: actualiza en IndexedDB cualquier evidencia
 * que sea el notebook benchmark compartido para que guarde formalmente
 * `experimentoIds` con los 4 identificadores y `esCompartida: true`,
 * sin alterar el Blob original ni duplicar registros.
 */
export async function asegurarEvidenciasCompartidas(): Promise<void> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(STORE_ARCHIVOS, "readwrite");
    const store = transaccion.objectStore(STORE_ARCHIVOS);
    const solicitud = store.getAll();

    solicitud.onsuccess = () => {
      const lista = (solicitud.result as Evidencia[]) || [];
      lista.forEach((evidencia) => {
        if (
          evidencia.tipo === "ipynb" &&
          esNombreNotebookCompartido(evidencia.nombre)
        ) {
          const idsActuales = evidencia.experimentoIds || [evidencia.experimentoId];
          const faltaAlguno = EXPERIMENTOS_CANONICOS.some(
            (id) => !idsActuales.includes(id)
          );
          if (faltaAlguno || !evidencia.esCompartida) {
            evidencia.experimentoIds = [...EXPERIMENTOS_CANONICOS];
            evidencia.esCompartida = true;
            store.put(evidencia);
          }
        }
      });
    };

    transaccion.oncomplete = () => {
      db.close();
      resolve();
    };

    transaccion.onerror = () => {
      db.close();
      reject(transaccion.error ?? new Error("Error al asegurar evidencias compartidas"));
    };

    transaccion.onabort = () => db.close();
  });
}

/**
 * Guarda o actualiza una evidencia en el almacén de archivos.
 */
export async function guardarEvidencia(evidencia: Evidencia): Promise<void> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(STORE_ARCHIVOS, "readwrite");
    transaccion.objectStore(STORE_ARCHIVOS).put(evidencia);

    transaccion.oncomplete = () => {
      db.close();
      resolve();
    };

    transaccion.onerror = () => {
      reject(
        transaccion.error ??
          new Error("Error al guardar la evidencia en IndexedDB")
      );
    };

    transaccion.onabort = () => db.close();
  });
}

/**
 * Elimina una evidencia por su identificador único.
 */
export async function borrarEvidencia(id: string): Promise<void> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(STORE_ARCHIVOS, "readwrite");
    transaccion.objectStore(STORE_ARCHIVOS).delete(id);

    transaccion.oncomplete = () => {
      db.close();
      resolve();
    };

    transaccion.onerror = () => {
      reject(
        transaccion.error ??
          new Error("Error al eliminar la evidencia de IndexedDB")
      );
    };

    transaccion.onabort = () => db.close();
  });
}

/* =========================================================================
 * GESTIÓN DE HISTORIALES DE ENTRENAMIENTO (Métricas por época)
 * ========================================================================= */

/**
 * Recupera todos los historiales de entrenamiento registrados.
 */
export async function consultarHistoriales(): Promise<RegistroHistorialEntrenamiento[]> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(STORE_HISTORIALES, "readonly");
    const solicitud = transaccion.objectStore(STORE_HISTORIALES).getAll();

    solicitud.onsuccess = () =>
      resolve(solicitud.result as RegistroHistorialEntrenamiento[]);

    solicitud.onerror = () =>
      reject(
        solicitud.error ??
          new Error("Error al consultar historiales en IndexedDB")
      );

    transaccion.oncomplete = () => db.close();
    transaccion.onabort = () => db.close();
  });
}

/**
 * Guarda o actualiza un registro de historial de entrenamiento.
 */
export async function guardarHistorial(
  historial: RegistroHistorialEntrenamiento
): Promise<void> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(STORE_HISTORIALES, "readwrite");
    transaccion.objectStore(STORE_HISTORIALES).put(historial);

    transaccion.oncomplete = () => {
      db.close();
      resolve();
    };

    transaccion.onerror = () => {
      reject(
        transaccion.error ??
          new Error("Error al guardar el historial en IndexedDB")
      );
    };

    transaccion.onabort = () => db.close();
  });
}

/**
 * Elimina un registro de historial de entrenamiento por su identificador.
 */
export async function borrarHistorial(id: string): Promise<void> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(STORE_HISTORIALES, "readwrite");
    transaccion.objectStore(STORE_HISTORIALES).delete(id);

    transaccion.oncomplete = () => {
      db.close();
      resolve();
    };

    transaccion.onerror = () => {
      reject(
        transaccion.error ??
          new Error("Error al eliminar el historial de IndexedDB")
      );
    };

    transaccion.onabort = () => db.close();
  });
}
