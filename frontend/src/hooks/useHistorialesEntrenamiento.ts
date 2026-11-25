import { useState, useEffect, useCallback } from "react";
import type { RegistroHistorialEntrenamiento } from "../data/historialEntrenamiento";
import {
  consultarHistoriales,
  guardarHistorial as guardarHistorialDB,
  borrarHistorial as borrarHistorialDB,
} from "../services/storage/indexedDBService";

/**
 * Hook personalizado para consultar, guardar y eliminar historiales de entrenamiento
 * persistidos en el almacén "historiales_entrenamiento" de IndexedDB.
 */
export function useHistorialesEntrenamiento() {
  const [historiales, setHistoriales] = useState<RegistroHistorialEntrenamiento[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar historiales desde IndexedDB al montar
  useEffect(() => {
    let activo = true;

    consultarHistoriales()
      .then((datos) => {
        if (activo) {
          // Deduplicar defensivamente por modeloId conservando el registro más reciente
          const mapaUnicos = new Map<string, RegistroHistorialEntrenamiento>();
          datos.forEach((item) => {
            mapaUnicos.set(item.modeloId, item);
          });
          setHistoriales(Array.from(mapaUnicos.values()));
          setCargando(false);
        }
      })
      .catch((err) => {
        if (activo) {
          console.error("Error al recuperar historiales de entrenamiento de IndexedDB:", err);
          setError("No se pudieron recuperar los historiales guardados.");
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  /**
   * Guarda o reemplaza un historial de entrenamiento en IndexedDB y en el estado.
   * Si ya existe un registro para el mismo modeloId, elimina los duplicados previos en IndexedDB.
   */
  const guardarHistorial = useCallback(
    async (registro: RegistroHistorialEntrenamiento): Promise<boolean> => {
      try {
        const actuales = await consultarHistoriales();
        const duplicados = actuales.filter(
          (h) => h.modeloId === registro.modeloId && h.id !== registro.id
        );
        for (const dup of duplicados) {
          await borrarHistorialDB(dup.id);
        }

        await guardarHistorialDB(registro);
        setHistoriales((anteriores) => {
          const filtrados = anteriores.filter(
            (historial) => historial.modeloId !== registro.modeloId
          );
          return [...filtrados, registro];
        });
        return true;
      } catch (err) {
        console.error("Error al guardar historial en IndexedDB:", err);
        return false;
      }
    },
    []
  );

  /**
   * Elimina un historial de entrenamiento de IndexedDB y del estado por su identificador.
   */
  const eliminarHistorial = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await borrarHistorialDB(id);
        setHistoriales((anteriores) =>
          anteriores.filter((historial) => historial.id !== id)
        );
        return true;
      } catch (err) {
        console.error("Error al eliminar historial de IndexedDB:", err);
        return false;
      }
    },
    []
  );

  return {
    historiales,
    cargando,
    error,
    guardarHistorial,
    eliminarHistorial,
  };
}
