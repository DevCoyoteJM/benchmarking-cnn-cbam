import { modelos } from "../../data/modelos";
import {
  historialResultados,
  normalizarResultadoModelo,
  type ResultadoModelo,
} from "../../data/resultados";

export const CLAVE_ALMACENAMIENTO_EXPERIMENTOS = "pulmovision_experimentos";

/**
 * Valida que un registro deserializado cumpla la estructura esperada de ResultadoModelo.
 */
export function esRegistroExperimentoValido(item: unknown): item is ResultadoModelo {
  if (item === null || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  const registro = item as Record<string, unknown>;

  const tareaValida =
    registro.tarea === undefined ||
    registro.tarea === "clasificacion" ||
    registro.tarea === "segmentacion" ||
    registro.tarea === "sin-especificar";

  const metricasValidas =
    registro.metricas !== null &&
    typeof registro.metricas === "object" &&
    !Array.isArray(registro.metricas) &&
    Object.entries(registro.metricas).every(([clave, valor]) => {
      if (typeof valor !== "number" || !Number.isFinite(valor)) {
        return false;
      }
      if (clave === "mcc") {
        return valor >= -1 && valor <= 1;
      }
      return valor >= 0 && valor <= 1;
    });

  return (
    typeof registro.id === "string" &&
    registro.id.trim().length > 0 &&
    typeof registro.modeloId === "string" &&
    modelos.some((modelo) => modelo.id === registro.modeloId) &&
    typeof registro.version === "string" &&
    registro.version.trim().length > 0 &&
    typeof registro.descripcion === "string" &&
    (registro.fecha === null || typeof registro.fecha === "string") &&
    ["pendiente", "parcial", "finalizado"].includes(String(registro.estado)) &&
    tareaValida &&
    metricasValidas
  );
}

/**
 * Recupera los experimentos almacenados en localStorage.
 * Si no existen o fallan las validaciones, retorna la lista predeterminada normalizada.
 */
export function obtenerExperimentos(): ResultadoModelo[] {
  try {
    const guardados = localStorage.getItem(CLAVE_ALMACENAMIENTO_EXPERIMENTOS);

    if (guardados) {
      const datos: unknown = JSON.parse(guardados);

      if (Array.isArray(datos) && datos.every(esRegistroExperimentoValido)) {
        return datos.map((item) => normalizarResultadoModelo(item));
      }
    }
  } catch (error) {
    console.error("No se pudieron recuperar los experimentos de localStorage:", error);
  }

  return historialResultados.map((resultado) =>
    normalizarResultadoModelo(resultado)
  );
}

/**
 * Guarda la lista completa de experimentos en localStorage.
 * Devuelve true si la operación fue exitosa, o false si ocurrió un error (e.g. cuota excedida).
 */
export function guardarExperimentos(experimentos: ResultadoModelo[]): boolean {
  try {
    localStorage.setItem(
      CLAVE_ALMACENAMIENTO_EXPERIMENTOS,
      JSON.stringify(experimentos)
    );
    return true;
  } catch (error) {
    console.error("No se pudieron guardar los experimentos en localStorage:", error);
    return false;
  }
}
