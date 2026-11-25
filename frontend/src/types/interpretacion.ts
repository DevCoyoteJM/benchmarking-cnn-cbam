/**
 * Tipos e interfaces para el modelo de interpretación científica de PulmoVision AI.
 * Basado estrictamente en la auditoría empírica de datos del notebook
 * LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb y los historiales JSON.
 */

export type OrigenMetrica = 'entrenamiento' | 'validacion' | 'prueba_independiente';

export type EtapaExperimental = 'E1' | 'E2';

export type IdArquitectura =
  | 'unet'
  | 'unet-cbam'
  | 'modcbam'
  | 'transunet'
  | 'swin-unetr-kan-3d';

export type UnidadAnalisis =
  | 'parches_2d_96x96'
  | 'nodulos_2d_96x96'
  | 'volumenes_3d';

export interface DistribucionClasesMalignidad {
  benignos: number; // Nódulos clases 1 y 2
  malignos: number; // Nódulos clases 4 y 5
  total: number;
  porcentajeMalignidad: number;
}

export interface MetadatosMuestra {
  unidad: UnidadAnalisis;
  tamanoMuestra: number;
  criterioInclusion: string;
  particionPacienteDisjunta: boolean; // Semilla 42 estratificada por paciente
  distribucionClases?: DistribucionClasesMalignidad;
}

/**
 * Métricas de la Etapa 1: Segmentación y Detección de lesiones nodulares.
 */
export interface MetricasE1 {
  dice: number; // Coeficiente de similitud de Dice (0..1)
  iou: number; // Intersección sobre Unión (Jaccard) (0..1)
  hd95Mm?: number; // Distancia de Hausdorff al percentil 95 en mm (menor es mejor)
  f1Det?: number; // F1 score de detección de presencia de nódulo vs parénquima sano (0..1)
}

/**
 * Métricas de la Etapa 2: Clasificación de Malignidad (Benigno vs Maligno).
 */
export interface MetricasE2 {
  f1Macro: number; // F1 Score macro-promediado
  mcc: number; // Coeficiente de correlación de Matthews (-1..1)
  rocAuc: number; // Área bajo la curva ROC (0..1)
  accuracy: number; // Exactitud global (0..1)
  sensibilidad: number; // Tasa de verdaderos positivos en Malignidad (Recall)
  especificidad: number; // Tasa de verdaderos negativos en Benignidad
}

/**
 * Mediciones de rendimiento computacional en hardware real.
 */
export interface MetricasHardware {
  parametrosMillones: number;
  latenciaMs: number; // Tiempo por imagen en milisegundos (batch=1)
  fps: number; // Cuadros procesados por segundo (1000 / latencia)
  dispositivo: string;
  condicionesMedicion: {
    batchSize: number;
    precision: string;
    resolucionEntrada: string;
    iteraciones: number;
    iteracionesCalentamiento: number;
  };
  vramMb: number | null; // null si no fue medido empíricamente
  vramMedidaEnNotebook: boolean; // false si no fue instrumentada formalmente
}

/**
 * Dinámica de convergencia registrada durante el entrenamiento.
 */
export interface DinamicaEntrenamientoE1 {
  epocasEfectivas: number;
  epocasConfiguradas: number;
  criterioParada: string;
  paciencia: number;
  trainLossFinal: number;
  valLossMinimo: number;
  valDicePico: number;
  epocaPico: number;
}

export interface DinamicaEntrenamientoE2 {
  epocasEfectivas: number;
  epocasConfiguradas: number;
  criterioParada: string;
  paciencia: number;
  trainLossFinal: number;
  valLossMinimo: number;
  valMccPico: number;
  valF1Pico: number;
  epocaPico: number;
}

/**
 * Resultado estructurado para una arquitectura en la Etapa 1.
 */
export interface ResultadoArquitecturaE1 {
  arquitecturaId: IdArquitectura;
  nombre: string;
  categoria: string;
  etapa: 'E1';
  origen: 'prueba_independiente';
  muestra: MetadatosMuestra;
  metricas: MetricasE1;
  dinamicaEntrenamiento?: DinamicaEntrenamientoE1;
  evidenciasAsociadas: string[]; // IDs de evidencias EV-01..EV-08
}

/**
 * Resultado estructurado para una arquitectura en la Etapa 2.
 */
export interface ResultadoArquitecturaE2 {
  arquitecturaId: IdArquitectura;
  nombre: string;
  categoria: string;
  etapa: 'E2';
  origen: 'prueba_independiente';
  muestra: MetadatosMuestra;
  metricas: MetricasE2;
  dinamicaEntrenamiento?: DinamicaEntrenamientoE2;
  evidenciasAsociadas: string[]; // IDs de evidencias EV-01..EV-08
}

/**
 * Registro unificado de evaluación para una arquitectura (E1 + E2 + Hardware).
 */
export interface RegistroEvaluacionArquitectura {
  id: IdArquitectura;
  nombre: string;
  categoria: string;
  esReferencia3D: boolean;
  e1: ResultadoArquitecturaE1;
  e2: ResultadoArquitecturaE2;
  hardware: MetricasHardware;
}

/**
 * Tipo de comparabilidad entre modelos para evitar inferencias ilegítimas.
 */
export type TipoComparabilidad =
  | 'equivalente'
  | 'asimetrica_parada_temprana'
  | 'heterogenea_2d_vs_3d'
  | 'no_comparable';

export interface EstadoComparabilidad {
  comparable: boolean;
  tipo: TipoComparabilidad;
  motivo: string;
  advertencia?: string;
}

export type SeveridadAdvertencia = 'informativa' | 'moderada' | 'critica';

export interface AdvertenciaMetodologica {
  id: string;
  severidad: SeveridadAdvertencia;
  titulo: string;
  descripcion: string;
  justificacionCientifica: string;
  afectaModelos?: IdArquitectura[];
  afectaEtapa?: EtapaExperimental;
}

export type NivelCertezaCientifica =
  | 'demostrado_empiricamente'
  | 'correlacion_observada_sin_causalidad'
  | 'hipotesis_requiere_estudio';

export interface EvidenciaCuantitativaEnlace {
  metrica: string;
  etapa: EtapaExperimental;
  valor: number | string;
  modelo: string;
  comparacion?: string;
}

export interface ConclusionRespaldada {
  id: string;
  categoria: 'segmentacion' | 'clasificacion' | 'atencion' | 'eficiencia_hardware';
  titulo: string;
  afirmacion: string;
  nivelCerteza: NivelCertezaCientifica;
  evidenciasCuantitativas: EvidenciaCuantitativaEnlace[];
  evidenciasVisuales: string[]; // ['EV-03', 'EV-05', etc.]
  limitacionesYAdvertencias: string[];
}

export interface ItemOrdenadoMetrica {
  arquitecturaId: IdArquitectura;
  nombre: string;
  valor: number | null;
  formato: string;
  esMejor: boolean;
  esPeor: boolean;
  esReferencia3D?: boolean;
}

export interface ComparacionPorMetrica {
  metrica: string;
  etapa: EtapaExperimental;
  origen: OrigenMetrica;
  unidadMuestral: UnidadAnalisis;
  tamanoMuestra: number;
  direccionOptima: 'mayor_es_mejor' | 'menor_es_mejor';
  ranking: ItemOrdenadoMetrica[];
  advertencias: string[];
}

/**
 * Síntesis transversal por arquitectura (Apartado C4).
 */
export interface SintesisArquitecturaTransversal {
  id: IdArquitectura;
  nombre: string;
  categoria: string;
  color: string;
  fortalezasE1: string[];
  fortalezasE2: string[];
  limitacionesObservadas: string[];
  complejidadComputacional: {
    parametrosMillones: number;
    latenciaMs: number;
    fps: number;
    vram: string; // 'No disponible'
    dispositivo: string;
  };
  escenariosRecomendados: string[];
  advertenciasInterpretacion: string[];
}

/**
 * Compromiso experimental (Trade-off) multidimensional (Apartado C3).
 */
export interface CompromisoArquitectonico {
  id: string;
  titulo: string;
  dimensiones: [string, string];
  descripcion: string;
  hallazgoEmpirico: string;
  implicacionClinica: string;
}

/**
 * ============================================================================
 * SECCIÓN D — CONVERGENCIA Y DINÁMICA DE ENTRENAMIENTO (FASE 4.7E)
 * ============================================================================
 */

export interface SerieConvergenciaE1 {
  arquitecturaId: IdArquitectura;
  nombre: string;
  color: string;
  epocasEfectivas: number;
  epocasConfiguradas: number; // 150
  pacienciaEarlyStopping: number; // 25
  trainLoss: number[];
  valLoss: number[];
  valDice: number[];
  mejorEpocaDice: number; // 1-indexed
  mejorValDice: number;
  ultimoValDice: number;
  diferenciaDicePicoFinal: number; // mejorValDice - ultimoValDice
  trainLossInicial: number;
  trainLossFinal: number;
  valLossInicial: number;
  valLossFinal: number;
  valLossMinimo: number;
  epocaValLossMinimo: number; // 1-indexed
  brechaPerdidaFinal: number; // valLossFinal - trainLossFinal
  brechaPerdidaEnMejorDice: number;
  volatilidadValDice: number; // Desviación estándar de primeras diferencias
}

export interface SerieConvergenciaE2 {
  arquitecturaId: IdArquitectura;
  nombre: string;
  color: string;
  epocasEfectivas: number; // 100
  epocasConfiguradas: number; // 100
  encoderCongelado: boolean; // true
  trainLoss: number[];
  valLoss: number[];
  valMcc: number[];
  valF1: number[];
  mejorEpocaMcc: number; // 1-indexed
  mejorValMcc: number;
  ultimoValMcc: number;
  diferenciaMccPicoFinal: number; // mejorValMcc - ultimoValMcc
  mejorEpocaF1: number; // 1-indexed
  mejorValF1: number;
  ultimoValF1: number;
  diferenciaF1PicoFinal: number; // mejorValF1 - ultimoValF1
  trainLossInicial: number;
  trainLossFinal: number;
  valLossInicial: number;
  valLossFinal: number;
  valLossMinimo: number;
  epocaValLossMinimo: number; // 1-indexed
  brechaPerdidaFinal: number; // valLossFinal - trainLossFinal
  brechaPerdidaEnMejorMcc: number;
  volatilidadValMcc: number; // Desviación estándar de primeras diferencias
  volatilidadValF1: number;
}

export interface IndicadorEstabilidadConvergencia {
  id: string;
  nombre: string;
  formula: string;
  descripcionSignificado: string;
  unidad: string;
  valoresE1: Record<'unet' | 'unet-cbam' | 'modcbam' | 'transunet', number>;
  valoresE2: Record<'unet' | 'unet-cbam' | 'modcbam' | 'transunet', number>;
  interpretacionCientifica: string;
}

export interface AnalisisBrechaGeneralizacion {
  arquitecturaId: IdArquitectura;
  nombre: string;
  color: string;
  etapa: EtapaExperimental;
  brechaPerdida: number; // val_loss - train_loss
  nivelBrecha: 'moderada' | 'reducida' | 'minima';
  hallazgoEmpirico: string;
  alertaRigor: string;
}

export interface SintesisConvergenciaArquitectura {
  arquitecturaId: IdArquitectura;
  nombre: string;
  categoria: string;
  color: string;
  convergenciaE1: {
    epocas: number;
    mejorEpocaDice: number;
    mejorDice: number;
    ultimoDice: number;
    degradacionPico: number;
    dinamicaEarlyStopping: string;
    perdidas: string;
  };
  convergenciaE2: {
    epocas: number;
    mejorEpocaMcc: number;
    mejorMcc: number;
    ultimoMcc: number;
    mejorEpocaF1: number;
    mejorF1: number;
    ultimoF1: number;
    dinamicaEncoderCongelado: string;
    perdidas: string;
  };
  estabilidadObservada: {
    volatilidadDice: number;
    volatilidadMcc: number;
    volatilidadF1: number;
    descripcionEstabilidad: string;
  };
  brechasGeneralizacion: {
    brechaE1: number;
    brechaE2: number;
    interpretacionBrecha: string;
  };
  limitacionesMetodologicas: string[];
}
