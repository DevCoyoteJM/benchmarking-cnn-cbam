import { useEffect, useState, useCallback } from "react";
import { fusionarExperimento, type ResultadoModelo } from "../data/resultados";
import {
  obtenerExperimentos,
  guardarExperimentos,
} from "../services/storage/localStorageService";

/**
 * Hook personalizado para centralizar la gestión del estado, normalización
 * y persistencia automática de los experimentos en localStorage.
 */
export function useExperimentos() {
  const [experimentos, setExperimentos] = useState<ResultadoModelo[]>(() =>
    obtenerExperimentos()
  );

  // Sincronizar automáticamente en localStorage ante cualquier cambio
  useEffect(() => {
    guardarExperimentos(experimentos);
  }, [experimentos]);

  /**
   * Incorpora uno o múltiples resultados siguiendo la política de upsert seguro:
   * si el registro con el mismo ID ya existe, fusiona los datos preservando la
   * configuración experimental previa no especificada en el archivo importado.
   */
  const importarResultados = useCallback(
    (nuevosResultados: ResultadoModelo[]) => {
      setExperimentos((actuales) => {
        const actualizados = [...actuales];

        nuevosResultados.forEach((nuevo) => {
          const indice = actualizados.findIndex(
            (resultado) => resultado.id === nuevo.id
          );

          if (indice >= 0) {
            actualizados[indice] = fusionarExperimento(
              actualizados[indice],
              nuevo
            );
          } else {
            actualizados.push(nuevo);
          }
        });

        return actualizados;
      });
    },
    []
  );

  /**
   * Actualiza un experimento específico.
   */
  const actualizarExperimento = useCallback(
    (experimentoActualizado: ResultadoModelo) => {
      setExperimentos((actuales) =>
        actuales.map((item) =>
          item.id === experimentoActualizado.id ? experimentoActualizado : item
        )
      );
    },
    []
  );

  /**
   * Actualiza múltiples experimentos de forma unificada en una sola transición de estado,
   * garantizando que todos los experimentos destino se persistan sincrónicamente en localStorage.
   */
  const actualizarMultiplesExperimentos = useCallback(
    (experimentosActualizados: ResultadoModelo[]) => {
      setExperimentos((actuales) => {
        const mapa = new Map(
          experimentosActualizados.map((item) => [item.id, item])
        );
        return actuales.map((item) => mapa.get(item.id) ?? item);
      });
    },
    []
  );

  /**
   * Elimina un experimento por su ID.
   */
  const eliminarExperimento = useCallback((id: string) => {
    setExperimentos((actuales) => actuales.filter((item) => item.id !== id));
  }, []);

  return {
    experimentos,
    importarResultados,
    actualizarExperimento,
    actualizarMultiplesExperimentos,
    eliminarExperimento,
    setExperimentos,
  };
}
