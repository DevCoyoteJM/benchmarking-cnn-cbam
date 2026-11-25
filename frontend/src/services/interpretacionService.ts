/**
 * Servicio de interpretación científica integrada para PulmoVision AI.
 * Consolida los resultados experimentales canónicos de las etapas E1 (Segmentación)
 * y E2 (Clasificación), hardware (RTX 5060 Ti) y correspondencias con evidencias visuales (EV-01..EV-08).
 *
 * Principios rectores:
 * 1. Trazabilidad absoluta a datos auditados (Celda 34, Celda 48, historiales JSON).
 * 2. Cero invención de métricas; VRAM se reporta explícitamente como no medida en notebook.
 * 3. Prohibición de rankings globales arbitrarios (comparación multi-criterio objetiva).
 * 4. Distinción explícita entre hechos probados e hipótesis no demostradas.
 */

import {
  type AdvertenciaMetodologica,
  type AnalisisBrechaGeneralizacion,
  type ComparacionPorMetrica,
  type CompromisoArquitectonico,
  type ConclusionRespaldada,
  type EstadoComparabilidad,
  type EtapaExperimental,
  type IdArquitectura,
  type IndicadorEstabilidadConvergencia,
  type ItemOrdenadoMetrica,
  type MetadatosMuestra,
  type MetricasE1,
  type MetricasE2,
  type MetricasHardware,
  type RegistroEvaluacionArquitectura,
  type ResultadoArquitecturaE1,
  type ResultadoArquitecturaE2,
  type SerieConvergenciaE1,
  type SerieConvergenciaE2,
  type SintesisArquitecturaTransversal,
  type SintesisConvergenciaArquitectura,
} from '../types/interpretacion';
import { HISTORIALES_CANONICOS } from '../data/historialesCanonicos';

// ============================================================================
// METADATOS MUESTRALES AUDITADOS (CELDA 1 Y CELDA 3 DEL NOTEBOOK)
// ============================================================================

export const METADATOS_MUESTRA_E1: MetadatosMuestra = {
  unidad: 'parches_2d_96x96',
  tamanoMuestra: 762,
  criterioInclusion:
    'Parches axiales 2D (96x96 píxeles) extraídos del corte central z con nódulo (clevel=0.50, >=3mm) y parches negativos de control de parénquima sano',
  particionPacienteDisjunta: true,
};

export const METADATOS_MUESTRA_E2: MetadatosMuestra = {
  unidad: 'nodulos_2d_96x96',
  tamanoMuestra: 213,
  criterioInclusion:
    'Nódulos 2D con diagnóstico de consenso patológico: Clases 1 y 2 (Benigno) vs Clases 4 y 5 (Maligno). Excluye clase 3 (indeterminado) y parches sanos',
  particionPacienteDisjunta: true,
  distribucionClases: {
    benignos: 150,
    malignos: 63,
    total: 213,
    porcentajeMalignidad: 29.58,
  },
};

// ============================================================================
// DATOS EMPÍRICOS CANÓNICOS (CELDAS 34 Y 48, HISTORIALES JSON)
// ============================================================================

export const REGISTROS_EVALUACION_CANONICOS: Record<IdArquitectura, RegistroEvaluacionArquitectura> = {
  unet: {
    id: 'unet',
    nombre: 'U-Net',
    categoria: 'CNN Base (Referencia)',
    esReferencia3D: false,
    e1: {
      arquitecturaId: 'unet',
      nombre: 'U-Net',
      categoria: 'CNN Base',
      etapa: 'E1',
      origen: 'prueba_independiente',
      muestra: METADATOS_MUESTRA_E1,
      metricas: {
        dice: 0.873,
        iou: 0.832,
        hd95Mm: 1.57,
        f1Det: 0.937,
      },
      dinamicaEntrenamiento: {
        epocasEfectivas: 80,
        epocasConfiguradas: 150,
        criterioParada: 'Early Stopping (paciencia 25)',
        paciencia: 25,
        trainLossFinal: 0.134,
        valLossMinimo: 0.1606,
        valDicePico: 0.895,
        epocaPico: 55,
      },
      evidenciasAsociadas: ['EV-01', 'EV-05', 'EV-06', 'EV-07', 'EV-08'],
    },
    e2: {
      arquitecturaId: 'unet',
      nombre: 'U-Net',
      categoria: 'CNN Base',
      etapa: 'E2',
      origen: 'prueba_independiente',
      muestra: METADATOS_MUESTRA_E2,
      metricas: {
        f1Macro: 0.853,
        mcc: 0.71,
        rocAuc: 0.914,
        accuracy: 0.883,
        sensibilidad: 0.73,
        especificidad: 0.947,
      },
      dinamicaEntrenamiento: {
        epocasEfectivas: 100,
        epocasConfiguradas: 100,
        criterioParada: 'Ciclo completo (100 épocas)',
        paciencia: 50,
        trainLossFinal: 0.312,
        valLossMinimo: 0.412,
        valMccPico: 0.7276,
        valF1Pico: 0.8573,
        epocaPico: 72,
      },
      evidenciasAsociadas: ['EV-02', 'EV-03', 'EV-04', 'EV-08'],
    },
    hardware: {
      parametrosMillones: 31.3,
      latenciaMs: 7.12,
      fps: 140.5,
      dispositivo: 'NVIDIA GeForce RTX 5060 Ti',
      condicionesMedicion: {
        batchSize: 1,
        precision: 'float32',
        resolucionEntrada: '1x1x96x96',
        iteraciones: 1000,
        iteracionesCalentamiento: 50,
      },
      vramMb: null,
      vramMedidaEnNotebook: false,
    },
  },

  'unet-cbam': {
    id: 'unet-cbam',
    nombre: 'U-Net + CBAM',
    categoria: 'CNN con Atención Dual (Canal + Espacio)',
    esReferencia3D: false,
    e1: {
      arquitecturaId: 'unet-cbam',
      nombre: 'U-Net + CBAM',
      categoria: 'CNN con Atención Dual',
      etapa: 'E1',
      origen: 'prueba_independiente',
      muestra: METADATOS_MUESTRA_E1,
      metricas: {
        dice: 0.881,
        iou: 0.831,
        hd95Mm: 1.76,
        f1Det: 0.973,
      },
      dinamicaEntrenamiento: {
        epocasEfectivas: 48,
        epocasConfiguradas: 150,
        criterioParada: 'Early Stopping (paciencia 25)',
        paciencia: 25,
        trainLossFinal: 0.1471,
        valLossMinimo: 0.1989,
        valDicePico: 0.8731,
        epocaPico: 23,
      },
      evidenciasAsociadas: ['EV-01', 'EV-05', 'EV-06', 'EV-07', 'EV-08'],
    },
    e2: {
      arquitecturaId: 'unet-cbam',
      nombre: 'U-Net + CBAM',
      categoria: 'CNN con Atención Dual',
      etapa: 'E2',
      origen: 'prueba_independiente',
      muestra: METADATOS_MUESTRA_E2,
      metricas: {
        f1Macro: 0.775,
        mcc: 0.561,
        rocAuc: 0.896,
        accuracy: 0.826,
        sensibilidad: 0.587,
        especificidad: 0.927,
      },
      dinamicaEntrenamiento: {
        epocasEfectivas: 100,
        epocasConfiguradas: 100,
        criterioParada: 'Ciclo completo (100 épocas)',
        paciencia: 50,
        trainLossFinal: 0.345,
        valLossMinimo: 0.448,
        valMccPico: 0.7293,
        valF1Pico: 0.8637,
        epocaPico: 75,
      },
      evidenciasAsociadas: ['EV-02', 'EV-03', 'EV-04', 'EV-08'],
    },
    hardware: {
      parametrosMillones: 31.34,
      latenciaMs: 10.29,
      fps: 97.2,
      dispositivo: 'NVIDIA GeForce RTX 5060 Ti',
      condicionesMedicion: {
        batchSize: 1,
        precision: 'float32',
        resolucionEntrada: '1x1x96x96',
        iteraciones: 1000,
        iteracionesCalentamiento: 50,
      },
      vramMb: null,
      vramMedidaEnNotebook: false,
    },
  },

  modcbam: {
    id: 'modcbam',
    nombre: 'ModCBAM',
    categoria: 'Variante Experimental Modificada',
    esReferencia3D: false,
    e1: {
      arquitecturaId: 'modcbam',
      nombre: 'ModCBAM',
      categoria: 'Variante Experimental',
      etapa: 'E1',
      origen: 'prueba_independiente',
      muestra: METADATOS_MUESTRA_E1,
      metricas: {
        dice: 0.893,
        iou: 0.846,
        hd95Mm: 1.72,
        f1Det: 0.973,
      },
      dinamicaEntrenamiento: {
        epocasEfectivas: 75,
        epocasConfiguradas: 150,
        criterioParada: 'Early Stopping (paciencia 25)',
        paciencia: 25,
        trainLossFinal: 0.1306,
        valLossMinimo: 0.1638,
        valDicePico: 0.8935,
        epocaPico: 50,
      },
      evidenciasAsociadas: ['EV-01', 'EV-05', 'EV-06', 'EV-07', 'EV-08'],
    },
    e2: {
      arquitecturaId: 'modcbam',
      nombre: 'ModCBAM',
      categoria: 'Variante Experimental',
      etapa: 'E2',
      origen: 'prueba_independiente',
      muestra: METADATOS_MUESTRA_E2,
      metricas: {
        f1Macro: 0.851,
        mcc: 0.702,
        rocAuc: 0.9,
        accuracy: 0.878,
        sensibilidad: 0.762,
        especificidad: 0.927,
      },
      dinamicaEntrenamiento: {
        epocasEfectivas: 100,
        epocasConfiguradas: 100,
        criterioParada: 'Ciclo completo (100 épocas)',
        paciencia: 50,
        trainLossFinal: 0.298,
        valLossMinimo: 0.395,
        valMccPico: 0.7388,
        valF1Pico: 0.8691,
        epocaPico: 54,
      },
      evidenciasAsociadas: ['EV-02', 'EV-03', 'EV-04', 'EV-08'],
    },
    hardware: {
      parametrosMillones: 31.34,
      latenciaMs: 11.04,
      fps: 90.6,
      dispositivo: 'NVIDIA GeForce RTX 5060 Ti',
      condicionesMedicion: {
        batchSize: 1,
        precision: 'float32',
        resolucionEntrada: '1x1x96x96',
        iteraciones: 1000,
        iteracionesCalentamiento: 50,
      },
      vramMb: null,
      vramMedidaEnNotebook: false,
    },
  },

  transunet: {
    id: 'transunet',
    nombre: 'TransUNet',
    categoria: 'Híbrido CNN-Transformer',
    esReferencia3D: false,
    e1: {
      arquitecturaId: 'transunet',
      nombre: 'TransUNet',
      categoria: 'Híbrido CNN-Transformer',
      etapa: 'E1',
      origen: 'prueba_independiente',
      muestra: METADATOS_MUESTRA_E1,
      metricas: {
        dice: 0.882,
        iou: 0.835,
        hd95Mm: 1.83,
        f1Det: 0.968,
      },
      dinamicaEntrenamiento: {
        epocasEfectivas: 106,
        epocasConfiguradas: 150,
        criterioParada: 'Early Stopping (paciencia 25)',
        paciencia: 25,
        trainLossFinal: 0.1257,
        valLossMinimo: 0.1657,
        valDicePico: 0.8969,
        epocaPico: 81,
      },
      evidenciasAsociadas: ['EV-01', 'EV-05', 'EV-06', 'EV-07', 'EV-08'],
    },
    e2: {
      arquitecturaId: 'transunet',
      nombre: 'TransUNet',
      categoria: 'Híbrido CNN-Transformer',
      etapa: 'E2',
      origen: 'prueba_independiente',
      muestra: METADATOS_MUESTRA_E2,
      metricas: {
        f1Macro: 0.808,
        mcc: 0.625,
        rocAuc: 0.809,
        accuracy: 0.85,
        sensibilidad: 0.651,
        especificidad: 0.933,
      },
      dinamicaEntrenamiento: {
        epocasEfectivas: 100,
        epocasConfiguradas: 100,
        criterioParada: 'Ciclo completo (100 épocas)',
        paciencia: 50,
        trainLossFinal: 0.362,
        valLossMinimo: 0.461,
        valMccPico: 0.6866,
        valF1Pico: 0.8359,
        epocaPico: 66,
      },
      evidenciasAsociadas: ['EV-02', 'EV-03', 'EV-04', 'EV-08'],
    },
    hardware: {
      parametrosMillones: 64.9,
      latenciaMs: 9.42,
      fps: 106.1,
      dispositivo: 'NVIDIA GeForce RTX 5060 Ti',
      condicionesMedicion: {
        batchSize: 1,
        precision: 'float32',
        resolucionEntrada: '1x1x96x96',
        iteraciones: 1000,
        iteracionesCalentamiento: 50,
      },
      vramMb: null,
      vramMedidaEnNotebook: false,
    },
  },

  'swin-unetr-kan-3d': {
    id: 'swin-unetr-kan-3d',
    nombre: 'Swin UNETR + KAN (Ref. 3D)',
    categoria: 'Referencia Tridimensional Externa',
    esReferencia3D: true,
    e1: {
      arquitecturaId: 'swin-unetr-kan-3d',
      nombre: 'Swin UNETR + KAN (Ref. 3D)',
      categoria: 'Referencia Tridimensional Externa',
      etapa: 'E1',
      origen: 'prueba_independiente',
      muestra: {
        unidad: 'volumenes_3d',
        tamanoMuestra: 762,
        criterioInclusion:
          'Métricas referenciales de tesis previa evaluadas sobre cortes volumétricos con contexto 3D',
        particionPacienteDisjunta: true,
      },
      metricas: {
        dice: 0.882,
        iou: 0.827,
        hd95Mm: 2.14,
        f1Det: 0.979,
      },
      evidenciasAsociadas: [],
    },
    e2: {
      arquitecturaId: 'swin-unetr-kan-3d',
      nombre: 'Swin UNETR + KAN (Ref. 3D)',
      categoria: 'Referencia Tridimensional Externa',
      etapa: 'E2',
      origen: 'prueba_independiente',
      muestra: {
        unidad: 'volumenes_3d',
        tamanoMuestra: 213,
        criterioInclusion:
          'Métricas referenciales de tesis previa sobre nódulos 3D',
        particionPacienteDisjunta: true,
      },
      metricas: {
        f1Macro: 0.891,
        mcc: 0.784,
        rocAuc: 0.928,
        accuracy: 0.911,
        sensibilidad: 0.806,
        especificidad: 0.956,
      },
      evidenciasAsociadas: [],
    },
    hardware: {
      parametrosMillones: 42.1,
      latenciaMs: 48.6,
      fps: 20.6,
      dispositivo: 'NVIDIA RTX (Referencia Externa)',
      condicionesMedicion: {
        batchSize: 1,
        precision: 'float32',
        resolucionEntrada: '3D Volumétrico',
        iteraciones: 100,
        iteracionesCalentamiento: 10,
      },
      vramMb: null,
      vramMedidaEnNotebook: false,
    },
  },
};

// ============================================================================
// ADVERTENCIAS METODOLÓGICAS AUDITADAS
// ============================================================================

export const ADVERTENCIAS_METODOLOGICAS_AUDITADAS: AdvertenciaMetodologica[] = [
  {
    id: 'ADV-01',
    severidad: 'moderada',
    titulo: 'Disparidad de épocas efectivas en Etapa 1 por Early Stopping',
    descripcion:
      'En E1 el entrenamiento empleó parada temprana con paciencia de 25 épocas según Dice de validación. Los modelos entrenaron durante duraciones dispares: U-Net (80), CBAM (48), ModCBAM (75) y TransUNet (106).',
    justificacionCientifica:
      'Ningún modelo completó el máximo configurado de 150 épocas. Las comparaciones de convergencia en E1 deben considerar que cada arquitectura alcanzó su criterio de detención en un punto temporal diferente.',
    afectaEtapa: 'E1',
    afectaModelos: ['unet', 'unet-cbam', 'modcbam', 'transunet'],
  },
  {
    id: 'ADV-02',
    severidad: 'critica',
    titulo: 'Correlación observada vs Causalidad no demostrada en U-Net + CBAM',
    descripcion:
      'U-Net + CBAM entrenó 48 épocas en E1 y obtuvo una sensibilidad en test de 0.587 en E2. No existe evidencia causal empírica en el notebook que demuestre que la parada temprana fue la causa directa de la baja sensibilidad.',
    justificacionCientifica:
      'No se realizó un experimento de ablación ni grupo de control entrenando CBAM por 80 o 100 épocas en E1. Vincular causalmente la parada temprana con la pérdida de sensibilidad es una hipótesis no demostrada que no debe presentarse como hecho comprobado.',
    afectaEtapa: 'E2',
    afectaModelos: ['unet-cbam'],
  },
  {
    id: 'ADV-03',
    severidad: 'moderada',
    titulo: 'Desbalance de clases en evaluación de malignidad (Etapa 2)',
    descripcion:
      'La cohorte de prueba independiente de E2 (N=213) contiene 150 nódulos benignos (70.42%) y 63 malignos (29.58%).',
    justificacionCientifica:
      'Debido al desbalance poblacional, la métrica de Exactitud global (Accuracy) está fuertemente ponderada hacia la Especificidad (Benignos). La Sensibilidad y el MCC proporcionan una evaluación clínica más fidedigna del desempeño diagnóstico.',
    afectaEtapa: 'E2',
  },
  {
    id: 'ADV-04',
    severidad: 'critica',
    titulo: 'Limitación dimensional: Parches 2D axiales vs Contexto Volumétrico 3D',
    descripcion:
      'Las cuatro arquitecturas principales procesan parches axiales 2D (96x96 píxeles) correspondientes al corte z central, mientras que la referencia Swin UNETR evalúa volúmenes 3D completos.',
    justificacionCientifica:
      'La comparación directa entre modelos 2D y la referencia 3D es heterogénea. La información de continuidad volumétrica inter-corte mejora la detección pero quintuplica el costo computacional.',
  },
  {
    id: 'ADV-05',
    severidad: 'informativa',
    titulo: 'Técnicas de interpretabilidad post-hoc vs Tensores de atención nativa CBAM',
    descripcion:
      'Las evidencias EV-06 (Saliencia) y EV-07 (Grad-CAM en down4) corresponden a métodos de gradiente post-hoc. No representan directamente los mapas de pesos espaciales (Ms) o de canal (Mc) generados internamente por CBAM.',
    justificacionCientifica:
      'Los mapas de saliencia reflejan la sensibilidad de píxeles al gradiente de la predicción, mientras que Grad-CAM localiza activaciones del cuello de botella convolucional.',
  },
  {
    id: 'ADV-06',
    severidad: 'informativa',
    titulo: 'Consumo de memoria VRAM no instrumentado en el notebook',
    descripcion:
      'El notebook original midió con rigor los parámetros, la latencia (ms) y los FPS en GPU RTX 5060 Ti con batch=1. No contiene instrumentación formal de torch.cuda.max_memory_allocated().',
    justificacionCientifica:
      'Para preservar la honestidad científica y evitar inventar datos no medidos, el campo VRAM se reporta como no disponible en el benchmark empírico formal.',
  },
  {
    id: 'ADV-07',
    severidad: 'moderada',
    titulo: 'Brecha de generalización en TransUNet: Múltiples factores concurrentes',
    descripcion:
      'TransUNet alcanzó la menor pérdida de entrenamiento en E1 (0.1257) y cuenta con 64.9M de parámetros, pero obtuvo el menor AUC en prueba ciega de E2 (0.809).',
    justificacionCientifica:
      'Esta brecha de generalización es compatible con sobreajuste, pero concurre con la ausencia de preentrenamiento a gran escala en parches de 96x96 y la carencia de sesgo inductivo convolucional característico de los Vision Transformers.',
    afectaEtapa: 'E2',
    afectaModelos: ['transunet'],
  },
];

// ============================================================================
// CONCLUSIONES RESPALDADAS EMPÍRICAMENTE
// ============================================================================

export const CONCLUSIONES_RESPALDADAS_AUDITADAS: ConclusionRespaldada[] = [
  {
    id: 'CONCL-01',
    categoria: 'segmentacion',
    titulo: 'ModCBAM alcanza el mayor solapamiento volumétrico (Dice e IoU) en prueba ciega',
    afirmacion:
      'ModCBAM obtiene el mayor coeficiente Dice (0.893) e IoU (0.846) en el conjunto de prueba independiente (N=762 parches), superando a U-Net base (+0.020 en Dice) y a TransUNet (+0.011).',
    nivelCerteza: 'demostrado_empiricamente',
    evidenciasCuantitativas: [
      { metrica: 'Dice', etapa: 'E1', valor: 0.893, modelo: 'ModCBAM', comparacion: '0.873 en U-Net (+2.3%)' },
      { metrica: 'IoU', etapa: 'E1', valor: 0.846, modelo: 'ModCBAM', comparacion: '0.832 en U-Net (+1.7%)' },
    ],
    evidenciasVisuales: ['EV-01', 'EV-05', 'EV-08'],
    limitacionesYAdvertencias: [
      'U-Net base conserva una mejor precisión en límites periféricos según HD95 (1.57 mm vs 1.72 mm).',
    ],
  },
  {
    id: 'CONCL-02',
    categoria: 'segmentacion',
    titulo: 'U-Net clásica lidera en precisión geométrica de contorno periférico (HD95)',
    afirmacion:
      'La U-Net convencional alcanza la menor distancia de Hausdorff al 95% (HD95 = 1.57 mm) frente a ModCBAM (1.72 mm), CBAM (1.76 mm) y TransUNet (1.83 mm).',
    nivelCerteza: 'demostrado_empiricamente',
    evidenciasCuantitativas: [
      { metrica: 'HD95 (mm)', etapa: 'E1', valor: 1.57, modelo: 'U-Net', comparacion: '1.72 mm en ModCBAM (-8.7% de error en contorno)' },
    ],
    evidenciasVisuales: ['EV-05', 'EV-08'],
    limitacionesYAdvertencias: [
      'Un menor HD95 indica bordes más regulares en nódulos nítidos, pero los mecanismos de atención capturan mejor nódulos tenues o pequeños.',
    ],
  },
  {
    id: 'CONCL-03',
    categoria: 'atencion',
    titulo: 'Los módulos de atención incrementan sustancialmente la detección de nódulos (F1-det)',
    afirmacion:
      'Tanto U-Net + CBAM como ModCBAM alcanzan un F1-det de 0.973 en la detección de presencia nodular frente al parénquima sano, superando ampliamente a la U-Net clásica (0.937).',
    nivelCerteza: 'demostrado_empiricamente',
    evidenciasCuantitativas: [
      { metrica: 'F1-det', etapa: 'E1', valor: 0.973, modelo: 'ModCBAM', comparacion: '0.937 en U-Net (+3.8%)' },
      { metrica: 'F1-det', etapa: 'E1', valor: 0.973, modelo: 'U-Net + CBAM', comparacion: '0.937 en U-Net (+3.8%)' },
    ],
    evidenciasVisuales: ['EV-05', 'EV-08'],
    limitacionesYAdvertencias: [
      'Medido sobre la tarea de detección con solapamiento IoU > 0.5 sobre parches de prueba.',
    ],
  },
  {
    id: 'CONCL-04',
    categoria: 'clasificacion',
    titulo: 'ModCBAM minimiza falsos negativos maximizando la sensibilidad diagnóstica',
    afirmacion:
      'En la clasificación de malignidad (N=213), ModCBAM alcanza la mayor sensibilidad (0.762 / 76.2%) entre los modelos 2D, cometiendo solo 15 falsos negativos frente a 17 de U-Net y 26 de CBAM.',
    nivelCerteza: 'demostrado_empiricamente',
    evidenciasCuantitativas: [
      { metrica: 'Sensibilidad', etapa: 'E2', valor: 0.762, modelo: 'ModCBAM', comparacion: '0.730 en U-Net y 0.587 en CBAM' },
      { metrica: 'F1-macro', etapa: 'E2', valor: 0.851, modelo: 'ModCBAM', comparacion: '0.853 en U-Net y 0.775 en CBAM' },
    ],
    evidenciasVisuales: ['EV-03', 'EV-04', 'EV-08'],
    limitacionesYAdvertencias: [
      'La especificidad de ModCBAM es de 0.927 frente a 0.947 de U-Net.',
    ],
  },
  {
    id: 'CONCL-05',
    categoria: 'clasificacion',
    titulo: 'U-Net clásica obtiene el mayor AUC (0.914) y MCC (0.710) impulsada por especificidad',
    afirmacion:
      'La U-Net base obtiene el mayor AUC global (0.914) y el mayor coeficiente de correlación de Matthews (0.710), sustentada en una alta especificidad (0.947, solo 8 falsos positivos en 150 benignos).',
    nivelCerteza: 'demostrado_empiricamente',
    evidenciasCuantitativas: [
      { metrica: 'AUC', etapa: 'E2', valor: 0.914, modelo: 'U-Net', comparacion: '0.900 en ModCBAM y 0.896 en CBAM' },
      { metrica: 'MCC', etapa: 'E2', valor: 0.71, modelo: 'U-Net', comparacion: '0.702 en ModCBAM y 0.561 en CBAM' },
    ],
    evidenciasVisuales: ['EV-03', 'EV-04'],
    limitacionesYAdvertencias: [
      'Su sensibilidad es menor (0.730 vs 0.762 de ModCBAM), omitiendo 17 neoplasias malignas.',
    ],
  },
  {
    id: 'CONCL-06',
    categoria: 'eficiencia_hardware',
    titulo: 'ModCBAM añade capacidad representacional con sobrecosto paramétrico despreciable',
    afirmacion:
      'ModCBAM añade apenas 0.04M de parámetros respecto a U-Net (31.34M vs 31.30M, +0.13%) e infiere a 90.6 FPS (11.04 ms/img) en GPU RTX 5060 Ti, superando la referencia operativa de 30 FPS utilizada para contextualizar la velocidad de inferencia interactiva.',
    nivelCerteza: 'demostrado_empiricamente',
    evidenciasCuantitativas: [
      { metrica: 'Parámetros', etapa: 'E1', valor: '31.34 M', modelo: 'ModCBAM', comparacion: '31.30 M en U-Net (+0.13%) y 64.90 M en TransUNet (-51.7%)' },
      { metrica: 'FPS', etapa: 'E1', valor: 90.6, modelo: 'ModCBAM', comparacion: '140.5 en U-Net y 106.1 en TransUNet' },
    ],
    evidenciasVisuales: [],
    limitacionesYAdvertencias: [
      'Medido con lote unitario (B=1) en precisión float32 bajo CUDA 12.2.',
    ],
  },
];

// ============================================================================
// FUNCIONES DEL SERVICIO DE INTERPRETACIÓN CIENTÍFICA
// ============================================================================

/**
 * Retorna todos los registros de evaluación canónicos.
 * @param incluirReferencia3D Si se incluye Swin UNETR + KAN (por defecto false para análisis estricto 2D).
 */
export function obtenerRegistrosEvaluacion(
  incluirReferencia3D = false
): RegistroEvaluacionArquitectura[] {
  const lista = Object.values(REGISTROS_EVALUACION_CANONICOS);
  return incluirReferencia3D
    ? lista
    : lista.filter((reg) => !reg.esReferencia3D);
}

/**
 * Retorna el registro de evaluación de una arquitectura específica.
 */
export function obtenerRegistroPorId(
  id: IdArquitectura
): RegistroEvaluacionArquitectura | undefined {
  return REGISTROS_EVALUACION_CANONICOS[id];
}

/**
 * Retorna únicamente los resultados de la Etapa 1 (Segmentación).
 */
export function obtenerResultadosE1(
  incluirReferencia3D = false
): ResultadoArquitecturaE1[] {
  return obtenerRegistrosEvaluacion(incluirReferencia3D).map((reg) => reg.e1);
}

/**
 * Retorna únicamente los resultados de la Etapa 2 (Clasificación).
 */
export function obtenerResultadosE2(
  incluirReferencia3D = false
): ResultadoArquitecturaE2[] {
  return obtenerRegistrosEvaluacion(incluirReferencia3D).map((reg) => reg.e2);
}

/**
 * Retorna las métricas de eficiencia computacional en hardware real.
 */
export function obtenerMetricasHardware(
  incluirReferencia3D = false
): Record<IdArquitectura, MetricasHardware> {
  const resultado: Partial<Record<IdArquitectura, MetricasHardware>> = {};
  for (const reg of obtenerRegistrosEvaluacion(incluirReferencia3D)) {
    resultado[reg.id] = reg.hardware;
  }
  return resultado as Record<IdArquitectura, MetricasHardware>;
}

/**
 * Retorna los metadatos de la muestra según la etapa experimental.
 */
export function obtenerMetadatosMuestra(
  etapa: EtapaExperimental
): MetadatosMuestra {
  return etapa === 'E1' ? METADATOS_MUESTRA_E1 : METADATOS_MUESTRA_E2;
}

/**
 * Retorna la lista auditada de advertencias metodológicas del estudio.
 */
export function obtenerAdvertenciasMetodologicas(): AdvertenciaMetodologica[] {
  return [...ADVERTENCIAS_METODOLOGICAS_AUDITADAS];
}

/**
 * Retorna la lista auditada de conclusiones respaldadas empíricamente.
 */
export function obtenerConclusionesRespaldadas(): ConclusionRespaldada[] {
  return [...CONCLUSIONES_RESPALDADAS_AUDITADAS];
}

/**
 * Evalúa el estado de comparabilidad formal entre dos modelos.
 * Protege contra inferencias inválidas entre condiciones dispares.
 */
export function evaluarComparabilidad(
  modeloAId: IdArquitectura,
  modeloBId: IdArquitectura,
  etapa: EtapaExperimental
): EstadoComparabilidad {
  const modA = REGISTROS_EVALUACION_CANONICOS[modeloAId];
  const modB = REGISTROS_EVALUACION_CANONICOS[modeloBId];

  if (!modA || !modB) {
    return {
      comparable: false,
      tipo: 'no_comparable',
      motivo: 'Uno o ambos identificadores de modelo no existen en el registro canónico.',
    };
  }

  // Regla 1: Comparación 2D vs 3D
  if (modA.esReferencia3D !== modB.esReferencia3D) {
    return {
      comparable: false,
      tipo: 'heterogenea_2d_vs_3d',
      motivo:
        'Comparación metodológicamente heterogénea entre arquitectura 2D (corte axial central) y referencia 3D (volumen completo).',
      advertencia:
        'Los modelos 3D acceden a información contextual en el eje z no disponible para las redes 2D, pero demandan mayor cómputo.',
    };
  }

  // Regla 2: Etapa 1 y disparidad de parada temprana
  if (etapa === 'E1') {
    const epA = modA.e1.dinamicaEntrenamiento?.epocasEfectivas;
    const epB = modB.e1.dinamicaEntrenamiento?.epocasEfectivas;
    if (epA && epB && epA !== epB) {
      return {
        comparable: true,
        tipo: 'asimetrica_parada_temprana',
        motivo: `Ambos modelos fueron evaluados sobre el mismo conjunto ciego N=762, pero sus encoders entrenaron con duraciones dispares debido al Early Stopping (${modA.nombre}: ${epA} épocas vs ${modB.nombre}: ${epB} épocas).`,
        advertencia:
          'La disparidad de épocas efectivas refleja la dinámica de parada adaptativa sobre Dice de validación.',
      };
    }
  }

  // Regla 3: Etapa 2 entre modelos 2D
  if (etapa === 'E2' && !modA.esReferencia3D && !modB.esReferencia3D) {
    return {
      comparable: true,
      tipo: 'equivalente',
      motivo:
        'Condiciones experimentales equivalentes: 100 épocas completas con encoder congelado sobre el mismo conjunto ciego de N=213 nódulos.',
    };
  }

  return {
    comparable: true,
    tipo: 'equivalente',
    motivo: 'Evaluación homogénea en conjunto de prueba independiente.',
  };
}

/**
 * Compara ordenadamente los modelos según una métrica específica de E1 o E2.
 * NO produce un ranking global arbitrario; evalúa la métrica solicitada con su dirección óptima.
 */
export function compararPorMetrica(
  metrica: keyof MetricasE1 | keyof MetricasE2,
  etapa: EtapaExperimental,
  incluirReferencia3D = false
): ComparacionPorMetrica {
  const registros = obtenerRegistrosEvaluacion(incluirReferencia3D);
  const muestra = obtenerMetadatosMuestra(etapa);
  const advertencias: string[] = [];

  const direccionOptima: 'mayor_es_mejor' | 'menor_es_mejor' =
    metrica === 'hd95Mm' ? 'menor_es_mejor' : 'mayor_es_mejor';

  const items: ItemOrdenadoMetrica[] = [];

  for (const reg of registros) {
    let valor: number | null = null;
    let formato = '0.000';

    if (etapa === 'E1') {
      const valE1 = (reg.e1.metricas as unknown as Record<string, unknown>)[metrica];
      if (typeof valE1 === 'number') {
        valor = valE1;
        formato = metrica === 'hd95Mm' ? `${valE1.toFixed(2)} mm` : valE1.toFixed(3);
      }
    } else {
      const valE2 = (reg.e2.metricas as unknown as Record<string, unknown>)[metrica];
      if (typeof valE2 === 'number') {
        valor = valE2;
        formato = valE2.toFixed(3);
      }
    }

    items.push({
      arquitecturaId: reg.id,
      nombre: reg.nombre,
      valor,
      formato,
      esMejor: false,
      esPeor: false,
      esReferencia3D: reg.esReferencia3D,
    });
  }

  // Filtrar elementos con valor definido para determinar mejor y peor entre modelos 2D
  const itemsConValor2D = items.filter(
    (item) => item.valor !== null && !item.esReferencia3D
  );

  if (itemsConValor2D.length > 0) {
    itemsConValor2D.sort((a, b) => {
      if (a.valor === null) return 1;
      if (b.valor === null) return -1;
      return direccionOptima === 'mayor_es_mejor'
        ? b.valor - a.valor
        : a.valor - b.valor;
    });

    const mejorValor = itemsConValor2D[0].valor;
    const peorValor = itemsConValor2D[itemsConValor2D.length - 1].valor;

    for (const item of items) {
      if (!item.esReferencia3D && item.valor !== null) {
        if (item.valor === mejorValor) item.esMejor = true;
        if (item.valor === peorValor) item.esPeor = true;
      }
    }
  }

  // Ordenamiento global de salida
  items.sort((a, b) => {
    // Si uno es referencia 3D, mantenerlo al final o en orden relativo
    if (a.valor === null) return 1;
    if (b.valor === null) return -1;
    return direccionOptima === 'mayor_es_mejor'
      ? b.valor - a.valor
      : a.valor - b.valor;
  });

  if (metrica === 'sensibilidad') {
    advertencias.push(
      'En E2, la sensibilidad evalúa la capacidad de detectar nódulos malignos (N=63 en test). ModCBAM alcanza la mayor sensibilidad (0.762).'
    );
  }
  if (metrica === 'hd95Mm') {
    advertencias.push(
      'La distancia de Hausdorff al 95% penaliza desviaciones en los contornos nodulares. Menores distancias indican contornos más precisos.'
    );
  }
  if (incluirReferencia3D) {
    advertencias.push(
      'La fila de referencia Swin UNETR + KAN evalúa contexto 3D; no es estrictamente comparable con la entrada 2D de 96x96.'
    );
  }

  return {
    metrica: String(metrica),
    etapa,
    origen: 'prueba_independiente',
    unidadMuestral: muestra.unidad,
    tamanoMuestra: muestra.tamanoMuestra,
    direccionOptima,
    ranking: items,
    advertencias,
  };
}

/**
 * Función que previene explícitamente la creación de un ranking global arbitrario.
 * Demuestra por qué un único número agregado es inválido y ofrece la alternativa clínica multi-objetivo.
 */
export function explicarInvalidezRankingGlobal(): {
  invalido: true;
  razonMetodologica: string;
  alternativaCientifica: string;
} {
  return {
    invalido: true,
    razonMetodologica:
      'Colapsar métricas de distinta naturaleza clínica (Dice, HD95, Sensibilidad oncológica, Latencia FPS) en un puntaje escalar único o ranking global inventa pesos arbitrarios sin justificación clínica ni teórica.',
    alternativaCientifica:
      'Utilizar análisis visual de compromisos multidimensionales (evaluación de tensiones entre métricas individuales sin combinarlas en una puntuación artificial): por ejemplo, ModCBAM prioriza Sensibilidad en E2 y Dice en E1, mientras U-Net destaca en especificidad y HD95.',
  };
}

/**
 * Retorna las métricas registradas disponibles para cada etapa experimental.
 */
export function obtenerMetricasDisponibles(etapa: EtapaExperimental): {
  clave: string;
  nombre: string;
  descripcion: string;
  direccionOptima: 'mayor_es_mejor' | 'menor_es_mejor';
}[] {
  if (etapa === 'E1') {
    return [
      {
        clave: 'dice',
        nombre: 'Coeficiente Dice',
        descripcion: 'Similitud de solapamiento volumétrico entre predicción y máscara real',
        direccionOptima: 'mayor_es_mejor',
      },
      {
        clave: 'iou',
        nombre: 'IoU (Jaccard)',
        descripcion: 'Intersección sobre unión de área delimitada',
        direccionOptima: 'mayor_es_mejor',
      },
      {
        clave: 'hd95Mm',
        nombre: 'HD95 (mm)',
        descripcion: 'Distancia de Hausdorff al percentil 95 en milímetros (contorno)',
        direccionOptima: 'menor_es_mejor',
      },
      {
        clave: 'f1Det',
        nombre: 'F1 Detección',
        descripcion: 'F1-score para detectar presencia de nódulo frente a parénquima sano',
        direccionOptima: 'mayor_es_mejor',
      },
    ];
  }

  return [
    {
      clave: 'f1Macro',
      nombre: 'F1 Macro',
      descripcion: 'F1-score macro-promediado equilibrando benignos y malignos',
      direccionOptima: 'mayor_es_mejor',
    },
    {
      clave: 'mcc',
      nombre: 'MCC',
      descripcion: 'Coeficiente de correlación de Matthews (-1 a +1)',
      direccionOptima: 'mayor_es_mejor',
    },
    {
      clave: 'rocAuc',
      nombre: 'AUC-ROC',
      descripcion: 'Área bajo la curva característica operativa del receptor',
      direccionOptima: 'mayor_es_mejor',
    },
    {
      clave: 'accuracy',
      nombre: 'Exactitud',
      descripcion: 'Proporción de predicciones correctas sobre el total',
      direccionOptima: 'mayor_es_mejor',
    },
    {
      clave: 'sensibilidad',
      nombre: 'Sensibilidad (Recall)',
      descripcion: 'Tasa de nódulos malignos correctamente diagnosticados',
      direccionOptima: 'mayor_es_mejor',
    },
    {
      clave: 'especificidad',
      nombre: 'Especificidad',
      descripcion: 'Tasa de nódulos benignos correctamente descartados',
      direccionOptima: 'mayor_es_mejor',
    },
  ];
}

// ============================================================================
// COMPROMISOS EXPERIMENTALES (TRADE-OFFS) Y SÍNTESIS TRANSVERSAL (FASE 4.7D)
// ============================================================================

export const COMPROMISOS_ARQUITECTONICOS_CANONICOS: CompromisoArquitectonico[] = [
  {
    id: 'TRADE-01',
    titulo: 'Solapamiento de Área (Dice) vs Precisión Periférica de Contorno (HD95)',
    dimensiones: ['Dice (E1)', 'HD95 mm (E1)'],
    descripcion:
      'Una mayor cobertura de área nodular no se traduce de forma automática en una frontera periférica más nítida o regular.',
    hallazgoEmpirico:
      'ModCBAM lidera en Dice (0.893) e IoU (0.846), pero U-Net clásica obtiene el menor error de distancia de Hausdorff (1.57 mm vs 1.72 mm en ModCBAM y 1.83 mm en TransUNet).',
    implicacionClinica:
      'Las ramas de atención expanden suavemente el campo receptivo capturando tejido periférico tenue (mayor solapamiento), mientras que las convoluciones estándar generan límites geométricos más compactos y regulares en lesiones macroscópicas bien delimitadas.',
  },
  {
    id: 'TRADE-02',
    titulo: 'Sensibilidad Oncológica (Minimizar FN) vs Especificidad (Minimizar FP)',
    dimensiones: ['Sensibilidad (E2)', 'Especificidad (E2)'],
    descripcion:
      'En el diagnóstico patológico bajo desbalance poblacional (70.4% benignos / 29.6% malignos), maximizar el acierto en tumores malignos condiciona la tasa de falsas alarmas.',
    hallazgoEmpirico:
      'ModCBAM prioriza la detección de cáncer alcanzando 76.2% de sensibilidad (48/63 nódulos malignos, solo 15 FN) con 92.7% de especificidad (11 FP). U-Net alcanza 94.7% de especificidad (solo 8 FP) a costa de reducir su sensibilidad a 73.0% (17 FN).',
    implicacionClinica:
      'En un protocolo de cribado poblacional, ModCBAM es clínicamente más protector al reducir neoplasias omitidas desatendidas. En entornos de confirmación prequirúrgica, la mayor especificidad de U-Net reduce biopsias invasivas no justificadas.',
  },
  {
    id: 'TRADE-03',
    titulo: 'Complejidad Paramétrica vs Rendimiento en Prueba Ciega',
    dimensiones: ['Parámetros (M)', 'AUC / Dice en Test'],
    descripcion:
      'Multiplicar la capacidad paramétrica de la red no garantiza una generalización proporcional sobre conjuntos de prueba independientes.',
    hallazgoEmpirico:
      'TransUNet incorpora 64.90M de parámetros (+107% frente a los 31.30M de U-Net base), pero obtiene un Dice menor a ModCBAM (0.882 vs 0.893) y el menor AUC en clasificación ciega (0.809 vs 0.914 en U-Net y 0.900 en ModCBAM).',
    implicacionClinica:
      'Los módulos de atención ligeros como CBAM y ModCBAM (+0.13% parámetros sobre U-Net) son más costo-efectivos para imágenes de 96×96 que arquitecturas híbridas Transformer densas cuando no se cuenta con preentrenamiento masivo auto-supervisado.',
  },
  {
    id: 'TRADE-04',
    titulo: 'Velocidad de Inferencia (FPS / Latencia) vs Capacidad Representacional',
    dimensiones: ['FPS / Latencia (ms)', 'Rendimiento Diagnóstico'],
    descripcion:
      'El costo computacional de los mecanismos de atención debe evaluarse contra el umbral de interactividad clínica en tiempo real.',
    hallazgoEmpirico:
      'U-Net ofrece la menor latencia (7.12 ms/img, 140.5 FPS). La atención dual añade sobrecosto moderado: CBAM (10.29 ms, 97.2 FPS) y ModCBAM (11.04 ms, 90.6 FPS), mientras TransUNet opera a 9.42 ms (106.1 FPS).',
    implicacionClinica:
      'Todas las cuatro arquitecturas 2D superan la referencia operativa de 30 FPS utilizada para contextualizar la velocidad de inferencia interactiva en GPU RTX 5060 Ti con batch=1. La ligera diferencia de latencia entre modelos no compromete la fluidez operativa.',
  },
];

export const SINTESIS_ARQUITECTURAS_CANONICAS: Record<IdArquitectura, SintesisArquitecturaTransversal> = {
  unet: {
    id: 'unet',
    nombre: 'U-Net',
    categoria: 'CNN Base Convolucional Canónica',
    color: 'unet',
    fortalezasE1: [
      'Menor distancia de Hausdorff al 95% (HD95 = 1.57 mm), delimitando contornos geométricos regulares y nítidos.',
      'Excelente solapamiento volumétrico de base (Dice = 0.873, IoU = 0.832).',
      'Máxima velocidad de procesamiento del benchmark (140.5 FPS, 7.12 ms de latencia).',
    ],
    fortalezasE2: [
      'Mayor discriminabilidad continua global (AUC-ROC = 0.914 en prueba ciega).',
      'Mayor coeficiente de correlación de Matthews (MCC = 0.710).',
      'Máxima especificidad diagnóstica (94.7%), cometiendo solo 8 falsos positivos sobre 150 benignos.',
      'Mayor exactitud global (88.3%) favorecida por la clase mayoritaria.',
    ],
    limitacionesObservadas: [
      'Menor sensibilidad diagnóstica en test (73.0%), dejando 17 nódulos malignos sin detectar (17 FN).',
      'Menor tasa de detección nodular periférica en E1 (F1-det = 0.937 frente a 0.973 en redes con atención).',
    ],
    complejidadComputacional: {
      parametrosMillones: 31.3,
      latenciaMs: 7.12,
      fps: 140.5,
      vram: 'No disponible',
      dispositivo: 'NVIDIA GeForce RTX 5060 Ti (batch=1, float32)',
    },
    escenariosRecomendados: [
      'Posible aplicación futura: Podría explorarse como filtro rápido de alta especificidad para descarte de nódulos benignos en flujos asistidos con cómputo restringido (hipótesis exploratoria, no constituye validación clínica).',
      'Posible aplicación futura: Delimitación de nódulos con contornos geométricos regulares y nítidos.',
    ],
    advertenciasInterpretacion: [
      'El alto AUC y exactitud global están fuertemente ponderados por el 70.4% de casos benignos del dataset.',
      'No debe inferirse como arquitectura óptima si el objetivo primordial es minimizar cánceres omitidos.',
    ],
  },

  'unet-cbam': {
    id: 'unet-cbam',
    nombre: 'U-Net + CBAM',
    categoria: 'CNN con Atención Dual Secuencial (Canal y Espacio)',
    color: 'cbam',
    fortalezasE1: [
      'Alta tasa de detección de presencia de lesiones (F1-det = 0.973, +3.8% sobre U-Net base).',
      'Solapamiento de área competitivo (Dice = 0.881, IoU = 0.831).',
      'Sobrecosto paramétrico mínimo (+0.04M parámetros, +0.13% sobre U-Net).',
    ],
    fortalezasE2: [
      'Alta especificidad en la cohorte de prueba (92.7%, 139/150 benignos correctamente descartados).',
      'Separabilidad continua robusta (AUC-ROC = 0.896).',
    ],
    limitacionesObservadas: [
      'Sensibilidad diagnóstica reducida en test de E2 (58.7%, 26 falsos negativos sobre 63 malignos).',
      'Mayor distancia periférica que la base (HD95 = 1.76 mm vs 1.57 mm).',
      'Entrenamiento E1 detenido tempranamente a las 48 épocas por criterio Early Stopping.',
    ],
    complejidadComputacional: {
      parametrosMillones: 31.34,
      latenciaMs: 10.29,
      fps: 97.2,
      vram: 'No disponible',
      dispositivo: 'NVIDIA GeForce RTX 5060 Ti (batch=1, float32)',
    },
    escenariosRecomendados: [
      'Posible aplicación futura: Podría explorarse en tareas de detección inicial donde los mapas de atención faciliten la localización de lesiones pequeñas (hipótesis exploratoria, no constituye validación clínica).',
      'Posible aplicación futura: Plataforma de investigación comparativa sobre mecanismos de atención dual modular en imagen médica 2D.',
    ],
    advertenciasInterpretacion: [
      'ADV-02: La correlación observada entre parada a 48 épocas y baja sensibilidad (58.7%) no tiene causalidad demostrada.',
      'No afirmar superioridad ni inferioridad absoluta sin considerar la tarea específica (detección vs diagnóstico).',
    ],
  },

  modcbam: {
    id: 'modcbam',
    nombre: 'ModCBAM',
    categoria: 'Variante Experimental con Integración Optimizada de Atención',
    color: 'modcbam',
    fortalezasE1: [
      'Mayor solapamiento volumétrico del estudio (Dice = 0.893 e IoU = 0.846 en prueba ciega N=762).',
      'Co-líder en tasa de detección nodular periférica (F1-det = 0.973, +3.8% sobre base).',
      'Supera a U-Net (+0.020 en Dice) y a TransUNet (+0.011) con solo +0.04M de parámetros.',
    ],
    fortalezasE2: [
      'Líder clínico en sensibilidad diagnóstica (76.2%, 48/63 nódulos malignos detectados).',
      'Minimiza los falsos negativos a solo 15 casos (frente a 17 en U-Net y 26 en CBAM estándar).',
      'MCC competitivo (0.702) y F1-Macro equilibrado (0.851) con alta exactitud (87.8%).',
    ],
    limitacionesObservadas: [
      'HD95 ligeramente superior a U-Net clásica (1.72 mm vs 1.57 mm en límites periféricos nítidos).',
      'Especificidad ligeramente menor que U-Net base (92.7% vs 94.7%, 11 FP vs 8 FP).',
    ],
    complejidadComputacional: {
      parametrosMillones: 31.34,
      latenciaMs: 11.04,
      fps: 90.6,
      vram: 'No disponible',
      dispositivo: 'NVIDIA GeForce RTX 5060 Ti (batch=1, float32)',
    },
    escenariosRecomendados: [
      'Posible aplicación futura: Podría explorarse como soporte de cribado donde la prioridad máxima sea minimizar neoplasias omitidas (falsos negativos) bajo supervisión médica directa (hipótesis exploratoria, no constituye validación clínica).',
      'Posible aplicación futura: Segmentación de lesiones nodulares con bordes tenues donde la atención optimice el solapamiento.',
    ],
    advertenciasInterpretacion: [
      'Convergencia adaptativa alcanzada a las 75 épocas en E1 (no completó las 150 configuradas).',
      'Existe un compromiso real: U-Net conserva una ligera ventaja en regularidad geométrica periférica (HD95).',
    ],
  },

  transunet: {
    id: 'transunet',
    nombre: 'TransUNet',
    categoria: 'Arquitectura Híbrida CNN-Transformer con Auto-Atención Global',
    color: 'transunet',
    fortalezasE1: [
      'Menor pérdida de entrenamiento alcanzada en E1 (train_loss = 0.1257), demostrando alta capacidad de ajuste.',
      'Rendimiento de solapamiento competitivo (Dice = 0.882, IoU = 0.835) y detección nodular robusta (F1-det = 0.968).',
      'Alta tasa de procesamiento en GPU (106.1 FPS, 9.42 ms) a pesar de la complejidad del Vision Transformer.',
    ],
    fortalezasE2: [
      'Especificidad diagnóstica robusta en prueba ciega (93.3%, 140/150 benignos descartados).',
      'MCC sólido (0.625) y exactitud global de 85.0%.',
    ],
    limitacionesObservadas: [
      'Mayor distancia periférica del estudio en E1 (HD95 = 1.83 mm, contornos más difusos en parches pequeños).',
      'Menor AUC en clasificación ciega de E2 (0.809 vs 0.914 en U-Net y 0.900 en ModCBAM).',
      'Duplicación del conteo de parámetros (64.90M vs 31.30M, +107%) sin ganancia proporcional en generalización.',
    ],
    complejidadComputacional: {
      parametrosMillones: 64.9,
      latenciaMs: 9.42,
      fps: 106.1,
      vram: 'No disponible',
      dispositivo: 'NVIDIA GeForce RTX 5060 Ti (batch=1, float32)',
    },
    escenariosRecomendados: [
      'Posible aplicación futura: Investigación metodológica sobre representaciones de largo alcance y arquitecturas Vision Transformer en tomografía.',
      'Posible aplicación futura: Experimentación en escenarios a gran escala donde se cuente con preentrenamiento auto-supervisado masivo.',
    ],
    advertenciasInterpretacion: [
      'ADV-07: La brecha de generalización en parches 2D concurre con la ausencia de sesgo inductivo y preentrenamiento masivo.',
      'No asumir que mayor número de parámetros garantiza superioridad en benchmarks ciegos de tamaño finito.',
    ],
  },

  'swin-unetr-kan-3d': {
    id: 'swin-unetr-kan-3d',
    nombre: 'Swin UNETR + KAN (Ref. 3D)',
    categoria: 'Referencia Tridimensional Externa (Tesis Bibliográfica)',
    color: 'ref-3d',
    fortalezasE1: [
      'Contexto volumétrico 3D completo con continuidad inter-corte.',
      'F1 de detección nodular volumétrica = 0.979.',
    ],
    fortalezasE2: [
      'Sensibilidad volumétrica referencial = 0.806 y Especificidad = 0.956.',
      'AUC-ROC referencial = 0.928.',
    ],
    limitacionesObservadas: [
      'No es metodológicamente comparable con las redes 2D (corte axial central 96×96).',
      'Mayor latencia computacional (48.6 ms/vol, 20.6 FPS) y demanda de memoria tridimensional.',
    ],
    complejidadComputacional: {
      parametrosMillones: 42.1,
      latenciaMs: 48.6,
      fps: 20.6,
      vram: 'No disponible',
      dispositivo: 'NVIDIA RTX (Referencia Externa Bibliográfica)',
    },
    escenariosRecomendados: [
      'Referencia bibliográfica externa 3D, no directamente comparable con el benchmark experimental 2D, para contextualizar el comportamiento sobre volúmenes tomográficos completos.',
    ],
    advertenciasInterpretacion: [
      'ADV-04: Comparación heterogénea 2D vs 3D. No debe incluirse en rankings experimentales con los 4 modelos propios.',
    ],
  },
};

/**
 * Retorna la síntesis transversal estructurada de las 4 arquitecturas propias (excluyendo referencia 3D).
 */
export function obtenerSintesisTransversalArquitecturas(
  incluirReferencia3D = false
): SintesisArquitecturaTransversal[] {
  const lista = Object.values(SINTESIS_ARQUITECTURAS_CANONICAS);
  return incluirReferencia3D
    ? lista
    : lista.filter((s) => s.id !== 'swin-unetr-kan-3d');
}

/**
 * Retorna los 4 compromisos experimentales canónicos auditados.
 */
export function obtenerCompromisosTransversales(): CompromisoArquitectonico[] {
  return [...COMPROMISOS_ARQUITECTONICOS_CANONICOS];
}

/**
 * Retorna los datos unificados de hardware para la tabla comparativa de complejidad.
 */
export function obtenerDatosComplejidadHardware(incluirReferencia3D = false): {
  arquitecturaId: IdArquitectura;
  nombre: string;
  categoria: string;
  color: string;
  parametrosMillones: number;
  latenciaMs: number;
  fps: number;
  hardware: string;
  batchSize: number;
  precision: string;
  vram: string;
  esReferencia3D: boolean;
}[] {
  const registros = obtenerRegistrosEvaluacion(incluirReferencia3D);
  return registros.map((r) => ({
    arquitecturaId: r.id,
    nombre: r.nombre,
    categoria: r.categoria,
    color: r.id === 'unet' ? 'unet' : r.id === 'unet-cbam' ? 'cbam' : r.id === 'modcbam' ? 'modcbam' : r.id === 'transunet' ? 'transunet' : 'ref-3d',
    parametrosMillones: r.hardware.parametrosMillones,
    latenciaMs: r.hardware.latenciaMs,
    fps: r.hardware.fps,
    hardware: r.hardware.dispositivo,
    batchSize: r.hardware.condicionesMedicion.batchSize,
    precision: r.hardware.condicionesMedicion.precision,
    vram: r.hardware.vramMb !== null ? `${r.hardware.vramMb} MB` : 'No disponible',
    esReferencia3D: r.esReferencia3D,
  }));
}

/**
 * ============================================================================
 * SERVICIOS DE CONVERGENCIA Y DINÁMICA DE ENTRENAMIENTO (FASE 4.7E)
 * ============================================================================
 */

/**
 * Calcula la desviación estándar de las primeras diferencias consecutivas de una serie:
 * sigma(Delta y) = sqrt( (1 / (N - 1)) * sum( (Delta y_t - media_Delta)^2 ) )
 * Mide la volatilidad / oscilación inter-época sin recurrir a puntuaciones artificiales.
 */
export function calcularDesviacionPrimerasDiferencias(arr: number[]): number {
  if (!arr || arr.length < 2) return 0;
  const diffs: number[] = [];
  for (let i = 1; i < arr.length; i++) {
    diffs.push(arr[i] - arr[i - 1]);
  }
  const media = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const varianza =
    diffs.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (diffs.length - 1);
  return Math.sqrt(Math.max(0, varianza));
}

const NOMBRES_ARQUITECTURAS: Record<IdArquitectura, string> = {
  unet: 'U-Net',
  'unet-cbam': 'U-Net + CBAM',
  modcbam: 'ModCBAM',
  transunet: 'TransUNet',
  'swin-unetr-kan-3d': 'Swin UNETR + KAN (Ref. 3D)',
};

const COLORES_ARQUITECTURAS: Record<IdArquitectura, string> = {
  unet: 'unet',
  'unet-cbam': 'cbam',
  modcbam: 'modcbam',
  transunet: 'transunet',
  'swin-unetr-kan-3d': 'ref-3d',
};

const CATEGORIAS_ARQUITECTURAS: Record<IdArquitectura, string> = {
  unet: 'CNN Clásica Encoder-Decoder',
  'unet-cbam': 'CNN con Atención Dual Secuencial',
  modcbam: 'Variante Experimental Optimizada',
  transunet: 'Híbrido CNN-Transformer',
  'swin-unetr-kan-3d': 'Referencia Externa Bibliográfica 3D',
};

/**
 * Retorna las series temporales canónicas de convergencia para la Etapa 1 (Segmentación).
 * Datos extraídos fielmente de los 4 historiales JSON originales sin imputación ni invención.
 */
export function obtenerSeriesConvergenciaE1(): SerieConvergenciaE1[] {
  const ids: ('unet' | 'unet-cbam' | 'modcbam' | 'transunet')[] = [
    'unet',
    'unet-cbam',
    'modcbam',
    'transunet',
  ];

  return ids.map((id) => {
    const raw = HISTORIALES_CANONICOS[id].E1;
    const trainLoss = raw.train_loss || [];
    const valLoss = raw.val_loss || [];
    const valDice = raw.val_dice || [];

    // Mejor val_dice
    let mejorValDice = -Infinity;
    let mejorEpocaDice = 1;
    valDice.forEach((v, idx) => {
      if (v > mejorValDice) {
        mejorValDice = v;
        mejorEpocaDice = idx + 1;
      }
    });

    const ultimoValDice = valDice[valDice.length - 1] ?? 0;
    const diferenciaDicePicoFinal = Math.max(0, mejorValDice - ultimoValDice);

    // Mínimo val_loss
    let valLossMinimo = Infinity;
    let epocaValLossMinimo = 1;
    valLoss.forEach((v, idx) => {
      if (v < valLossMinimo) {
        valLossMinimo = v;
        epocaValLossMinimo = idx + 1;
      }
    });

    const trainLossInicial = trainLoss[0] ?? 0;
    const trainLossFinal = trainLoss[trainLoss.length - 1] ?? 0;
    const valLossInicial = valLoss[0] ?? 0;
    const valLossFinal = valLoss[valLoss.length - 1] ?? 0;

    const mejorIdx = mejorEpocaDice - 1;
    const brechaPerdidaEnMejorDice =
      valLoss[mejorIdx] !== undefined && trainLoss[mejorIdx] !== undefined
        ? valLoss[mejorIdx] - trainLoss[mejorIdx]
        : 0;

    return {
      arquitecturaId: id,
      nombre: NOMBRES_ARQUITECTURAS[id],
      color: COLORES_ARQUITECTURAS[id],
      epocasEfectivas: valDice.length,
      epocasConfiguradas: 150,
      pacienciaEarlyStopping: 25,
      trainLoss,
      valLoss,
      valDice,
      mejorEpocaDice,
      mejorValDice,
      ultimoValDice,
      diferenciaDicePicoFinal,
      trainLossInicial,
      trainLossFinal,
      valLossInicial,
      valLossFinal,
      valLossMinimo,
      epocaValLossMinimo,
      brechaPerdidaFinal: valLossFinal - trainLossFinal,
      brechaPerdidaEnMejorDice,
      volatilidadValDice: calcularDesviacionPrimerasDiferencias(valDice),
    };
  });
}

/**
 * Retorna las series temporales canónicas de convergencia para la Etapa 2 (Clasificación).
 * 100 épocas registradas para todas las arquitecturas bajo condición de encoder congelado.
 */
export function obtenerSeriesConvergenciaE2(): SerieConvergenciaE2[] {
  const ids: ('unet' | 'unet-cbam' | 'modcbam' | 'transunet')[] = [
    'unet',
    'unet-cbam',
    'modcbam',
    'transunet',
  ];

  return ids.map((id) => {
    const raw = HISTORIALES_CANONICOS[id].E2;
    const trainLoss = raw.train_loss || [];
    const valLoss = raw.val_loss || [];
    const valMcc = raw.val_mcc || [];
    const valF1 = raw.val_f1 || [];

    // Mejor val_mcc
    let mejorValMcc = -Infinity;
    let mejorEpocaMcc = 1;
    valMcc.forEach((v, idx) => {
      if (v > mejorValMcc) {
        mejorValMcc = v;
        mejorEpocaMcc = idx + 1;
      }
    });

    // Mejor val_f1
    let mejorValF1 = -Infinity;
    let mejorEpocaF1 = 1;
    valF1.forEach((v, idx) => {
      if (v > mejorValF1) {
        mejorValF1 = v;
        mejorEpocaF1 = idx + 1;
      }
    });

    const ultimoValMcc = valMcc[valMcc.length - 1] ?? 0;
    const ultimoValF1 = valF1[valF1.length - 1] ?? 0;

    let valLossMinimo = Infinity;
    let epocaValLossMinimo = 1;
    valLoss.forEach((v, idx) => {
      if (v < valLossMinimo) {
        valLossMinimo = v;
        epocaValLossMinimo = idx + 1;
      }
    });

    const trainLossInicial = trainLoss[0] ?? 0;
    const trainLossFinal = trainLoss[trainLoss.length - 1] ?? 0;
    const valLossInicial = valLoss[0] ?? 0;
    const valLossFinal = valLoss[valLoss.length - 1] ?? 0;

    const mejorMccIdx = mejorEpocaMcc - 1;
    const brechaPerdidaEnMejorMcc =
      valLoss[mejorMccIdx] !== undefined && trainLoss[mejorMccIdx] !== undefined
        ? valLoss[mejorMccIdx] - trainLoss[mejorMccIdx]
        : 0;

    return {
      arquitecturaId: id,
      nombre: NOMBRES_ARQUITECTURAS[id],
      color: COLORES_ARQUITECTURAS[id],
      epocasEfectivas: valMcc.length,
      epocasConfiguradas: 100,
      encoderCongelado: true,
      trainLoss,
      valLoss,
      valMcc,
      valF1,
      mejorEpocaMcc,
      mejorValMcc,
      ultimoValMcc,
      diferenciaMccPicoFinal: Math.max(0, mejorValMcc - ultimoValMcc),
      mejorEpocaF1,
      mejorValF1,
      ultimoValF1,
      diferenciaF1PicoFinal: Math.max(0, mejorValF1 - ultimoValF1),
      trainLossInicial,
      trainLossFinal,
      valLossInicial,
      valLossFinal,
      valLossMinimo,
      epocaValLossMinimo,
      brechaPerdidaFinal: valLossFinal - trainLossFinal,
      brechaPerdidaEnMejorMcc,
      volatilidadValMcc: calcularDesviacionPrimerasDiferencias(valMcc),
      volatilidadValF1: calcularDesviacionPrimerasDiferencias(valF1),
    };
  });
}

/**
 * Indicadores cuantitativos descriptivos de estabilidad y dinámica (Apartado D3).
 * Todos los indicadores cuentan con justificación formal y fórmula documentada.
 */
export function obtenerIndicadoresEstabilidadConvergencia(): IndicadorEstabilidadConvergencia[] {
  const seriesE1 = obtenerSeriesConvergenciaE1();
  const seriesE2 = obtenerSeriesConvergenciaE2();

  const mapaE1 = Object.fromEntries(
    seriesE1.map((s) => [s.arquitecturaId, s])
  ) as Record<'unet' | 'unet-cbam' | 'modcbam' | 'transunet', SerieConvergenciaE1>;

  const mapaE2 = Object.fromEntries(
    seriesE2.map((s) => [s.arquitecturaId, s])
  ) as Record<'unet' | 'unet-cbam' | 'modcbam' | 'transunet', SerieConvergenciaE2>;

  return [
    {
      id: 'IND-VOL-01',
      nombre: 'Volatilidad Inter-Época (Desviación Estándar de Primeras Diferencias)',
      formula:
        'σ(Δy) = sqrt( (1 / (M - 1)) * sum_{t=2}^N (Δy_t - media_Δ)^2 ), con M = N - 1 diferencias consecutivas Δy_t = y_t - y_{t-1}',
      descripcionSignificado:
        'Cuantifica el ruido estocástico medio en las trayectorias de validación de una época a la siguiente. Menor valor indica una curva más suave y predecible.',
      unidad: 'Adimensional',
      valoresE1: {
        unet: Number(mapaE1.unet.volatilidadValDice.toFixed(4)),
        'unet-cbam': Number(mapaE1['unet-cbam'].volatilidadValDice.toFixed(4)),
        modcbam: Number(mapaE1.modcbam.volatilidadValDice.toFixed(4)),
        transunet: Number(mapaE1.transunet.volatilidadValDice.toFixed(4)),
      },
      valoresE2: {
        unet: Number(mapaE2.unet.volatilidadValMcc.toFixed(4)),
        'unet-cbam': Number(mapaE2['unet-cbam'].volatilidadValMcc.toFixed(4)),
        modcbam: Number(mapaE2.modcbam.volatilidadValMcc.toFixed(4)),
        transunet: Number(mapaE2.transunet.volatilidadValMcc.toFixed(4)),
      },
      interpretacionCientifica:
        'En E1 todas las arquitecturas muestran volatilidad contenida (0.057 - 0.081 en Dice). En E2, TransUNet presenta volatilidad sustancialmente mayor (0.1922 en MCC frente a ~0.021-0.037 en CNNs), evidenciando inestabilidad temprana en la adaptación del clasificador lineal sobre representaciones ViT congeladas.',
    },
    {
      id: 'IND-DEG-02',
      nombre: 'Degradación Post-Pico (Caída Máxima hasta la Parada)',
      formula: 'Δ_pico = y_mejor - y_ultimo',
      descripcionSignificado:
        'Pérdida neta de rendimiento en el conjunto de validación entre el pico óptimo alcanzado y la última época registrada antes de detenerse.',
      unidad: 'Puntos métricos',
      valoresE1: {
        unet: Number(mapaE1.unet.diferenciaDicePicoFinal.toFixed(4)),
        'unet-cbam': Number(mapaE1['unet-cbam'].diferenciaDicePicoFinal.toFixed(4)),
        modcbam: Number(mapaE1.modcbam.diferenciaDicePicoFinal.toFixed(4)),
        transunet: Number(mapaE1.transunet.diferenciaDicePicoFinal.toFixed(4)),
      },
      valoresE2: {
        unet: Number(mapaE2.unet.diferenciaMccPicoFinal.toFixed(4)),
        'unet-cbam': Number(mapaE2['unet-cbam'].diferenciaMccPicoFinal.toFixed(4)),
        modcbam: Number(mapaE2.modcbam.diferenciaMccPicoFinal.toFixed(4)),
        transunet: Number(mapaE2.transunet.diferenciaMccPicoFinal.toFixed(4)),
      },
      interpretacionCientifica:
        'En E1, CBAM experimentó la mayor degradación post-pico (0.0453 en Dice) tras su pico a la época 23, activando la parada a la época 48. En contraste, TransUNet (0.0056) y ModCBAM (0.0077) mantuvieron mesetas sumamente estables.',
    },
    {
      id: 'IND-GAP-03',
      nombre: 'Brecha de Pérdida Final (Generalization Loss Gap)',
      formula: 'Gap_loss = val_loss_final - train_loss_final',
      descripcionSignificado:
        'Discrepancia absoluta entre el coste sobre datos de validación no vistos y el coste sobre datos de entrenamiento al concluir el aprendizaje.',
      unidad: 'Puntos de pérdida',
      valoresE1: {
        unet: Number(mapaE1.unet.brechaPerdidaFinal.toFixed(4)),
        'unet-cbam': Number(mapaE1['unet-cbam'].brechaPerdidaFinal.toFixed(4)),
        modcbam: Number(mapaE1.modcbam.brechaPerdidaFinal.toFixed(4)),
        transunet: Number(mapaE1.transunet.brechaPerdidaFinal.toFixed(4)),
      },
      valoresE2: {
        unet: Number(mapaE2.unet.brechaPerdidaFinal.toFixed(4)),
        'unet-cbam': Number(mapaE2['unet-cbam'].brechaPerdidaFinal.toFixed(4)),
        modcbam: Number(mapaE2.modcbam.brechaPerdidaFinal.toFixed(4)),
        transunet: Number(mapaE2.transunet.brechaPerdidaFinal.toFixed(4)),
      },
      interpretacionCientifica:
        'En E1, las redes con convergencia profunda (TransUNet: 0.1531; ModCBAM: 0.1351; U-Net: 0.1301) muestran brechas moderadas coherentes con la minimización de la pérdida de entrenamiento (train_loss < 0.05). En E2, las brechas se mantienen estrechas (0.10 - 0.18), excepto en TransUNet donde ambas pérdidas permanecen altas (~0.58).',
    },
    {
      id: 'IND-DES-04',
      nombre: 'Desfase Temporal entre Mínimo de Pérdida y Máximo de Métrica',
      formula: 'Δt_optimo = |epoca(metrica_max) - epoca(val_loss_min)|',
      descripcionSignificado:
        'Número de épocas transcurridas entre la minimización del gradiente de coste y la optimización de la métrica clínica de validación.',
      unidad: 'Épocas',
      valoresE1: {
        unet: Math.abs(mapaE1.unet.mejorEpocaDice - mapaE1.unet.epocaValLossMinimo),
        'unet-cbam': Math.abs(mapaE1['unet-cbam'].mejorEpocaDice - mapaE1['unet-cbam'].epocaValLossMinimo),
        modcbam: Math.abs(mapaE1.modcbam.mejorEpocaDice - mapaE1.modcbam.epocaValLossMinimo),
        transunet: Math.abs(mapaE1.transunet.mejorEpocaDice - mapaE1.transunet.epocaValLossMinimo),
      },
      valoresE2: {
        unet: Math.abs(mapaE2.unet.mejorEpocaMcc - mapaE2.unet.epocaValLossMinimo),
        'unet-cbam': Math.abs(mapaE2['unet-cbam'].mejorEpocaMcc - mapaE2['unet-cbam'].epocaValLossMinimo),
        modcbam: Math.abs(mapaE2.modcbam.mejorEpocaMcc - mapaE2.modcbam.epocaValLossMinimo),
        transunet: Math.abs(mapaE2.transunet.mejorEpocaMcc - mapaE2.transunet.epocaValLossMinimo),
      },
      interpretacionCientifica:
        'En E1, U-Net (desfase 0) y ModCBAM (desfase 1) mostraron sincronía cuasi-perfecta entre la convergencia de la pérdida combinada (BCE+Dice) y el Dice de validación. En TransUNet, el mínimo de pérdida ocurrió en la época 48 mientras que el mejor Dice se alcanzó en la 81 (desfase de 33 épocas), indicando refinamiento morfológico continuado.',
    },
  ];
}

/**
 * Análisis metodológico riguroso de las brechas de generalización (Apartado D4).
 * Distingue explícitamente entre brechas observadas e hipótesis de sobreajuste.
 */
export function obtenerAnalisisBrechasGeneralizacion(): AnalisisBrechaGeneralizacion[] {
  const seriesE1 = obtenerSeriesConvergenciaE1();
  const seriesE2 = obtenerSeriesConvergenciaE2();

  const resultados: AnalisisBrechaGeneralizacion[] = [];

  // Análisis E1
  seriesE1.forEach((s) => {
    let nivel: 'moderada' | 'reducida' | 'minima' = 'moderada';
    let hallazgo = '';
    let alerta = '';

    if (s.arquitecturaId === 'transunet') {
      nivel = 'moderada';
      hallazgo =
        'Alcanzó la menor pérdida de entrenamiento en E1 (0.0297 a la época 106), generando una brecha de pérdida con validación de 0.1531.';
      alerta =
        'Aunque la brecha de pérdida es la más amplia, el Dice de validación continuó mejorando hasta la época 81 (0.8969) y cerró en 0.8913. No existe evidencia empírica suficiente para concluir sobreajuste perjudicial en segmentación, sino alta capacidad de parametrización.';
    } else if (s.arquitecturaId === 'modcbam') {
      nivel = 'moderada';
      hallazgo =
        'Pérdida de entrenamiento reducida (0.0476 a la época 75) con pérdida de validación estabilizada en 0.1827 (brecha de 0.1351).';
      alerta =
        'Comportamiento regular y simétrico a U-Net clásica. La convergencia progresiva sugiere generalización controlada sin divergencia entre curvas.';
    } else if (s.arquitecturaId === 'unet-cbam') {
      nivel = 'minima';
      hallazgo =
        'Brecha de pérdida de -0.0183 al finalizar la época 48 por parada temprana (val_loss=0.5207, train_loss=0.5390).';
      alerta =
        'ADV-02: La interrupción temprana impidió a la red entrar en la zona asintótica de bajo error. La aparente ausencia de brecha refleja un entrenamiento incompleto, no una superioridad de generalización.';
    } else {
      nivel = 'moderada';
      hallazgo =
        'Pérdida de entrenamiento de 0.0465 y validación de 0.1766 a la época 80 (brecha de 0.1301).';
      alerta =
        'Convergencia clásica de libro de texto en U-Net con estabilización gradual de pérdidas y métrica.';
    }

    resultados.push({
      arquitecturaId: s.arquitecturaId,
      nombre: s.nombre,
      color: s.color,
      etapa: 'E1',
      brechaPerdida: s.brechaPerdidaFinal,
      nivelBrecha: nivel,
      hallazgoEmpirico: hallazgo,
      alertaRigor: alerta,
    });
  });

  // Análisis E2
  seriesE2.forEach((s) => {
    let nivel: 'moderada' | 'reducida' | 'minima' = 'moderada';
    let hallazgo = '';
    let alerta = '';

    if (s.arquitecturaId === 'transunet') {
      nivel = 'minima';
      hallazgo =
        'Pérdida de validación de 0.5853 frente a entrenamiento de 0.5942 (brecha de -0.0089). Ambas pérdidas se mantuvieron en niveles elevados.';
      alerta =
        'El clasificador lineal de E2 no logró transferir eficientemente las características del encoder Transformer congelado. La reducida brecha train-val no indica generalización óptima, sino subajuste relativo en la clasificación binaria (underfitting de la cabeza de predicción).';
    } else {
      nivel = 'moderada';
      hallazgo = `Brecha de pérdida final de ${s.brechaPerdidaFinal.toFixed(4)} con convergencia suave de la cabeza de clasificación.`;
      alerta =
        'El congelamiento del encoder permitió estabilizar el clasificador denso con 100 épocas completas, evitando sobreajuste catastrófico sobre los 213 nódulos de prueba.';
    }

    resultados.push({
      arquitecturaId: s.arquitecturaId,
      nombre: s.nombre,
      color: s.color,
      etapa: 'E2',
      brechaPerdida: s.brechaPerdidaFinal,
      nivelBrecha: nivel,
      hallazgoEmpirico: hallazgo,
      alertaRigor: alerta,
    });
  });

  return resultados;
}

/**
 * Retorna la síntesis individualizada de convergencia por arquitectura (Apartado D5).
 * Separa de forma estricta los hechos empíricos de las interpretaciones teóricas.
 */
export function obtenerSintesisConvergenciaPorArquitectura(): SintesisConvergenciaArquitectura[] {
  const seriesE1 = obtenerSeriesConvergenciaE1();
  const seriesE2 = obtenerSeriesConvergenciaE2();

  const mapaE1 = Object.fromEntries(
    seriesE1.map((s) => [s.arquitecturaId, s])
  ) as Record<'unet' | 'unet-cbam' | 'modcbam' | 'transunet', SerieConvergenciaE1>;

  const mapaE2 = Object.fromEntries(
    seriesE2.map((s) => [s.arquitecturaId, s])
  ) as Record<'unet' | 'unet-cbam' | 'modcbam' | 'transunet', SerieConvergenciaE2>;

  return [
    {
      arquitecturaId: 'unet',
      nombre: 'U-Net',
      categoria: CATEGORIAS_ARQUITECTURAS.unet,
      color: 'unet',
      convergenciaE1: {
        epocas: mapaE1.unet.epocasEfectivas,
        mejorEpocaDice: mapaE1.unet.mejorEpocaDice,
        mejorDice: mapaE1.unet.mejorValDice,
        ultimoDice: mapaE1.unet.ultimoValDice,
        degradacionPico: mapaE1.unet.diferenciaDicePicoFinal,
        dinamicaEarlyStopping:
          'Se detuvo a las 80 épocas al cumplirse la ventana de paciencia de 25 épocas sin superar el Dice de 0.8950 registrado en la época 55.',
        perdidas:
          'Descenso monótono de train_loss (1.5074 -> 0.0465). Mínimo de val_loss (0.1606) sincronizado con el pico de Dice en época 55.',
      },
      convergenciaE2: {
        epocas: mapaE2.unet.epocasEfectivas,
        mejorEpocaMcc: mapaE2.unet.mejorEpocaMcc,
        mejorMcc: mapaE2.unet.mejorValMcc,
        ultimoMcc: mapaE2.unet.ultimoValMcc,
        mejorEpocaF1: mapaE2.unet.mejorEpocaF1,
        mejorF1: mapaE2.unet.mejorValF1,
        ultimoF1: mapaE2.unet.ultimoValF1,
        dinamicaEncoderCongelado:
          'Completó las 100 épocas con encoder congelado. Máximos de MCC y F1 concurrentes en la época 72, con retención del 98.2% del rendimiento al cierre.',
        perdidas: 'train_loss descendió a 0.1760; val_loss se estabilizó en 0.3600.',
      },
      estabilidadObservada: {
        volatilidadDice: mapaE1.unet.volatilidadValDice,
        volatilidadMcc: mapaE2.unet.volatilidadValMcc,
        volatilidadF1: mapaE2.unet.volatilidadValF1,
        descripcionEstabilidad:
          'Excelente estabilidad de gradiente y trayectorias continuas tanto en segmentación como en clasificación.',
      },
      brechasGeneralizacion: {
        brechaE1: mapaE1.unet.brechaPerdidaFinal,
        brechaE2: mapaE2.unet.brechaPerdidaFinal,
        interpretacionBrecha:
          'Brechas normales y controladas acordes a una arquitectura CNN sin sobreparametrización.',
      },
      limitacionesMetodologicas: [
        'Las curvas corresponden al conjunto de validación interna, no deben confundirse con la prueba ciega de test.',
        'La variabilidad inter-época refleja la dinámica del optimizador AdamW y el tamaño de minilote, no la variabilidad biológica entre pacientes.',
      ],
    },
    {
      arquitecturaId: 'unet-cbam',
      nombre: 'U-Net + CBAM',
      categoria: CATEGORIAS_ARQUITECTURAS['unet-cbam'],
      color: 'cbam',
      convergenciaE1: {
        epocas: mapaE1['unet-cbam'].epocasEfectivas,
        mejorEpocaDice: mapaE1['unet-cbam'].mejorEpocaDice,
        mejorDice: mapaE1['unet-cbam'].mejorValDice,
        ultimoDice: mapaE1['unet-cbam'].ultimoValDice,
        degradacionPico: mapaE1['unet-cbam'].diferenciaDicePicoFinal,
        dinamicaEarlyStopping:
          'Parada temprana más precoz del estudio: alcanzó su pico a las 23 épocas y detuvo el entrenamiento a las 48 épocas tras 25 épocas consecutivas sin mejora.',
        perdidas:
          'Convergencia interrumpida con train_loss en 0.5390 y val_loss en 0.5207, sin descender al régimen asintótico inferior.',
      },
      convergenciaE2: {
        epocas: mapaE2['unet-cbam'].epocasEfectivas,
        mejorEpocaMcc: mapaE2['unet-cbam'].mejorEpocaMcc,
        mejorMcc: mapaE2['unet-cbam'].mejorValMcc,
        ultimoMcc: mapaE2['unet-cbam'].ultimoValMcc,
        mejorEpocaF1: mapaE2['unet-cbam'].mejorEpocaF1,
        mejorF1: mapaE2['unet-cbam'].mejorValF1,
        ultimoF1: mapaE2['unet-cbam'].ultimoValF1,
        dinamicaEncoderCongelado:
          'Completó 100 épocas. Máximos de MCC y F1 coincidentes en época 75, superando transitoriamente a la base antes de un descenso de 0.038 en MCC.',
        perdidas: 'train_loss final de 0.2078; val_loss final de 0.3173.',
      },
      estabilidadObservada: {
        volatilidadDice: mapaE1['unet-cbam'].volatilidadValDice,
        volatilidadMcc: mapaE2['unet-cbam'].volatilidadValMcc,
        volatilidadF1: mapaE2['unet-cbam'].volatilidadValF1,
        descripcionEstabilidad:
          'Mayor volatilidad en E1 (0.0806) asociada a la introducción de módulos de atención espacial y de canal con parada prematura.',
      },
      brechasGeneralizacion: {
        brechaE1: mapaE1['unet-cbam'].brechaPerdidaFinal,
        brechaE2: mapaE2['unet-cbam'].brechaPerdidaFinal,
        interpretacionBrecha:
          'La aparente ausencia de brecha en E1 (-0.0183) es consecuencia de la interrupción prematura del entrenamiento (subajuste relativo), no de una generalización perfecta.',
      },
      limitacionesMetodologicas: [
        'ADV-02: La correlación entre parada a 48 épocas y baja sensibilidad en test no tiene causalidad demostrada.',
        'No asumir que la red alcanzó su potencial máximo de segmentación con solo 48 épocas de entrenamiento.',
      ],
    },
    {
      arquitecturaId: 'modcbam',
      nombre: 'ModCBAM',
      categoria: CATEGORIAS_ARQUITECTURAS.modcbam,
      color: 'modcbam',
      convergenciaE1: {
        epocas: mapaE1.modcbam.epocasEfectivas,
        mejorEpocaDice: mapaE1.modcbam.mejorEpocaDice,
        mejorDice: mapaE1.modcbam.mejorValDice,
        ultimoDice: mapaE1.modcbam.ultimoValDice,
        degradacionPico: mapaE1.modcbam.diferenciaDicePicoFinal,
        dinamicaEarlyStopping:
          'Alcanzó su mejor Dice en la época 50 (0.8935) y finalizó a la época 75 tras la ventana de paciencia de 25 épocas.',
        perdidas:
          'Excelente convergencia de pérdidas: train_loss finalizó en 0.0476 y val_loss en 0.1827. Mínimo de val_loss a la época 51 (0.1638), sincronizado con el pico de Dice.',
      },
      convergenciaE2: {
        epocas: mapaE2.modcbam.epocasEfectivas,
        mejorEpocaMcc: mapaE2.modcbam.mejorEpocaMcc,
        mejorMcc: mapaE2.modcbam.mejorValMcc,
        ultimoMcc: mapaE2.modcbam.ultimoValMcc,
        mejorEpocaF1: mapaE2.modcbam.mejorEpocaF1,
        mejorF1: mapaE2.modcbam.mejorValF1,
        ultimoF1: mapaE2.modcbam.ultimoValF1,
        dinamicaEncoderCongelado:
          'Líder en pico de validación en E2: alcanzó el mayor MCC (0.7388) y F1 (0.8691) a la época 54, mostrando posteriormente oscilaciones moderadas.',
        perdidas: 'train_loss final de 0.1759; val_loss final de 0.3451.',
      },
      estabilidadObservada: {
        volatilidadDice: mapaE1.modcbam.volatilidadValDice,
        volatilidadMcc: mapaE2.modcbam.volatilidadValMcc,
        volatilidadF1: mapaE2.modcbam.volatilidadValF1,
        descripcionEstabilidad:
          'Estabilidad sólida en E1 semejante a U-Net clásica, con mayor dinamismo adaptativo en E2 debido a la atención modificada.',
      },
      brechasGeneralizacion: {
        brechaE1: mapaE1.modcbam.brechaPerdidaFinal,
        brechaE2: mapaE2.modcbam.brechaPerdidaFinal,
        interpretacionBrecha:
          'Brecha de pérdida equilibrada que no presenta indicios de sobreajuste catastrófico.',
      },
      limitacionesMetodologicas: [
        'La degradación de 0.0592 en MCC entre el pico (época 54) y el cierre (época 100) en E2 sugiere que una parada temprana en E2 habría preservado mejor la discriminabilidad.',
      ],
    },
    {
      arquitecturaId: 'transunet',
      nombre: 'TransUNet',
      categoria: CATEGORIAS_ARQUITECTURAS.transunet,
      color: 'transunet',
      convergenciaE1: {
        epocas: mapaE1.transunet.epocasEfectivas,
        mejorEpocaDice: mapaE1.transunet.mejorEpocaDice,
        mejorDice: mapaE1.transunet.mejorValDice,
        ultimoDice: mapaE1.transunet.ultimoValDice,
        degradacionPico: mapaE1.transunet.diferenciaDicePicoFinal,
        dinamicaEarlyStopping:
          'Entrenamiento más prolongado de E1: 106 épocas registradas. Pico de Dice en época 81 (0.8969) y parada a la 106 por ventana de 25 épocas.',
        perdidas:
          'Máxima capacidad de ajuste: menor train_loss del estudio (0.0297). Mínimo de val_loss a la época 48 (0.1657), continuando la mejora en Dice 33 épocas después.',
      },
      convergenciaE2: {
        epocas: mapaE2.transunet.epocasEfectivas,
        mejorEpocaMcc: mapaE2.transunet.mejorEpocaMcc,
        mejorMcc: mapaE2.transunet.mejorValMcc,
        ultimoMcc: mapaE2.transunet.ultimoValMcc,
        mejorEpocaF1: mapaE2.transunet.mejorEpocaF1,
        mejorF1: mapaE2.transunet.mejorValF1,
        ultimoF1: mapaE2.transunet.ultimoValF1,
        dinamicaEncoderCongelado:
          'Trayectoria con marcada inestabilidad: MCC osciló en 0.0 durante las primeras 20 épocas, subió erráticamente entre épocas 40-70 y se estabilizó tardíamente en ~0.61.',
        perdidas:
          'train_loss y val_loss permanecieron estancadas en ~0.59, reflejando dificultades de convergencia del clasificador lineal sobre el encoder ViT congelado.',
      },
      estabilidadObservada: {
        volatilidadDice: mapaE1.transunet.volatilidadValDice,
        volatilidadMcc: mapaE2.transunet.volatilidadValMcc,
        volatilidadF1: mapaE2.transunet.volatilidadValF1,
        descripcionEstabilidad:
          'En E1 mostró la menor volatilidad de Dice del benchmark (0.0570). En E2 exhibió la mayor inestabilidad (volatilidad de MCC de 0.1922, casi un orden de magnitud superior a las CNNs).',
      },
      brechasGeneralizacion: {
        brechaE1: mapaE1.transunet.brechaPerdidaFinal,
        brechaE2: mapaE2.transunet.brechaPerdidaFinal,
        interpretacionBrecha:
          'En E1 presenta la mayor brecha de pérdida (0.1531) por su gran capacidad de ajuste, pero retuvo un Dice de validación de 0.8913. En E2, la nula brecha responde a subajuste de la cabeza lineal, no a sobreajuste.',
      },
      limitacionesMetodologicas: [
        'ADV-07: La brecha de generalización en parches 2D concurre con la ausencia de sesgo inductivo y preentrenamiento masivo.',
        'No atribuir sobreajuste definitivo sin considerar que el Dice de validación continuó aumentando hasta la época 81.',
      ],
    },
  ];
}


