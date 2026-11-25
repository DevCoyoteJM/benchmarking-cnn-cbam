import { FlaskConical, Info, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { modelos } from "../data/modelos";
import { useExperimentos } from "../hooks/useExperimentos";
import { useHistorialesEntrenamiento } from "../hooks/useHistorialesEntrenamiento";
import { obtenerResultadoSeleccionado } from "../utils/modelSelectors";
import ImportarHistorialEntrenamiento from "../components/ImportarHistorialEntrenamiento";
import type { Evidencia } from "../services/storage/storageTypes";
import {
  consultarEvidencias,
  asegurarEvidenciasCompartidas,
} from "../services/storage/indexedDBService";
import {
  obtenerResumenE1,
  obtenerResumenE2,
  formatearMetrica,
  formatearPerdida,
} from "../utils/graficaUtils";

import GraficaComparacion from "../components/GraficaComparacion";
import HistorialExperimentos from "../components/HistorialExperimentos";
import SelectorVersiones from "../components/SelectorVersiones";
import ImportarResultados from "../components/ImportarResultados";
import ExportarResultados from "../components/ExportarResultados";
import DetalleExperimento from "../components/DetalleExperimento";
import EvidenciasExperimento from "../components/EvidenciasExperimento";
import {
  esPestanaValida,
  type PestanaComparacion,
} from "../utils/navigation";

export default function ComparacionModelos() {
  // Pestaña activa sincronizada con searchParams (?tab=...)
  const [searchParams, setSearchParams] = useSearchParams();
  const pestanaParam = searchParams.get("tab");
  const pestanaActiva: PestanaComparacion = esPestanaValida(pestanaParam)
    ? pestanaParam
    : "comparacion";

  const cambiarPestana = (nuevaPestana: PestanaComparacion) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nuevaPestana === "comparacion") {
          next.delete("tab");
        } else {
          next.set("tab", nuevaPestana);
        }
        return next;
      },
      { replace: true }
    );
  };

  // Modelos seleccionados para comparar (por defecto el catálogo completo de 4 arquitecturas)
  const [modelosSeleccionados, setModelosSeleccionados] =
    useState<string[]>(["unet", "unet-cbam", "modcbam", "transunet"]);

  // Versión seleccionada de cada modelo
  const [versionesSeleccionadas, setVersionesSeleccionadas] =
    useState<Record<string, string>>({});

  // Historiales de entrenamiento persistidos en IndexedDB
  const {
    historiales: historialesEntrenamiento,
    guardarHistorial,
    eliminarHistorial,
  } = useHistorialesEntrenamiento();

  // Experimentos gestionados centralizadamente por el hook (localStorage + normalización)
  const {
    experimentos,
    importarResultados,
    actualizarExperimento,
    actualizarMultiplesExperimentos,
  } = useExperimentos();

  // Evidencias compartidas e individuales persistidas en IndexedDB
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);

  useEffect(() => {
    let activo = true;

    asegurarEvidenciasCompartidas()
      .catch(() => {})
      .then(() => consultarEvidencias())
      .then((datos) => {
        if (activo) {
          setEvidencias(datos);
        }
      })
      .catch((err) => {
        console.error("Error al consultar evidencias en Comparación:", err);
      });

    return () => {
      activo = false;
    };
  }, [pestanaActiva]);

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

  // Construir la comparación dinámica
  const comparacionActual = modelos
    .filter((modelo) =>
      modelosSeleccionados.includes(modelo.id)
    )
    .map((modelo) => ({
      ...modelo,
      resultado: obtenerResultadoSeleccionado(
        modelo.id,
        versionesSeleccionadas,
        experimentos
      ),
    }));

  // Resúmenes metodológicos por etapa (E1 y E2) derivados de los datos experimentales reales
  const datosResumenE1 = comparacionActual.map((item) => {
    const historial = historialesEntrenamiento.find(
      (h) => h.modeloId === item.id
    );
    return obtenerResumenE1(item.id, item.nombre, historial, item.resultado);
  });

  const datosResumenE2 = comparacionActual.map((item) => {
    const historial = historialesEntrenamiento.find(
      (h) => h.modeloId === item.id
    );
    return obtenerResumenE2(item.id, item.nombre, historial, item.resultado);
  });

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
          onClick={() => cambiarPestana("comparacion")}
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
          onClick={() => cambiarPestana("experimentos")}
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
          onClick={() => cambiarPestana("evidencias")}
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
          onClick={() => cambiarPestana("datos")}
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

          {/* TABLAS METODOLÓGICAS SEPARADAS PARA E1 Y E2 */}
          <section className="selector-modelos">
            <h3>Evaluación experimental por etapas del pipeline</h3>
            <p>
              Presentación metodológica diferenciada entre la etapa de detección y segmentación nodular (E1) y la etapa de clasificación diagnóstica de malignidad (E2).
            </p>

            {comparacionActual.length === 0 ? (
              <p>Selecciona al menos un modelo para consultar sus resultados.</p>
            ) : (
              <>
                {/* TABLA ETAPA E1: SEGMENTACIÓN */}
                <div className="tabla-etapa-contenedor">
                  <div className="tabla-etapa-header">
                    <div>
                      <h4>Etapa E1: Segmentación y Detección de Nódulos (Dataset LIDC-IDRI)</h4>
                      <p>
                        Métricas de solapamiento espacial sobre máscaras binarias de consenso multiexperto. Métricas principales: Coeficiente Dice e IoU (Jaccard).
                      </p>
                    </div>
                    <span className="badge-etapa badge-e1">ETAPA E1</span>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>Arquitectura</th>
                          <th>Épocas E1</th>
                          <th>Mejor Dice (Val)</th>
                          <th>Dice Final (Val)</th>
                          <th>IoU</th>
                          <th>Pérdida Final (Train / Val)</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosResumenE1.map((d) => (
                          <tr key={d.modeloId}>
                            <td><strong>{d.nombreModelo}</strong></td>
                            <td>{d.epocas ? `${d.epocas} épocas` : "No disponible"}</td>
                            <td>{formatearMetrica(d.mejorValDice, { porcentaje: true })}</td>
                            <td>{formatearMetrica(d.valDiceFinal, { porcentaje: true })}</td>
                            <td>{formatearMetrica(d.iou, { porcentaje: true })}</td>
                            <td>{formatearPerdida(d.trainLossFinal, d.valLossFinal)}</td>
                            <td><span className="badge-estado">{d.estado}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TABLA ETAPA E2: CLASIFICACIÓN DE MALIGNIDAD */}
                <div className="tabla-etapa-contenedor">
                  <div className="tabla-etapa-header">
                    <div>
                      <h4>Etapa E2: Clasificación de Malignidad (Benigno vs. Maligno)</h4>
                      <p>
                        Métricas de evaluación de discriminación nodular. Todas las arquitecturas completaron 100 épocas. El Coeficiente MCC y F1-score ponderan robustamente el desbalance de clases.
                      </p>
                    </div>
                    <span className="badge-etapa badge-e2">ETAPA E2</span>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>Arquitectura</th>
                          <th>Épocas E2</th>
                          <th>Mejor MCC (Val)</th>
                          <th>MCC Final (Val)</th>
                          <th>Mejor F1 (Val)</th>
                          <th>F1 Final (Val)</th>
                          <th>Accuracy</th>
                          <th>ROC-AUC</th>
                          <th>Pérdida Final (Train / Val)</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosResumenE2.map((d) => (
                          <tr key={d.modeloId}>
                            <td><strong>{d.nombreModelo}</strong></td>
                            <td>{d.epocas ? `${d.epocas} épocas` : "No disponible"}</td>
                            <td>{formatearMetrica(d.mejorValMcc, { decimales: 4 })}</td>
                            <td>{formatearMetrica(d.valMccFinal, { decimales: 4 })}</td>
                            <td>{formatearMetrica(d.mejorValF1, { porcentaje: true })}</td>
                            <td>{formatearMetrica(d.valF1Final, { porcentaje: true })}</td>
                            <td>{formatearMetrica(d.accuracy, { porcentaje: true })}</td>
                            <td>{formatearMetrica(d.rocAuc, { porcentaje: true })}</td>
                            <td>{formatearPerdida(d.trainLossFinal, d.valLossFinal)}</td>
                            <td><span className="badge-estado">{d.estado}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* NOTA METODOLÓGICA Y CRITERIOS DE COMPARABILIDAD */}
                <div className="comparison-scientific-card">
                  <div className="scientific-card-header">
                    <ShieldAlert size={18} color="#4f46e5" />
                    <strong>Criterios Metodológicos y de Comparabilidad (Trabajo de Grado)</strong>
                  </div>
                  <ul className="scientific-card-list">
                    <li>
                      <strong>Separación estricta de tareas:</strong> Las métricas de solapamiento espacial (Dice / IoU) evalúan la calidad de segmentación en E1 y no se extrapolan a la clasificación de patología (MCC / F1 / ROC-AUC) de E2.
                    </li>
                    <li>
                      <strong>Heterogeneidad de épocas en E1:</strong> En la etapa E1, las arquitecturas registraron diferentes duraciones de entrenamiento (48 épocas en U-Net+CBAM frente a 106 en TransUNet). Esta disparidad debe considerarse al contrastar convergencias, evitando atribuir diferencias de pérdida exclusivamente a la capacidad del modelo sin contemplar la parada temprana.
                    </li>
                    <li>
                      <strong>Régimen homogéneo en E2:</strong> En la clasificación de malignidad (E2), los cuatro modelos completaron exactamente 100 épocas bajo condiciones homogéneas. Los mecanismos de atención (ModCBAM y U-Net+CBAM) alcanzaron picos superiores de MCC y F1 frente a la U-Net base.
                    </li>
                    <li>
                      <strong>Transparencia de datos:</strong> Las métricas no computadas en el pipeline experimental se presentan explícitamente como «No disponible», rechazando cualquier relleno con ceros ficticios.
                    </li>
                  </ul>
                </div>
              </>
            )}
          </section>

          <ImportarHistorialEntrenamiento
            historiales={historialesEntrenamiento}
            onImportar={guardarHistorial}
            onEliminar={eliminarHistorial}
          />

          <GraficaComparacion
            modelosSeleccionados={modelosSeleccionados}
            versionesSeleccionadas={versionesSeleccionadas}
            experimentos={experimentos}
            historialesEntrenamiento={historialesEntrenamiento}
          />
        </>
      )}

      {/* PESTAÑA 2: EXPERIMENTOS */}
      {pestanaActiva === "experimentos" && (
        <>
          <HistorialExperimentos
            experimentos={experimentos}
            historiales={historialesEntrenamiento}
          />

          <DetalleExperimento
            experimentos={experimentos}
            historiales={historialesEntrenamiento}
            evidencias={evidencias}
            onActualizarExperimento={actualizarExperimento}
            onActualizarMultiplesExperimentos={actualizarMultiplesExperimentos}
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
            onImportar={importarResultados}
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