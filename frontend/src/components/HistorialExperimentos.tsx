import { useState } from "react";
import { modelos } from "../data/modelos";
//import { historialResultados } from "../data/resultados";
import type { ResultadoModelo } from "../data/resultados";

interface HistorialExperimentosProps {
  experimentos: ResultadoModelo[];
}

export default function HistorialExperimentos({
  experimentos,
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
        arquitectura y su estado de evaluación.
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
              <th>Fecha</th>
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

              return (
                <tr key={experimento.id}>
                  <td>
                    {modelo?.nombre ??
                      experimento.modeloId}
                  </td>

                  <td>{experimento.version}</td>

                  <td>
                    {experimento.fecha ?? "Sin registrar"}
                  </td>

                  <td>
                    {experimento.estado}
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