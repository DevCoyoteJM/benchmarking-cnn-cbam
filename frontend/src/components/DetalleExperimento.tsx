import { useState } from "react";
import { modelos } from "../data/modelos";
import type { ResultadoModelo } from "../data/resultados";

interface DetalleExperimentoProps {
  experimentos: ResultadoModelo[];
}

export default function DetalleExperimento({
  experimentos,
}: DetalleExperimentoProps) {
  const [experimentoId, setExperimentoId] = useState("");

  const experimento =
    experimentos.find((item) => item.id === experimentoId) ??
    experimentos[0];

  const modelo = modelos.find(
    (item) => item.id === experimento?.modeloId
  );

  const configuracion = experimento?.configuracion;

  const mostrarValor = (
    valor: string | number | undefined
  ) => {
    return valor === undefined || valor === ""
      ? "No registrado"
      : String(valor);
  };

  return (
    <section className="selector-modelos">
      <h3>Ficha técnica del experimento</h3>

      <p>
        Consulta la configuración de entrenamiento y los
        archivos de referencia de cada versión.
      </p>

      {experimentos.length === 0 ? (
        <p>No hay experimentos registrados.</p>
      ) : (
        <>
          <div className="historial-filtros">
            <label htmlFor="detalle-experimento">
              Seleccionar experimento
            </label>

            <select
              id="detalle-experimento"
              value={experimento?.id ?? ""}
              onChange={(e) =>
                setExperimentoId(e.target.value)
              }
            >
              {experimentos.map((item) => {
                const nombreModelo = modelos.find(
                  (modelo) => modelo.id === item.modeloId
                )?.nombre;

                return (
                  <option key={item.id} value={item.id}>
                    {nombreModelo ?? item.modeloId} —
                    Versión {item.version}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="detalle-experimento-grid">
            <div>
              <span>Modelo</span>
              <strong>
                {modelo?.nombre ?? "No registrado"}
              </strong>
            </div>

            <div>
              <span>Versión</span>
              <strong>{experimento?.version}</strong>
            </div>

            <div>
              <span>Dataset</span>
              <strong>
                {mostrarValor(configuracion?.dataset)}
              </strong>
            </div>

            <div>
              <span>Framework</span>
              <strong>
                {mostrarValor(configuracion?.framework)}
              </strong>
            </div>

            <div>
              <span>Épocas</span>
              <strong>
                {mostrarValor(configuracion?.epocas)}
              </strong>
            </div>

            <div>
              <span>Batch size</span>
              <strong>
                {mostrarValor(configuracion?.batchSize)}
              </strong>
            </div>

            <div>
              <span>Learning rate</span>
              <strong>
                {mostrarValor(configuracion?.learningRate)}
              </strong>
            </div>

            <div>
              <span>Optimizador</span>
              <strong>
                {mostrarValor(configuracion?.optimizador)}
              </strong>
            </div>

            <div>
              <span>Función de pérdida</span>
              <strong>
                {mostrarValor(configuracion?.funcionPerdida)}
              </strong>
            </div>

            <div>
              <span>División de datos</span>
              <strong>
                {mostrarValor(configuracion?.divisionDatos)}
              </strong>
            </div>

            <div>
              <span>Hardware</span>
              <strong>
                {mostrarValor(configuracion?.hardware)}
              </strong>
            </div>

            <div>
              <span>Notebook (.ipynb)</span>
              <strong>
                {mostrarValor(configuracion?.archivoNotebook)}
              </strong>
            </div>

            <div>
              <span>Documento PDF</span>
              <strong>
                {mostrarValor(configuracion?.archivoPDF)}
              </strong>
            </div>
          </div>

          <div className="detalle-observaciones">
            <h4>Observaciones</h4>
            <p>
              {mostrarValor(configuracion?.observaciones)}
            </p>
          </div>
        </>
      )}
    </section>
  );
}