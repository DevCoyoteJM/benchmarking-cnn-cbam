import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { modelos } from "../data/modelos";
import type { ResultadoModelo } from "../data/resultados";
import type {
  RegistroHistorialEntrenamiento,
} from "../data/historialEntrenamiento";
import { obtenerResultadoSeleccionado } from "../utils/modelSelectors";
import {
  construirDatosEpocas,
  esValorMetricaValido,
} from "../utils/graficaUtils";

interface GraficaComparacionProps {
  modelosSeleccionados: string[];
  versionesSeleccionadas: Record<string, string>;
  experimentos: ResultadoModelo[];
  historialesEntrenamiento?: RegistroHistorialEntrenamiento[];
}

type ClaveMetrica =
  | "accuracy"
  | "precision"
  | "recall"
  | "f1Score"
  | "rocAuc"
  | "mcc"
  | "dice"
  | "iou";

type TareaMetrica = "clasificacion" | "segmentacion";

interface DefinicionMetrica {
  clave: ClaveMetrica;
  nombre: string;
  tarea: TareaMetrica;
}

interface DatoGrafica {
  metrica: string;
  [modeloId: string]: string | number;
}

const metricasClasificacion: DefinicionMetrica[] = [
  { clave: "f1Score", nombre: "F1-score", tarea: "clasificacion" },
  { clave: "mcc", nombre: "MCC", tarea: "clasificacion" },
  { clave: "accuracy", nombre: "Accuracy", tarea: "clasificacion" },
  { clave: "precision", nombre: "Precisión", tarea: "clasificacion" },
  { clave: "recall", nombre: "Recall", tarea: "clasificacion" },
  { clave: "rocAuc", nombre: "ROC-AUC", tarea: "clasificacion" },
];

const metricasSegmentacion: DefinicionMetrica[] = [
  { clave: "dice", nombre: "Dice", tarea: "segmentacion" },
  { clave: "iou", nombre: "IoU", tarea: "segmentacion" },
];

const coloresBarras = [
  "#2563eb",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

// Paleta visual consistente para cada arquitectura en las curvas de época
const paletaCurvas: Record<
  string,
  { val: string; train: string; nombre: string }
> = {
  unet: {
    val: "#1d4ed8", // Azul fuerte
    train: "#93c5fd", // Azul suave
    nombre: "U-Net",
  },
  "unet-cbam": {
    val: "#6d28d9", // Morado fuerte
    train: "#c4b5fd", // Morado suave
    nombre: "U-Net + CBAM",
  },
  modcbam: {
    val: "#047857", // Esmeralda fuerte
    train: "#6ee7b7", // Esmeralda suave
    nombre: "ModCBAM",
  },
  transunet: {
    val: "#b45309", // Ámbar fuerte
    train: "#fcd34d", // Ámbar suave
    nombre: "TransUNet",
  },
};

function obtenerColoresModelo(modeloId: string) {
  return (
    paletaCurvas[modeloId] ?? {
      val: "#475569",
      train: "#94a3b8",
      nombre: modeloId,
    }
  );
}

function obtenerTareaResultado(resultado: ResultadoModelo): string {
  return resultado.tarea ?? "sin-especificar";
}

export default function GraficaComparacion({
  modelosSeleccionados,
  versionesSeleccionadas,
  experimentos,
  historialesEntrenamiento = [],
}: GraficaComparacionProps) {
  const [etapaActiva, setEtapaActiva] = useState<"E1" | "E2">("E1");
  const [modelosCurvasActivos, setModelosCurvasActivos] = useState<string[]>([]);

  const modelosActivos = modelos.filter((modelo) =>
    modelosSeleccionados.includes(modelo.id)
  );

  const resultadosActivos = modelosActivos.map((modelo) => ({
    modelo,
    resultado: obtenerResultadoSeleccionado(
      modelo.id,
      versionesSeleccionadas,
      experimentos
    ),
  }));

  /* =========================================================================
   * GRÁFICAS DE BARRAS: COMPARACIÓN GLOBAL DE MÉTRICAS
   * ========================================================================= */

  const construirDatosBarras = (metricas: DefinicionMetrica[]): DatoGrafica[] => {
    return metricas
      .map((metrica) => {
        const fila: DatoGrafica = { metrica: metrica.nombre };

        modelosActivos.forEach((modelo) => {
          const resultado = resultadosActivos.find(
            (r) => r.modelo.id === modelo.id
          )?.resultado;
          const historial = historialesEntrenamiento.find(
            (h) => h.modeloId === modelo.id
          );

          let valor: number | undefined;

          // 1. Si el experimento tiene la métrica para su tarea, usarla
          if (resultado) {
            const tareaResultado = obtenerTareaResultado(resultado);
            if (
              tareaResultado === metrica.tarea ||
              tareaResultado === "sin-especificar"
            ) {
              const valExp = resultado.metricas?.[metrica.clave];
              if (
                esValorMetricaValido(valExp, {
                  permiteNegativo: metrica.clave === "mcc",
                })
              ) {
                valor = valExp;
              }
            }
          }

          // 2. Si no está en el experimento, consultar el pico máximo alcanzado en el historial de entrenamiento real
          if (valor === undefined && historial) {
            if (metrica.clave === "dice") {
              const serie =
                historial.etapas["E1"]?.val_dice ??
                historial.etapas["e1"]?.val_dice;
              if (Array.isArray(serie) && serie.length > 0) {
                valor = Math.max(...serie);
              }
            } else if (metrica.clave === "mcc") {
              const serie =
                historial.etapas["E2"]?.val_mcc ??
                historial.etapas["e2"]?.val_mcc;
              if (Array.isArray(serie) && serie.length > 0) {
                valor = Math.max(...serie);
              }
            } else if (metrica.clave === "f1Score") {
              const serie =
                historial.etapas["E2"]?.val_f1 ??
                historial.etapas["e2"]?.val_f1;
              if (Array.isArray(serie) && serie.length > 0) {
                valor = Math.max(...serie);
              }
            }
          }

          if (
            esValorMetricaValido(valor, {
              permiteNegativo: metrica.clave === "mcc",
            })
          ) {
            fila[modelo.id] = valor * 100;
          }
        });

        return fila;
      })
      .filter((fila) =>
        modelosActivos.some((modelo) => typeof fila[modelo.id] === "number")
      );
  };

  const datosClasificacion = construirDatosBarras(metricasClasificacion);
  const datosSegmentacion = construirDatosBarras(metricasSegmentacion);

  const tieneDatosBarras = (datos: DatoGrafica[]) => {
    return datos.some((fila) =>
      modelosActivos.some((modelo) => typeof fila[modelo.id] === "number")
    );
  };

  const obtenerNombreModelo = (modeloId: string) => {
    return modelos.find((m) => m.id === modeloId)?.nombre ?? modeloId;
  };

  const renderizarGraficaBarras = (
    titulo: string,
    descripcion: string,
    datos: DatoGrafica[]
  ) => {
    const hayDatos = tieneDatosBarras(datos);

    return (
      <div className="grafica-tarea">
        <h4>{titulo}</h4>
        <p>{descripcion}</p>

        {!hayDatos ? (
          <div className="grafica-sin-datos">
            <strong>Resultados pendientes</strong>
            <p>
              No hay métricas registradas para esta tarea en las versiones seleccionadas.
            </p>
          </div>
        ) : (
          <div className="grafica-comparacion-contenedor">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={datos}
                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metrica" />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(valor: number) => `${valor}%`}
                />
                <Tooltip
                  formatter={(valor: unknown, nombre: unknown) => [
                    typeof valor === "number"
                      ? `${(valor / 100).toFixed(4)} (${valor.toFixed(2)}%)`
                      : "No disponible",
                    obtenerNombreModelo(String(nombre)),
                  ]}
                />
                <Legend formatter={(valor: string) => obtenerNombreModelo(valor)} />
                {modelosActivos.map((modelo, index) => (
                  <Bar
                    key={modelo.id}
                    dataKey={modelo.id}
                    name={modelo.nombre}
                    fill={coloresBarras[index % coloresBarras.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================================
   * GRÁFICAS DE LÍNEAS: EVOLUCIÓN POR ÉPOCA (ETAPAS E1 Y E2)
   * ========================================================================= */

  // Modelos que efectivamente poseen datos para la etapa activa
  const modelosConDatosEtapa = useMemo(() => {
    return historialesEntrenamiento.filter((h) => {
      const etapa = h.etapas[etapaActiva] ?? h.etapas[etapaActiva.toLowerCase()];
      if (!etapa || typeof etapa !== "object") return false;
      return Object.values(etapa).some(
        (serie) => Array.isArray(serie) && serie.length > 0
      );
    });
  }, [historialesEntrenamiento, etapaActiva]);

  // Modelos visibles en las curvas (por defecto todos los que tienen datos si no hay filtro manual)
  const historialesVisibles = useMemo(() => {
    if (modelosCurvasActivos.length === 0) {
      return modelosConDatosEtapa;
    }
    return modelosConDatosEtapa.filter((h) =>
      modelosCurvasActivos.includes(h.modeloId)
    );
  }, [modelosConDatosEtapa, modelosCurvasActivos]);

  // Alternar selección de modelo en las curvas
  const alternarModeloCurva = (modeloId: string) => {
    setModelosCurvasActivos((prev) => {
      if (prev.length === 0) {
        // Primera interacción: desactivar este modelo del conjunto total
        return modelosConDatosEtapa
          .map((h) => h.modeloId)
          .filter((id) => id !== modeloId);
      }
      if (prev.includes(modeloId)) {
        const nuevos = prev.filter((id) => id !== modeloId);
        return nuevos.length === 0 ? [] : nuevos;
      }
      return [...prev, modeloId];
    });
  };

  // Series para cada gráfica de Recharts
  const datosPerdida = useMemo(
    () =>
      construirDatosEpocas(historialesVisibles, etapaActiva, [
        "train_loss",
        "val_loss",
      ]),
    [historialesVisibles, etapaActiva]
  );

  const datosDice = useMemo(
    () => construirDatosEpocas(historialesVisibles, etapaActiva, ["val_dice"]),
    [historialesVisibles, etapaActiva]
  );

  const datosMCC = useMemo(
    () => construirDatosEpocas(historialesVisibles, etapaActiva, ["val_mcc"]),
    [historialesVisibles, etapaActiva]
  );

  const datosF1 = useMemo(
    () => construirDatosEpocas(historialesVisibles, etapaActiva, ["val_f1"]),
    [historialesVisibles, etapaActiva]
  );

  return (
    <>
      {/* SECCIÓN 1: COMPARACIÓN GENERAL DE MÉTRICAS (BARRAS) */}
      <section className="selector-modelos">
        <h3>Comparación global de métricas de evaluación</h3>
        <p>
          Las métricas se muestran únicamente cuando corresponden a la tarea
          registrada en cada arquitectura evaluada.
        </p>

        {modelosActivos.length === 0 ? (
          <div className="grafica-sin-datos">
            Selecciona al menos un modelo para visualizar la comparación.
          </div>
        ) : (
          <div className="graficas-por-tarea">
            {renderizarGraficaBarras(
              "Métricas de clasificación (Etapa E2: Malignidad)",
              "F1-score, MCC y métricas globales calculadas sobre la clasificación binaria de nódulos benignos vs. malignos.",
              datosClasificacion
            )}

            {renderizarGraficaBarras(
              "Métricas de segmentación (Etapa E1: Detección)",
              "Coeficiente Dice e IoU alcanzados para evaluar el solapamiento espacial respecto a las anotaciones LIDC-IDRI.",
              datosSegmentacion
            )}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: CURVAS DE ENTRENAMIENTO POR ÉPOCA (LÍNEAS) */}
      <section className="selector-modelos" style={{ marginTop: "32px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>
            Curvas de entrenamiento: Evolución por época
          </h3>
          <p style={{ margin: "6px 0 16px 0", color: "#64748b", fontSize: "13px" }}>
            Visualización detallada de la convergencia y desempeño durante el entrenamiento
            realizado en PyTorch, diferenciando por etapa experimental.
          </p>

          {/* SELECTOR DE ETAPA (E1 vs E2) */}
          <div className="curvas-etapa-tabs">
            <button
              type="button"
              className={`curvas-etapa-tab ${etapaActiva === "E1" ? "activa" : ""}`}
              onClick={() => {
                setEtapaActiva("E1");
                setModelosCurvasActivos([]);
              }}
            >
              Etapa E1: Segmentación y detección
            </button>
            <button
              type="button"
              className={`curvas-etapa-tab ${etapaActiva === "E2" ? "activa" : ""}`}
              onClick={() => {
                setEtapaActiva("E2");
                setModelosCurvasActivos([]);
              }}
            >
              Etapa E2: Clasificación de malignidad
            </button>
          </div>
        </div>

        {/* COMPROBACIÓN DE DISPONIBILIDAD DE DATOS */}
        {modelosConDatosEtapa.length === 0 ? (
          <div className="grafica-sin-datos">
            <strong>Sin datos de entrenamiento para la {etapaActiva}</strong>
            <p>
              No se han importado historiales JSON con métricas para esta etapa.
              Utiliza el módulo de importación superior para cargar{" "}
              <code>UNet_historial.json</code> o <code>CBAM_historial.json</code>.
            </p>
          </div>
        ) : (
          <>
            {/* FILTROS DE MODELO PARA LAS CURVAS */}
            <div className="filtro-modelos-curvas">
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                Filtrar arquitecturas en las curvas:
              </span>
              {modelosConDatosEtapa.map((h) => {
                const nombre = obtenerNombreModelo(h.modeloId);
                const activo =
                  modelosCurvasActivos.length === 0 ||
                  modelosCurvasActivos.includes(h.modeloId);
                const color = obtenerColoresModelo(h.modeloId);

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => alternarModeloCurva(h.modeloId)}
                    className={`filtro-modelo-chip ${activo ? "activo" : ""}`}
                    style={{
                      borderLeft: `4px solid ${color.val}`,
                    }}
                  >
                    <span>{nombre}</span>
                    <small style={{ color: "#64748b" }}>
                      ({h.etapas[etapaActiva]?.train_loss?.length ?? 0} épocas)
                    </small>
                  </button>
                );
              })}
            </div>

            <div className="graficas-por-tarea">
              {/* ETAPA E1: SEGMENTACIÓN Y DETECCIÓN */}
              {etapaActiva === "E1" && (
                <>
                  {/* Gráfica 1: Pérdida E1 */}
                  <div className="grafica-tarea">
                    <h4>Evolución de Pérdida (Loss) — Etapa E1</h4>
                    <p>
                      Comparación de la pérdida de entrenamiento (línea discontinua) y
                      validación (línea continua) a lo largo de las épocas.
                    </p>

                    {datosPerdida.length === 0 ? (
                      <div className="grafica-sin-datos">
                        No hay datos de pérdida registrados para esta etapa.
                      </div>
                    ) : (
                      <div className="grafica-comparacion-contenedor">
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart
                            data={datosPerdida}
                            margin={{ top: 15, right: 30, left: 10, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="epoca"
                              label={{
                                value: "Época",
                                position: "insideBottom",
                                offset: -10,
                              }}
                            />
                            <YAxis
                              domain={["auto", "auto"]}
                              label={{
                                value: "Pérdida (Loss)",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              labelFormatter={(v) => `Época ${v}`}
                              formatter={(val: unknown, name: unknown) => [
                                typeof val === "number" ? val.toFixed(4) : "—",
                                String(name),
                              ]}
                            />
                            <Legend verticalAlign="top" height={36} />

                            {historialesVisibles.map((h) => {
                              const color = obtenerColoresModelo(h.modeloId);
                              const etapa =
                                h.etapas["E1"] ?? h.etapas["e1"];

                              return (
                                <g key={h.id}>
                                  {Array.isArray(etapa?.train_loss) && (
                                    <Line
                                      type="monotone"
                                      dataKey={`${h.modeloId}_train_loss`}
                                      name={`${color.nombre} (Train)`}
                                      stroke={color.train}
                                      strokeDasharray="4 4"
                                      strokeWidth={2}
                                      dot={false}
                                      connectNulls={false}
                                    />
                                  )}
                                  {Array.isArray(etapa?.val_loss) && (
                                    <Line
                                      type="monotone"
                                      dataKey={`${h.modeloId}_val_loss`}
                                      name={`${color.nombre} (Val)`}
                                      stroke={color.val}
                                      strokeWidth={2.5}
                                      dot={false}
                                      connectNulls={false}
                                    />
                                  )}
                                </g>
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Gráfica 2: Dice de validación E1 */}
                  <div className="grafica-tarea">
                    <h4>Evolución de Coeficiente Dice (Validación) — Etapa E1</h4>
                    <p>
                      Métrica de similitud espacial para evaluar la precisión de la
                      segmentación de nódulos respecto a las anotaciones multiexperto LIDC-IDRI.
                    </p>

                    {datosDice.length === 0 ? (
                      <div className="grafica-sin-datos">
                        No hay datos de Dice registrados para esta etapa.
                      </div>
                    ) : (
                      <div className="grafica-comparacion-contenedor">
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart
                            data={datosDice}
                            margin={{ top: 15, right: 30, left: 10, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="epoca"
                              label={{
                                value: "Época",
                                position: "insideBottom",
                                offset: -10,
                              }}
                            />
                            <YAxis
                              domain={[0, 1]}
                              tickFormatter={(v: number) => v.toFixed(2)}
                              label={{
                                value: "Dice Score",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              labelFormatter={(v) => `Época ${v}`}
                              formatter={(val: unknown, name: unknown) => [
                                typeof val === "number" ? val.toFixed(4) : "—",
                                String(name),
                              ]}
                            />
                            <Legend verticalAlign="top" height={36} />

                            {historialesVisibles.map((h) => {
                              const color = obtenerColoresModelo(h.modeloId);
                              const etapa =
                                h.etapas["E1"] ?? h.etapas["e1"];

                              if (!Array.isArray(etapa?.val_dice)) return null;

                              return (
                                <Line
                                  key={h.id}
                                  type="monotone"
                                  dataKey={`${h.modeloId}_val_dice`}
                                  name={`${color.nombre} (Val Dice)`}
                                  stroke={color.val}
                                  strokeWidth={2.5}
                                  dot={false}
                                  connectNulls={false}
                                />
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ETAPA E2: CLASIFICACIÓN DE MALIGNIDAD */}
              {etapaActiva === "E2" && (
                <>
                  {/* Gráfica 1: Pérdida E2 */}
                  <div className="grafica-tarea">
                    <h4>Evolución de Pérdida (Loss) — Etapa E2</h4>
                    <p>
                      Pérdida en la clasificación de nódulos benignos vs. malignos durante
                      el entrenamiento y la validación.
                    </p>

                    {datosPerdida.length === 0 ? (
                      <div className="grafica-sin-datos">
                        No hay datos de pérdida registrados para esta etapa.
                      </div>
                    ) : (
                      <div className="grafica-comparacion-contenedor">
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart
                            data={datosPerdida}
                            margin={{ top: 15, right: 30, left: 10, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="epoca"
                              label={{
                                value: "Época",
                                position: "insideBottom",
                                offset: -10,
                              }}
                            />
                            <YAxis
                              domain={["auto", "auto"]}
                              label={{
                                value: "Pérdida",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              labelFormatter={(v) => `Época ${v}`}
                              formatter={(val: unknown, name: unknown) => [
                                typeof val === "number" ? val.toFixed(4) : "—",
                                String(name),
                              ]}
                            />
                            <Legend verticalAlign="top" height={36} />

                            {historialesVisibles.map((h) => {
                              const color = obtenerColoresModelo(h.modeloId);
                              const etapa =
                                h.etapas["E2"] ?? h.etapas["e2"];

                              return (
                                <g key={h.id}>
                                  {Array.isArray(etapa?.train_loss) && (
                                    <Line
                                      type="monotone"
                                      dataKey={`${h.modeloId}_train_loss`}
                                      name={`${color.nombre} (Train)`}
                                      stroke={color.train}
                                      strokeDasharray="4 4"
                                      strokeWidth={2}
                                      dot={false}
                                      connectNulls={false}
                                    />
                                  )}
                                  {Array.isArray(etapa?.val_loss) && (
                                    <Line
                                      type="monotone"
                                      dataKey={`${h.modeloId}_val_loss`}
                                      name={`${color.nombre} (Val)`}
                                      stroke={color.val}
                                      strokeWidth={2.5}
                                      dot={false}
                                      connectNulls={false}
                                    />
                                  )}
                                </g>
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Gráfica 2: MCC de validación E2 */}
                  <div className="grafica-tarea">
                    <h4>Coeficiente de Correlación de Matthews (MCC) — Etapa E2</h4>
                    <p>
                      Métrica robusta frente a desbalances de clase para medir la calidad
                      de la clasificación binaria de malignidad (rango [-1, 1]).
                    </p>

                    {datosMCC.length === 0 ? (
                      <div className="grafica-sin-datos">
                        No hay datos de MCC registrados para esta etapa.
                      </div>
                    ) : (
                      <div className="grafica-comparacion-contenedor">
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart
                            data={datosMCC}
                            margin={{ top: 15, right: 30, left: 10, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="epoca"
                              label={{
                                value: "Época",
                                position: "insideBottom",
                                offset: -10,
                              }}
                            />
                            <YAxis
                              domain={[-1, 1]}
                              tickFormatter={(v: number) => v.toFixed(2)}
                              label={{
                                value: "MCC",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              labelFormatter={(v) => `Época ${v}`}
                              formatter={(val: unknown, name: unknown) => [
                                typeof val === "number" ? val.toFixed(4) : "—",
                                String(name),
                              ]}
                            />
                            <Legend verticalAlign="top" height={36} />

                            {historialesVisibles.map((h) => {
                              const color = obtenerColoresModelo(h.modeloId);
                              const etapa =
                                h.etapas["E2"] ?? h.etapas["e2"];

                              if (!Array.isArray(etapa?.val_mcc)) return null;

                              return (
                                <Line
                                  key={h.id}
                                  type="monotone"
                                  dataKey={`${h.modeloId}_val_mcc`}
                                  name={`${color.nombre} (Val MCC)`}
                                  stroke={color.val}
                                  strokeWidth={2.5}
                                  dot={false}
                                  connectNulls={false}
                                />
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Gráfica 3: F1-score de validación E2 */}
                  <div className="grafica-tarea">
                    <h4>F1-score de Validación — Etapa E2</h4>
                    <p>
                      Media armónica entre precisión y sensibilidad en la predicción de nódulos
                      malignos.
                    </p>

                    {datosF1.length === 0 ? (
                      <div className="grafica-sin-datos">
                        No hay datos de F1-score registrados para esta etapa.
                      </div>
                    ) : (
                      <div className="grafica-comparacion-contenedor">
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart
                            data={datosF1}
                            margin={{ top: 15, right: 30, left: 10, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="epoca"
                              label={{
                                value: "Época",
                                position: "insideBottom",
                                offset: -10,
                              }}
                            />
                            <YAxis
                              domain={[0, 1]}
                              tickFormatter={(v: number) => v.toFixed(2)}
                              label={{
                                value: "F1-Score",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              labelFormatter={(v) => `Época ${v}`}
                              formatter={(val: unknown, name: unknown) => [
                                typeof val === "number" ? val.toFixed(4) : "—",
                                String(name),
                              ]}
                            />
                            <Legend verticalAlign="top" height={36} />

                            {historialesVisibles.map((h) => {
                              const color = obtenerColoresModelo(h.modeloId);
                              const etapa =
                                h.etapas["E2"] ?? h.etapas["e2"];

                              if (!Array.isArray(etapa?.val_f1)) return null;

                              return (
                                <Line
                                  key={h.id}
                                  type="monotone"
                                  dataKey={`${h.modeloId}_val_f1`}
                                  name={`${color.nombre} (Val F1)`}
                                  stroke={color.val}
                                  strokeWidth={2.5}
                                  dot={false}
                                  connectNulls={false}
                                />
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
