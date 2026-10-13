import { modelos } from "../data/modelos";
//import { historialResultados } from "../data/resultados";
import type { ResultadoModelo } from "../data/resultados";

interface SelectorVersionesProps {
  modelosSeleccionados: string[];
  versionesSeleccionadas: Record<string, string>;
  cambiarVersion: (modeloId: string, experimentoId: string) => void;
  experimentos: ResultadoModelo[];
}

export default function SelectorVersiones({
  modelosSeleccionados,
  versionesSeleccionadas,
  cambiarVersion,
  experimentos,
}: SelectorVersionesProps) {
  const modelosActivos = modelos.filter((modelo) =>
    modelosSeleccionados.includes(modelo.id)
  );

  return (
    <section className="selector-modelos">
      <h3>Seleccionar versiones de experimentos</h3>

      <p>
        Elige la versión de cada arquitectura que deseas
        utilizar en la comparación.
      </p>

      <div className="selector-modelos-grid">
        {modelosActivos.map((modelo) => {
          const versiones = experimentos.filter(
          (resultado) => resultado.modeloId === modelo.id
          );

          return (
            <div className="selector-version-item" key={modelo.id}>
              <label htmlFor={`version-${modelo.id}`}>
                {modelo.nombre}
              </label>

              <select
                id={`version-${modelo.id}`}
                value={
                  versionesSeleccionadas[modelo.id] ??
                  versiones[versiones.length - 1]?.id ??
                  ""
                }
                onChange={(e) =>
                  cambiarVersion(modelo.id, e.target.value)
                }
              >
                {versiones.length === 0 && (
                  <option value="">Sin versiones registradas</option>
                )}

                {versiones.map((version) => (
                  <option key={version.id} value={version.id}>
                    Versión {version.version} — {version.estado}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {modelosActivos.length === 0 && (
        <p>Selecciona primero un modelo para consultar sus versiones.</p>
      )}
    </section>
  );
}