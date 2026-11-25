import { useState } from "react";
import { modelos } from "../data/modelos";
import type { ResultadoModelo } from "../data/resultados";
import type { RegistroHistorialEntrenamiento } from "../data/historialEntrenamiento";
import {
  obtenerInfoHistorialExperimento,
  formatearFecha,
} from "../utils/graficaUtils";

interface HistorialExperimentosProps {
  experimentos: ResultadoModelo[];
  historiales?: RegistroHistorialEntrenamiento[];
}

export default function HistorialExperimentos({
  experimentos,
  historiales = [],
}: HistorialExperimentosProps) {
  const [modeloSeleccionado, setModeloSeleccionado] =
    useState("todos");

  const experimentosFiltrados = experimentos.filter(
    (experimento) =>
      modeloSeleccionado === "todos" ||
      experimento.modeloId === modeloSeleccionado
  );

  return (
    <section className="selector-modelos">
      <h3>Historial de experimentos</h3>

      <p>
        Consulta las versiones registradas de cada
        arquitectura, su fecha de importación en IndexedDB y su estado de evaluación.
      </p>

      <div className="historial-filtros">
        <label htmlFor="filtro-modelo">
          Filtrar por arquitectura
        </label>

        <select
          id="filtro-modelo"
          value={modeloSeleccionado}
          onChange={(e) =>
            setModeloSeleccionado(e.target.value)
          }
        >
          <option value="todos">
            Todos los modelos
          </option>

          {modelos.map((modelo) => (
            <option key={modelo.id} value={modelo.id}>
              {modelo.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="historial-tabla-contenedor">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Versión</th>
              <th>Fecha de entrenamiento</th>
              <th>Fecha de importación</th>
              <th>Estado</th>
              <th>Descripción</th>
            </tr>
          </thead>

          <tbody>
            {experimentosFiltrados.map((experimento) => {
              const modelo = modelos.find(
                (item) =>
                  item.id === experimento.modeloId
              );

              const historial = historiales.find(
                (h) => h.modeloId === experimento.modeloId
              );

              const info = obtenerInfoHistorialExperimento(historial);

              return (
                <tr key={experimento.id}>
                  <td>
                    <strong>
                      {modelo?.nombre ?? experimento.modeloId}
                    </strong>
                  </td>

                  <td>{experimento.version}</td>

                  <td>
                    {experimento.fecha
                      ? formatearFecha(experimento.fecha)
                      : "Sin registrar"}
                  </td>

                  <td>
                    {info.fechaImportacion
                      ? formatearFecha(info.fechaImportacion)
                      : "Sin importar"}
                  </td>

                  <td>
                    <span
                      className={`badge-estado ${
                        info.tieneHistorial
                          ? "badge-con-historial"
                          : "badge-pendiente"
                      }`}
                    >
                      {info.estadoCalculado}
                    </span>
                  </td>

                  <td>{experimento.descripcion}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {experimentosFiltrados.length === 0 && (
        <p>No hay experimentos registrados.</p>
      )}
    </section>
  );
}