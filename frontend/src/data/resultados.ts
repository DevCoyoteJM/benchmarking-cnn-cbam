export interface MetricasModelo {
  // Métricas de clasificación (Etapa E2: Malignidad)
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rocAuc?: number;
  mcc?: number;

  // Métricas de segmentación (Etapa E1: Detección y contorno)
  dice?: number;
  iou?: number;
}

export type EstadoExperimento =
  | "pendiente"
  | "parcial"
  | "finalizado";

export type TareaExperimento =
  | "clasificacion"
  | "segmentacion"
  | "sin-especificar";

export type EstadoVerificacionConfiguracion =
  | "pendiente"
  | "verificado_notebook"
  | "verificado_otra_evidencia";

export interface ConfiguracionEntrenamiento {
  // Identificación y procedencia del dataset
  dataset?: string;
  versionDataset?: string;
  numeroMuestras?: number;
  preprocesamiento?: string;

  // Entorno de ejecución y framework
  framework?: string;
  versionFramework?: string;

  // Parámetros de épocas (planificadas vs retrocompatibilidad)
  epocas?: number;
  epocasPlanificadas?: number;

  // Hiperparámetros de optimización
  batchSize?: number;
  learningRate?: number;
  optimizador?: string;
  funcionPerdida?: string;
  divisionDatos?: string;
  hardware?: string;

  // Parámetros de reproducibilidad y regularización
  semillaAleatoria?: number;
  aumentoDatos?: string;
  regularizacion?: string;

  // Evidencias y observaciones metodológicas
  archivoNotebook?: string;
  archivoPDF?: string;
  observaciones?: string;
  estadoVerificacion?: EstadoVerificacionConfiguracion;
}

export interface ResultadoModelo {
  id: string;
  modeloId: string;
  version: string;
  fecha: string | null;
  estado: EstadoExperimento;
  tarea: TareaExperimento;
  descripcion: string;
  metricas: MetricasModelo;
  configuracion?: ConfiguracionEntrenamiento;
}

export const historialResultados: ResultadoModelo[] = [
  {
    id: "unet-v1",
    modeloId: "unet",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    tarea: "sin-especificar",
    descripcion:
      "Evaluación base de U-Net (Etapa E1: Segmentación / Etapa E2: Clasificación).",
    metricas: {},
  },
  {
    id: "unet-cbam-v1",
    modeloId: "unet-cbam",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    tarea: "sin-especificar",
    descripcion:
      "Evaluación de U-Net con mecanismo de atención CBAM en canales y espacio.",
    metricas: {},
  },
  {
    id: "modcbam-v1",
    modeloId: "modcbam",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    tarea: "sin-especificar",
    descripcion: "Evaluación experimental de variante ModCBAM.",
    metricas: {},
  },
  {
    id: "transunet-v1",
    modeloId: "transunet",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    tarea: "sin-especificar",
    descripcion:
      "Evaluación experimental de arquitectura híbrida TransUNet.",
    metricas: {},
  },
];

// Convierte resultados antiguos que no tengan tarea registrada.
// Esto permite mantener compatibilidad con datos guardados anteriormente.
export function normalizarResultadoModelo(
  resultado: Partial<ResultadoModelo> & {
    id: string;
    modeloId: string;
    version: string;
  }
): ResultadoModelo {
  return {
    id: resultado.id,
    modeloId: resultado.modeloId,
    version: resultado.version,
    fecha: resultado.fecha ?? null,
    estado: resultado.estado ?? "pendiente",
    tarea: resultado.tarea ?? "sin-especificar",
    descripcion: resultado.descripcion ?? "",
    metricas: resultado.metricas ?? {},
    configuracion: resultado.configuracion,
  };
}

/**
 * Combina dos configuraciones experimentales preservando los campos existentes
 * cuando la nueva configuración no los define o es parcial.
 * Los campos ausentes permanecen como undefined (sin agregar ceros ni cadenas vacías).
 */
export function fusionarConfiguracion(
  existente?: ConfiguracionEntrenamiento,
  nueva?: ConfiguracionEntrenamiento
): ConfiguracionEntrenamiento | undefined {
  if (!existente && !nueva) return undefined;
  if (!existente) return nueva ? { ...nueva } : undefined;
  if (!nueva) return existente ? { ...existente } : undefined;

  const resultado: ConfiguracionEntrenamiento = { ...existente };

  for (const [clave, valor] of Object.entries(nueva)) {
    if (valor !== undefined) {
      (resultado as Record<string, unknown>)[clave] = valor;
    }
  }

  // Sincronización y retrocompatibilidad con epocas / epocasPlanificadas
  if (
    nueva.epocasPlanificadas !== undefined ||
    nueva.epocas !== undefined ||
    existente.epocasPlanificadas !== undefined ||
    existente.epocas !== undefined
  ) {
    resultado.epocas =
      nueva.epocasPlanificadas ??
      nueva.epocas ??
      existente.epocasPlanificadas ??
      existente.epocas;
  }

  return resultado;
}

/**
 * Fusiona un experimento entrante con uno existente identificado por el mismo ID.
 * Implementa la política de upsert seguro de PulmoVision AI:
 * - Si el experimento importado tiene configuración parcial o ausente, NO elimina
 *   la información guardada previamente.
 * - Preserva campos estructurales, identificadores, referencias documentales y métricas.
 */
export function fusionarExperimento(
  existente: ResultadoModelo,
  nuevo: ResultadoModelo
): ResultadoModelo {
  return {
    ...existente,
    ...nuevo,
    tarea:
      nuevo.tarea && nuevo.tarea !== "sin-especificar"
        ? nuevo.tarea
        : existente.tarea,
    descripcion: nuevo.descripcion?.trim()
      ? nuevo.descripcion
      : existente.descripcion,
    fecha: nuevo.fecha ?? existente.fecha,
    metricas: {
      ...existente.metricas,
      ...nuevo.metricas,
    },
    configuracion: fusionarConfiguracion(
      existente.configuracion,
      nuevo.configuracion
    ),
  };
}

// Selecciona la versión más reciente registrada de cada modelo.
// Por ahora, el orden de registro determina cuál es la más reciente.
export const resultados = historialResultados.filter(
  (resultado, indice, lista) =>
    !lista.some(
      (otro, otroIndice) =>
        otro.modeloId === resultado.modeloId &&
        otroIndice > indice
    )
);

/**
 * Lista canónica de los 12 campos comunes que pueden ser replicados
 * documentalmente entre experimentos en PulmoVision AI.
 */
export const CAMPOS_REPLICABLES_PERMITIDOS = [
  "dataset",
  "versionDataset",
  "numeroMuestras",
  "divisionDatos",
  "preprocesamiento",
  "framework",
  "versionFramework",
  "hardware",
  "semillaAleatoria",
  "aumentoDatos",
  "regularizacion",
  "observaciones",
] as const;

export type CampoReplicable = (typeof CAMPOS_REPLICABLES_PERMITIDOS)[number];

/**
 * Lista estricta de campos que NO deben replicarse automáticamente
 * (hiperparámetros específicos, duración de épocas, estados de verificación y evidencias).
 */
export const CAMPOS_EXCLUIDOS_DE_REPLICACION = [
  "epocas",
  "epocasPlanificadas",
  "batchSize",
  "learningRate",
  "optimizador",
  "funcionPerdida",
  "archivoNotebook",
  "archivoPDF",
  "estadoVerificacion",
] as const;

export interface OpcionesReplicacion {
  camposSeleccionados: CampoReplicable[];
  permitirSobrescritura: boolean;
}

export interface ResultadoReplicacionDestino {
  experimentoActualizado: ResultadoModelo;
  camposAgregados: CampoReplicable[];
  camposSobrescritos: CampoReplicable[];
  camposOmitidosPorExistir: CampoReplicable[];
}

export interface ResultadoReplicacionLote {
  exito: boolean;
  error?: string;
  destinosActualizados: ResultadoReplicacionDestino[];
  experimentosCompletos: ResultadoModelo[];
}

/**
 * Función pura que replica de forma guiada e inmutable los campos de configuración
 * seleccionados desde un experimento origen hacia uno o varios destinos.
 *
 * Reglas de seguridad:
 * 1. Campos undefined, null o vacíos en el origen nunca se copian ni sobrescriben nada.
 * 2. Campos prohibidos (hiperparámetros específicos, épocas, evidencias) se excluyen absolutamente.
 * 3. La sobrescritura requiere autorización explícita (permitirSobrescritura).
 * 4. Valida todos los destinos en lote (todo o nada) antes de emitir el resultado.
 * 5. Mantiene independientes métricas, historiales, identificadores y descripciones.
 */
export function replicarConfiguracionExperimentos({
  origen,
  destinos,
  todosLosExperimentos,
  opciones,
}: {
  origen: ResultadoModelo;
  destinos: ResultadoModelo[];
  todosLosExperimentos: ResultadoModelo[];
  opciones: OpcionesReplicacion;
}): ResultadoReplicacionLote {
  // Validación 1: Origen debe existir y tener configuración
  if (!origen || !origen.configuracion) {
    return {
      exito: false,
      error: "El experimento de origen no contiene configuración registrada para copiar.",
      destinosActualizados: [],
      experimentosCompletos: todosLosExperimentos,
    };
  }

  // Validación 2: Debe haber al menos un destino
  if (!destinos || destinos.length === 0) {
    return {
      exito: false,
      error: "Debe seleccionar al menos un experimento de destino.",
      destinosActualizados: [],
      experimentosCompletos: todosLosExperimentos,
    };
  }

  // Validación 3: Filtrar campos válidos permitidos
  const camposValidos = opciones.camposSeleccionados.filter((campo) =>
    CAMPOS_REPLICABLES_PERMITIDOS.includes(campo)
  );

  if (camposValidos.length === 0) {
    return {
      exito: false,
      error: "Debe seleccionar al menos un campo común válido para copiar.",
      destinosActualizados: [],
      experimentosCompletos: todosLosExperimentos,
    };
  }

  // Validación 4: Extraer únicamente campos que en el origen sean definidos y no vacíos
  const valoresOrigen: Partial<Record<CampoReplicable, unknown>> = {};
  for (const campo of camposValidos) {
    const val = (origen.configuracion as Record<string, unknown>)[campo];
    if (val !== undefined && val !== null && val !== "") {
      valoresOrigen[campo] = val;
    }
  }

  const camposConValor = Object.keys(valoresOrigen) as CampoReplicable[];
  if (camposConValor.length === 0) {
    return {
      exito: false,
      error:
        "El experimento de origen no contiene valores registrados en los campos seleccionados.",
      destinosActualizados: [],
      experimentosCompletos: todosLosExperimentos,
    };
  }

  // Validación 5: Procesar y actualizar destinos en lote
  const destinosActualizados: ResultadoReplicacionDestino[] = [];
  const experimentosActualizadosMap = new Map<string, ResultadoModelo>();

  for (const destino of destinos) {
    // El origen no puede ser destino de sí mismo
    if (destino.id === origen.id) {
      continue;
    }

    const configDestinoActual = destino.configuracion ?? {};
    const nuevaConfigDestino: ConfiguracionEntrenamiento = {
      ...configDestinoActual,
    };

    const camposAgregados: CampoReplicable[] = [];
    const camposSobrescritos: CampoReplicable[] = [];
    const camposOmitidosPorExistir: CampoReplicable[] = [];

    for (const campo of camposConValor) {
      const valorOrigen = valoresOrigen[campo];
      const valorDestinoActual = (
        configDestinoActual as Record<string, unknown>
      )[campo];

      const destinoTieneValor =
        valorDestinoActual !== undefined &&
        valorDestinoActual !== null &&
        valorDestinoActual !== "";

      if (destinoTieneValor) {
        if (opciones.permitirSobrescritura) {
          (nuevaConfigDestino as Record<string, unknown>)[campo] = valorOrigen;
          camposSobrescritos.push(campo);
        } else {
          camposOmitidosPorExistir.push(campo);
        }
      } else {
        (nuevaConfigDestino as Record<string, unknown>)[campo] = valorOrigen;
        camposAgregados.push(campo);
      }
    }

    // Preservar estrictamente los 9 campos no replicables del destino
    nuevaConfigDestino.epocas = configDestinoActual.epocas;
    nuevaConfigDestino.epocasPlanificadas =
      configDestinoActual.epocasPlanificadas;
    nuevaConfigDestino.batchSize = configDestinoActual.batchSize;
    nuevaConfigDestino.learningRate = configDestinoActual.learningRate;
    nuevaConfigDestino.optimizador = configDestinoActual.optimizador;
    nuevaConfigDestino.funcionPerdida = configDestinoActual.funcionPerdida;
    nuevaConfigDestino.archivoNotebook = configDestinoActual.archivoNotebook;
    nuevaConfigDestino.archivoPDF = configDestinoActual.archivoPDF;
    nuevaConfigDestino.estadoVerificacion =
      configDestinoActual.estadoVerificacion;

    const expDestinoActualizado: ResultadoModelo = {
      ...destino,
      configuracion: nuevaConfigDestino,
    };

    destinosActualizados.push({
      experimentoActualizado: expDestinoActualizado,
      camposAgregados,
      camposSobrescritos,
      camposOmitidosPorExistir,
    });

    experimentosActualizadosMap.set(
      expDestinoActualizado.id,
      expDestinoActualizado
    );
  }

  // Generar la nueva lista completa de experimentos
  const experimentosCompletos = todosLosExperimentos.map(
    (exp) => experimentosActualizadosMap.get(exp.id) ?? exp
  );

  return {
    exito: true,
    destinosActualizados,
    experimentosCompletos,
  };
}
