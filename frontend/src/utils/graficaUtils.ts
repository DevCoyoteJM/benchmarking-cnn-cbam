import type {
  RegistroHistorialEntrenamiento,
  EtapaEntrenamiento,
} from "../data/historialEntrenamiento";
import type { ResultadoModelo } from "../data/resultados";

/**
 * Valida si un valor numérico de métrica está en el rango estándar [0, 1]
 * (o [-1, 1] para métricas que admiten valores negativos como MCC).
 */
export function esValorMetricaValido(
  valor: unknown,
  opciones?: { permiteNegativo?: boolean }
): valor is number {
  const min = opciones?.permiteNegativo ? -1 : 0;
  return (
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor >= min &&
    valor <= 1
  );
}

export interface PuntoCurvaEpoca {
  epoca: number;
  [claveSerie: string]: number | null;
}

/**
 * Construye los puntos de datos por época para las gráficas Recharts.
 * - Respeta las longitudes reales de las series de cada modelo.
 * - Los valores faltantes se asignan estrictamente como `null` (NUNCA como 0).
 * - Permite comparar modelos con cantidades distintas de épocas.
 */
export function construirDatosEpocas(
  historiales: RegistroHistorialEntrenamiento[],
  etapaActiva: "E1" | "E2",
  clavesMetricas: Array<keyof EtapaEntrenamiento>
): PuntoCurvaEpoca[] {
  let maxEpocas = 0;

  historiales.forEach((h) => {
    const etapa =
      h.etapas[etapaActiva] ?? h.etapas[etapaActiva.toLowerCase()];
    if (!etapa) return;

    clavesMetricas.forEach((clave) => {
      const serie = etapa[clave];
      if (Array.isArray(serie) && serie.length > maxEpocas) {
        maxEpocas = serie.length;
      }
    });
  });

  if (maxEpocas === 0) return [];

  const puntos: PuntoCurvaEpoca[] = [];

  for (let i = 0; i < maxEpocas; i++) {
    const punto: PuntoCurvaEpoca = { epoca: i + 1 };

    historiales.forEach((h) => {
      const etapa =
        h.etapas[etapaActiva] ?? h.etapas[etapaActiva.toLowerCase()];
      if (!etapa) return;

      clavesMetricas.forEach((clave) => {
        const serie = etapa[clave];
        const claveSerie = `${h.modeloId}_${clave}`;

        if (Array.isArray(serie) && i < serie.length) {
          const valor = serie[i];
          punto[claveSerie] =
            typeof valor === "number" && Number.isFinite(valor)
              ? valor
              : null;
        } else {
          punto[claveSerie] = null; // No interpolar épocas faltantes con cero
        }
      });
    });

    puntos.push(punto);
  }

  return puntos;
}

export interface ResumenMetricasE1 {
  modeloId: string;
  nombreModelo: string;
  epocas: number | null;
  mejorValDice: number | null;
  valDiceFinal: number | null;
  iou: number | null;
  trainLossFinal: number | null;
  valLossFinal: number | null;
  estado: string;
}

export interface ResumenMetricasE2 {
  modeloId: string;
  nombreModelo: string;
  epocas: number | null;
  mejorValMcc: number | null;
  valMccFinal: number | null;
  mejorValF1: number | null;
  valF1Final: number | null;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  rocAuc: number | null;
  trainLossFinal: number | null;
  valLossFinal: number | null;
  estado: string;
}

/**
 * Formatea un valor numérico como porcentaje o decimal.
 * Si no está disponible o no es finito, retorna estrictamente "No disponible".
 */
export function formatearMetrica(
  valor: number | null | undefined,
  opciones?: { porcentaje?: boolean; decimales?: number }
): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return "No disponible";
  }

  const decimales = opciones?.decimales ?? (opciones?.porcentaje ? 2 : 4);

  if (opciones?.porcentaje) {
    return `${(valor * 100).toFixed(decimales)}%`;
  }

  return valor.toFixed(decimales);
}

/**
 * Formatea la pérdida de entrenamiento y validación final.
 */
export function formatearPerdida(
  trainLoss: number | null | undefined,
  valLoss: number | null | undefined
): string {
  const trainStr =
    typeof trainLoss === "number" && Number.isFinite(trainLoss)
      ? trainLoss.toFixed(4)
      : null;
  const valStr =
    typeof valLoss === "number" && Number.isFinite(valLoss)
      ? valLoss.toFixed(4)
      : null;

  if (trainStr && valStr) {
    return `Train: ${trainStr} | Val: ${valStr}`;
  }
  if (valStr) {
    return `Val: ${valStr}`;
  }
  if (trainStr) {
    return `Train: ${trainStr}`;
  }
  return "No disponible";
}

/**
 * Extrae y sintetiza el resumen metodológico de métricas de la Etapa E1 (Segmentación y detección).
 */
export function obtenerResumenE1(
  modeloId: string,
  nombreModelo: string,
  historial?: RegistroHistorialEntrenamiento,
  experimento?: ResultadoModelo
): ResumenMetricasE1 {
  const etapaE1 = historial?.etapas["E1"] ?? historial?.etapas["e1"];

  const diceSerie = Array.isArray(etapaE1?.val_dice) ? etapaE1.val_dice : [];
  const trainLossSerie = Array.isArray(etapaE1?.train_loss)
    ? etapaE1.train_loss
    : [];
  const valLossSerie = Array.isArray(etapaE1?.val_loss) ? etapaE1.val_loss : [];

  const epocas =
    diceSerie.length > 0
      ? diceSerie.length
      : trainLossSerie.length > 0
        ? trainLossSerie.length
        : null;
  const mejorValDice =
    diceSerie.length > 0
      ? Math.max(...diceSerie)
      : (experimento?.metricas?.dice ?? null);
  const valDiceFinal =
    diceSerie.length > 0 ? diceSerie[diceSerie.length - 1] : null;

  const iou =
    experimento?.tarea === "segmentacion" &&
    typeof experimento?.metricas?.iou === "number"
      ? experimento.metricas.iou
      : null;

  const trainLossFinal =
    trainLossSerie.length > 0
      ? trainLossSerie[trainLossSerie.length - 1]
      : null;
  const valLossFinal =
    valLossSerie.length > 0 ? valLossSerie[valLossSerie.length - 1] : null;

  let estado = "Pendiente";
  if (historial) {
    estado =
      epocas && epocas >= 40
        ? `Entrenado (${epocas} épocas)`
        : "Parcial";
  } else if (experimento?.estado) {
    estado =
      experimento.estado.charAt(0).toUpperCase() +
      experimento.estado.slice(1);
  }

  return {
    modeloId,
    nombreModelo,
    epocas,
    mejorValDice,
    valDiceFinal,
    iou,
    trainLossFinal,
    valLossFinal,
    estado,
  };
}

/**
 * Extrae y sintetiza el resumen metodológico de métricas de la Etapa E2 (Clasificación de malignidad).
 */
export function obtenerResumenE2(
  modeloId: string,
  nombreModelo: string,
  historial?: RegistroHistorialEntrenamiento,
  experimento?: ResultadoModelo
): ResumenMetricasE2 {
  const etapaE2 = historial?.etapas["E2"] ?? historial?.etapas["e2"];

  const mccSerie = Array.isArray(etapaE2?.val_mcc) ? etapaE2.val_mcc : [];
  const f1Serie = Array.isArray(etapaE2?.val_f1) ? etapaE2.val_f1 : [];
  const trainLossSerie = Array.isArray(etapaE2?.train_loss)
    ? etapaE2.train_loss
    : [];
  const valLossSerie = Array.isArray(etapaE2?.val_loss) ? etapaE2.val_loss : [];

  const epocas =
    mccSerie.length > 0
      ? mccSerie.length
      : trainLossSerie.length > 0
        ? trainLossSerie.length
        : null;

  const mejorValMcc =
    mccSerie.length > 0
      ? Math.max(...mccSerie)
      : (experimento?.metricas?.mcc ?? null);
  const valMccFinal =
    mccSerie.length > 0 ? mccSerie[mccSerie.length - 1] : null;

  const mejorValF1 =
    f1Serie.length > 0
      ? Math.max(...f1Serie)
      : (experimento?.metricas?.f1Score ?? null);
  const valF1Final =
    f1Serie.length > 0 ? f1Serie[f1Serie.length - 1] : null;

  const esClasif = experimento?.tarea === "clasificacion";
  const accuracy =
    esClasif && typeof experimento?.metricas?.accuracy === "number"
      ? experimento.metricas.accuracy
      : null;
  const precision =
    esClasif && typeof experimento?.metricas?.precision === "number"
      ? experimento.metricas.precision
      : null;
  const recall =
    esClasif && typeof experimento?.metricas?.recall === "number"
      ? experimento.metricas.recall
      : null;
  const rocAuc =
    esClasif && typeof experimento?.metricas?.rocAuc === "number"
      ? experimento.metricas.rocAuc
      : null;

  const trainLossFinal =
    trainLossSerie.length > 0
      ? trainLossSerie[trainLossSerie.length - 1]
      : null;
  const valLossFinal =
    valLossSerie.length > 0 ? valLossSerie[valLossSerie.length - 1] : null;

  let estado = "Pendiente";
  if (historial) {
    estado =
      epocas && epocas >= 100
        ? "Entrenado (100 épocas)"
        : epocas
          ? `Parcial (${epocas} épocas)`
          : "Parcial";
  } else if (experimento?.estado) {
    estado =
      experimento.estado.charAt(0).toUpperCase() +
      experimento.estado.slice(1);
  }

  return {
    modeloId,
    nombreModelo,
    epocas,
    mejorValMcc,
    valMccFinal,
    mejorValF1,
    valF1Final,
    accuracy,
    precision,
    recall,
    rocAuc,
    trainLossFinal,
    valLossFinal,
    estado,
  };
}

export interface InfoHistorialExperimento {
  tieneHistorial: boolean;
  archivoOrigen: string | null;
  fechaImportacion: string | null;
  e1Disponible: boolean;
  epocasE1: number | null;
  e2Disponible: boolean;
  epocasE2: number | null;
  estadoCalculado: "Con historial" | "Pendiente";
}

/**
 * Extrae y sintetiza dinámicamente la información de un historial de entrenamiento
 * almacenado en IndexedDB para la ficha técnica del experimento.
 */
export function obtenerInfoHistorialExperimento(
  historial?: RegistroHistorialEntrenamiento
): InfoHistorialExperimento {
  if (!historial) {
    return {
      tieneHistorial: false,
      archivoOrigen: null,
      fechaImportacion: null,
      e1Disponible: false,
      epocasE1: null,
      e2Disponible: false,
      epocasE2: null,
      estadoCalculado: "Pendiente",
    };
  }

  const etapaE1 = historial.etapas["E1"] ?? historial.etapas["e1"];
  const etapaE2 = historial.etapas["E2"] ?? historial.etapas["e2"];

  const epocasE1 =
    Array.isArray(etapaE1?.val_dice) && etapaE1.val_dice.length > 0
      ? etapaE1.val_dice.length
      : Array.isArray(etapaE1?.train_loss) && etapaE1.train_loss.length > 0
        ? etapaE1.train_loss.length
        : null;

  const epocasE2 =
    Array.isArray(etapaE2?.val_mcc) && etapaE2.val_mcc.length > 0
      ? etapaE2.val_mcc.length
      : Array.isArray(etapaE2?.train_loss) && etapaE2.train_loss.length > 0
        ? etapaE2.train_loss.length
        : null;

  const e1Disponible = epocasE1 !== null && epocasE1 > 0;
  const e2Disponible = epocasE2 !== null && epocasE2 > 0;
  const tieneHistorial = e1Disponible || e2Disponible;

  return {
    tieneHistorial,
    archivoOrigen: historial.nombreArchivo || null,
    fechaImportacion: historial.fechaImportacion || null,
    e1Disponible,
    epocasE1,
    e2Disponible,
    epocasE2,
    estadoCalculado: tieneHistorial ? "Con historial" : "Pendiente",
  };
}

/**
 * Formatea fechas ISO o de texto en un formato legible en español.
 */
export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return "Sin registrar";
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return fecha;
  }
}

