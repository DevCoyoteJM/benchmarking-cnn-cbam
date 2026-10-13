
import { FlaskConical, Info } from "lucide-react";
import { useEffect, useState } from "react";

import { modelos } from "../data/modelos";
import {
  historialResultados,
  type ResultadoModelo,
} from "../data/resultados";

import GraficaComparacion from "../components/GraficaComparacion";
import HistorialExperimentos from "../components/HistorialExperimentos";
import SelectorVersiones from "../components/SelectorVersiones";
import ImportarResultados from "../components/ImportarResultados";
import ExportarResultados from "../components/ExportarResultados";
import DetalleExperimento from "../components/DetalleExperimento";
import EvidenciasExperimento from "../components/EvidenciasExperimento";

type PestanaComparacion =
  | "comparacion"
  | "experimentos"
  | "evidencias"
  | "datos";

const CLAVE_ALMACENAMIENTO = "pulmovision_experimentos";

export default function ComparacionModelos() {
  // Pestaña activa
  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaComparacion>("comparacion");

  // Modelos seleccionados para comparar
  const [modelosSeleccionados, setModelosSeleccionados] =
    useState<string[]>(["unet", "unet-cbam"]);

  // Versión seleccionada de cada modelo
  const [versionesSeleccionadas, setVersionesSeleccionadas] =
    useState<Record<string, string>>({});

  // Recuperar experimentos almacenados en el navegador
  const [experimentos, setExperimentos] =
    useState<ResultadoModelo[]>(() => {
      try {
        const guardados = localStorage.getItem(
          CLAVE_ALMACENAMIENTO
        );

        if (guardados) {
          const datos: unknown = JSON.parse(guardados);

          if (
            Array.isArray(datos) &&
            datos.every((item) => {
              if (
                item === null ||
                typeof item !== "object" ||
                Array.isArray(item)
              ) {
                return false;
              }

              const registro = item as Record<string, unknown>;

              return (
                typeof registro.id === "string" &&
                typeof registro.modeloId === "string" &&
                typeof registro.version === "string" &&
                typeof registro.descripcion === "string" &&
                (registro.fecha === null ||
                  typeof registro.fecha === "string") &&
                ["pendiente", "parcial", "finalizado"].includes(
                  String(registro.estado)
                ) &&
                registro.metricas !== null &&
                typeof registro.metricas === "object" &&
                !Array.isArray(registro.metricas)
              );
            })
          ) {
            return datos as ResultadoModelo[];
          }
        }
      } catch (error) {
        console.error(
          "No se pudieron recuperar los experimentos:",
          error
        );
      }

      return [...historialResultados];
    });

  // Guardar automáticamente los experimentos
  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_ALMACENAMIENTO,
        JSON.stringify(experimentos)
      );
    } catch (error) {
      console.error(
        "No se pudieron guardar los experimentos:",
        error
      );
    }
  }, [experimentos]);

  // Importar uno o varios resultados
  const importarResultado = (
    nuevosResultados: ResultadoModelo[]
  ) => {
    setExperimentos((actuales) => {
      const actualizados = [...actuales];

      nuevosResultados.forEach((nuevo) => {
        const indice = actualizados.findIndex(
          (resultado) => resultado.id === nuevo.id
        );

        if (indice >= 0) {
          actualizados[indice] = nuevo;
        } else {
          actualizados.push(nuevo);
        }
      });

      return actualizados;
    });
  };

  // Activar o desactivar un modelo
  const cambiarSeleccion = (id: string) => {
    setModelosSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((modeloId) => modeloId !== id)
        : [...actuales, id]
    );
  };

  // Cambiar la versión de un modelo
  const cambiarVersion = (
    modeloId: string,
    experimentoId: string
  ) => {
    setVersionesSeleccionadas((actuales) => ({
      ...actuales,
      [modeloId]: experimentoId,
    }));
  };

  // Obtener la versión seleccionada o la última registrada
  const obtenerResultadoSeleccionado = (modeloId: string) => {
    const versiones = experimentos.filter(
      (resultado) => resultado.modeloId === modeloId
    );

    const idSeleccionado =
      versionesSeleccionadas[modeloId];

    return (
      versiones.find(
        (version) => version.id === idSeleccionado
      ) ?? versiones[versiones.length - 1]
    );
  };

  // Construir la comparación dinámica
  const comparacionActual = modelos
    .filter((modelo) =>
      modelosSeleccionados.includes(modelo.id)
    )
    .map((modelo) => ({
      ...modelo,
      resultado: obtenerResultadoSeleccionado(modelo.id),
    }));

  // Convertir una métrica de 0-1 a porcentaje
  const porcentaje = (valor?: number) => {
    if (valor === undefined || !Number.isFinite(valor)) {
      return "—";
    }

    return `${(valor * 100).toFixed(2)}%`;
  };

  return (
    <div className="comparison-page">
      {/* ENCABEZADO */}
      <div className="comparison-header">
        <div>
          <div className="eyebrow">
            <FlaskConical size={15} />
            EVALUACIÓN EXPERIMENTAL
          </div>

          <h2>Comparación de modelos</h2>

          <p>
            Análisis comparativo de arquitecturas de
            inteligencia artificial aplicadas al estudio
            de imágenes pulmonares, con seguimiento de
            métricas, versiones y configuraciones
            experimentales.
          </p>
        </div>
      </div>

      {/* AVISO SOBRE LOS RESULTADOS */}
      <div className="comparison-notice">
        <Info size={20} />

        <div>
          <strong>Resultados experimentales</strong>

          <p>
            Las métricas se muestran cuando se han
            incorporado mediante los archivos de
            resultados. Los valores pendientes no
            representan evaluaciones realizadas.
            Los resultados importados deben verificarse
            antes de utilizarlos en las conclusiones
            académicas.
          </p>
        </div>
      </div>

      {/* NAVEGACIÓN POR PESTAÑAS */}
      <nav
        className="comparacion-tabs"
        aria-label="Secciones de comparación"
      >
        <button
          type="button"
          className={
            pestanaActiva === "comparacion" ? "active" : ""
          }
          aria-current={
            pestanaActiva === "comparacion" ? "page" : undefined
          }
          onClick={() => setPestanaActiva("comparacion")}
        >
          Comparación
        </button>

        <button
          type="button"
          className={
            pestanaActiva === "experimentos" ? "active" : ""
          }
          aria-current={
            pestanaActiva === "experimentos" ? "page" : undefined
          }
          onClick={() => setPestanaActiva("experimentos")}
        >
          Experimentos
        </button>

        <button
          type="button"
          className={
            pestanaActiva === "evidencias" ? "active" : ""
          }
          aria-current={
            pestanaActiva === "evidencias" ? "page" : undefined
          }
          onClick={() => setPestanaActiva("evidencias")}
        >
          Evidencias
        </button>

        <button
          type="button"
          className={
            pestanaActiva === "datos" ? "active" : ""
          }
          aria-current={
            pestanaActiva === "datos" ? "page" : undefined
          }
          onClick={() => setPestanaActiva("datos")}
        >
          Gestión de datos
        </button>
      </nav>

      {/* PESTAÑA 1: COMPARACIÓN */}
      {pestanaActiva === "comparacion" && (
        <>
          <section className="selector-modelos">
            <h3>Seleccionar modelos para comparar</h3>

            <p>
              Selecciona las arquitecturas que deseas
              incluir en la comparación.
            </p>

            <div className="selector-modelos-grid">
              {modelos.map((modelo) => (
                <label
                  key={modelo.id}
                  className="selector-modelo-item"
                >
                  <input
                    type="checkbox"
                    checked={modelosSeleccionados.includes(
                      modelo.id
                    )}
                    onChange={() =>
                      cambiarSeleccion(modelo.id)
                    }
                  />

                  <div>
                    <strong>{modelo.nombre}</strong>
                    <span>{modelo.descripcion}</span>
                  </div>
                </label>
              ))}
            </div>

            <p className="selector-modelos-info">
              {modelosSeleccionados.length} de{" "}
              {modelos.length} modelos seleccionados.
            </p>
          </section>

          <SelectorVersiones
            modelosSeleccionados={modelosSeleccionados}
            versionesSeleccionadas={versionesSeleccionadas}
            cambiarVersion={cambiarVersion}
            experimentos={experimentos}
          />

          <section className="selector-modelos">
            <h3>
              Resultados de los modelos seleccionados
            </h3>

            <p>
              Métricas registradas para las versiones
              seleccionadas de cada arquitectura.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Modelo</th>
                    <th>Versión</th>
                    <th>Accuracy</th>
                    <th>Precisión</th>
                    <th>Recall</th>
                    <th>F1-score</th>
                    <th>Dice</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {comparacionActual.map((modelo) => {
                    const resultado = modelo.resultado;
                    const metricas = resultado?.metricas;

                    return (
                      <tr key={modelo.id}>
                        <td>{modelo.nombre}</td>

                        <td>
                          {resultado?.version ?? "—"}
                        </td>

                        <td>
                          {porcentaje(metricas?.accuracy)}
                        </td>

                        <td>
                          {porcentaje(metricas?.precision)}
                        </td>

                        <td>
                          {porcentaje(metricas?.recall)}
                        </td>

                        <td>
                          {porcentaje(metricas?.f1Score)}
                        </td>

                        <td>
                          {porcentaje(metricas?.dice)}
                        </td>

                        <td>
                          {resultado?.estado ?? "pendiente"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {comparacionActual.length === 0 && (
              <p>
                Selecciona al menos un modelo para
                consultar sus resultados.
              </p>
            )}
          </section>

          <GraficaComparacion
            modelosSeleccionados={modelosSeleccionados}
            versionesSeleccionadas={versionesSeleccionadas}
            experimentos={experimentos}
          />
        </>
      )}

      {/* PESTAÑA 2: EXPERIMENTOS */}
      {pestanaActiva === "experimentos" && (
        <>
          <HistorialExperimentos
            experimentos={experimentos}
          />

          <DetalleExperimento
            experimentos={experimentos}
          />
        </>
      )}

      {/* PESTAÑA 3: EVIDENCIAS */}
      {pestanaActiva === "evidencias" && (
        <EvidenciasExperimento
          experimentos={experimentos}
        />
      )}

      {/* PESTAÑA 4: GESTIÓN DE DATOS */}
      {pestanaActiva === "datos" && (
        <>
          <ImportarResultados
            onImportar={importarResultado}
          />

          <ExportarResultados
            experimentos={experimentos}
          />
        </>
      )}

      {/* NOTA METODOLÓGICA */}
      <div className="comparison-footnote">
        <Info size={16} />

        <p>
          Para realizar una comparación académica válida,
          los modelos deben evaluarse con conjuntos de
          prueba equivalentes, definiciones consistentes
          de las métricas y condiciones experimentales
          documentadas. Las métricas de segmentación y
          clasificación deben interpretarse según la
          tarea correspondiente.
        </p>
      </div>
    </div>
  );
}
