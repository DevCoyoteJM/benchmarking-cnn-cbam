import type { ResultadoModelo } from "../data/resultados";

/**
 * Obtiene la versión seleccionada de un modelo según las preferencias del usuario,
 * o la última versión registrada si no hay ninguna explícitamente seleccionada.
 *
 * Centraliza la lógica para evitar duplicaciones entre ComparacionModelos y GraficaComparacion.
 */
export function obtenerResultadoSeleccionado(
  modeloId: string,
  versionesSeleccionadas: Record<string, string>,
  experimentos: ResultadoModelo[]
): ResultadoModelo | undefined {
  const versiones = experimentos.filter(
    (resultado) => resultado.modeloId === modeloId
  );

  if (versiones.length === 0) {
    return undefined;
  }

  const idSeleccionado = versionesSeleccionadas[modeloId];

  if (idSeleccionado) {
    const resultadoSeleccionado = versiones.find(
      (version) => version.id === idSeleccionado
    );

    if (resultadoSeleccionado) {
      return resultadoSeleccionado;
    }
  }

  return versiones[versiones.length - 1];
}
