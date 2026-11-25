/**
 * Servicio para la carga, validación, normalización y filtrado de evidencias visuales.
 * PulmoVision AI - Arquitectura modular para benchmarking CNN.
 */

import {
  CATEGORIAS_EVIDENCIA_VALIDAS,
  ETAPAS_EVIDENCIA_VALIDAS,
  type CategoriaEvidencia,
  type ColumnaEsquema,
  type EtapaEvidencia,
  type EtiquetaConceptualEvidencia,
  type GuiaVisualModelo,
  type IndiceRecursosVisualesJSON,
  type MetadatosEntrenamiento,
  type RecursoVisualEvidencia,
  type RecursoVisualJSON,
} from '../types/evidencias';

/**
 * Metadatos estructurados de entrenamiento auditados para EV-01 (Etapa 1: Segmentación y Detección).
 * Reflejan exactamente el algoritmo de Early Stopping con paciencia de 25 épocas según Dice de validación.
 */
export const METADATOS_ENTRENAMIENTO_E1: MetadatosEntrenamiento = {
  etapa: 'E1',
  epocasMaximasConfiguradas: 150,
  criterioParadaGeneral:
    'Parada temprana (Early Stopping) con paciencia de 25 épocas sin mejora en Dice de validación',
  pacienciaGeneral: 25,
  notaMetodologica:
    'Las épocas efectivas de Etapa 1 dependen exclusivamente de la parada temprana según el Dice de validación. Ningún modelo completó el máximo configurado de 150 épocas.',
  arquitecturas: [
    {
      arquitectura: 'UNet',
      etapa: 'E1',
      epocasEfectivas: 80,
      epocasMaximasConfiguradas: 150,
      criterioParada: 'Early Stopping (25 épocas sin mejora tras pico en época 55)',
      paciencia: 25,
      mejorEpoca: 55,
      mejorMetrica: 'Dice de validación',
      mejorValor: 0.895,
    },
    {
      arquitectura: 'CBAM',
      etapa: 'E1',
      epocasEfectivas: 48,
      epocasMaximasConfiguradas: 150,
      criterioParada: 'Early Stopping (25 épocas sin mejora tras pico en época 23)',
      paciencia: 25,
      mejorEpoca: 23,
      mejorMetrica: 'Dice de validación',
      mejorValor: 0.8731,
    },
    {
      arquitectura: 'ModCBAM',
      etapa: 'E1',
      epocasEfectivas: 75,
      epocasMaximasConfiguradas: 150,
      criterioParada: 'Early Stopping (25 épocas sin mejora tras pico en época 50)',
      paciencia: 25,
      mejorEpoca: 50,
      mejorMetrica: 'Dice de validación',
      mejorValor: 0.8935,
    },
    {
      arquitectura: 'TransUNet',
      etapa: 'E1',
      epocasEfectivas: 106,
      epocasMaximasConfiguradas: 150,
      criterioParada: 'Early Stopping (25 épocas sin mejora tras pico en época 81)',
      paciencia: 25,
      mejorEpoca: 81,
      mejorMetrica: 'Dice de validación',
      mejorValor: 0.8969,
    },
  ],
};

/**
 * Metadatos estructurados de entrenamiento auditados para EV-02 (Etapa 2: Clasificación de Malignidad).
 * Las cuatro arquitecturas completaron el ciclo íntegro de 100 épocas con encoder congelado.
 */
export const METADATOS_ENTRENAMIENTO_E2: MetadatosEntrenamiento = {
  etapa: 'E2',
  epocasMaximasConfiguradas: 100,
  criterioParadaGeneral: 'Ciclo completo de 100 épocas (paciencia 50 no alcanzada)',
  pacienciaGeneral: 50,
  notaMetodologica:
    'En Etapa 2 con encoder congelado, las cuatro arquitecturas completaron con exactitud las 100 épocas efectivas programadas.',
  arquitecturas: [
    {
      arquitectura: 'UNet',
      etapa: 'E2',
      epocasEfectivas: 100,
      epocasMaximasConfiguradas: 100,
      criterioParada: 'Ciclo completo completado (100 épocas)',
      paciencia: 50,
      mejorEpoca: 72,
      mejorMetrica: 'MCC de validación',
      mejorValor: 0.7276,
    },
    {
      arquitectura: 'CBAM',
      etapa: 'E2',
      epocasEfectivas: 100,
      epocasMaximasConfiguradas: 100,
      criterioParada: 'Ciclo completo completado (100 épocas)',
      paciencia: 50,
      mejorEpoca: 75,
      mejorMetrica: 'MCC de validación',
      mejorValor: 0.7293,
    },
    {
      arquitectura: 'ModCBAM',
      etapa: 'E2',
      epocasEfectivas: 100,
      epocasMaximasConfiguradas: 100,
      criterioParada: 'Ciclo completo completado (100 épocas)',
      paciencia: 50,
      mejorEpoca: 54,
      mejorMetrica: 'MCC de validación',
      mejorValor: 0.7388,
    },
    {
      arquitectura: 'TransUNet',
      etapa: 'E2',
      epocasEfectivas: 100,
      epocasMaximasConfiguradas: 100,
      criterioParada: 'Ciclo completo completado (100 épocas)',
      paciencia: 50,
      mejorEpoca: 66,
      mejorMetrica: 'MCC de validación',
      mejorValor: 0.6866,
    },
  ],
};

/**
 * Metadatos científicos auditados para las evidencias EV-01 a EV-08.
 * Derivados directamente del análisis metodológico del notebook LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb.
 */
export const METADATOS_CIENTIFICOS_AUDITADOS: Record<
  string,
  {
    conjuntoEvaluacion: 'validacion' | 'prueba_independiente';
    resumenMuestral: string;
    limitacionesMetodologicas: string[];
  }
> = {
  'EV-01': {
    conjuntoEvaluacion: 'validacion',
    resumenMuestral: 'Validación E1 (Early Stopping: 48-106 épocas efectivas / máx. 150)',
    limitacionesMetodologicas: [
      'Muestra curvas de aprendizaje del subconjunto de validación (val_loss y val_dice), no de prueba independiente.',
      'Función de pérdida compuesta por Binary Cross-Entropy y distancia de Hausdorff.',
      'Parada temprana adaptativa (paciencia 25 por Dice): U-Net (80 épocas), U-Net + CBAM (48 épocas), ModCBAM (75 épocas) y TransUNet (106 épocas). No todos los modelos completaron el tope de 150 épocas.',
    ],
  },
  'EV-02': {
    conjuntoEvaluacion: 'validacion',
    resumenMuestral: 'Validación E2 (100 épocas efectivas completas / máx. 100)',
    limitacionesMetodologicas: [
      'Muestra curvas de aprendizaje del subconjunto de validación con encoder congelado.',
      'Métricas evaluadas: BCE, MCC y F1-Macro en validación.',
      'Las cuatro arquitecturas completaron las 100 épocas efectivas programadas (paciencia 50 no alcanzada).',
    ],
  },
  'EV-03': {
    conjuntoEvaluacion: 'prueba_independiente',
    resumenMuestral: 'Prueba independiente E2, N=213 nódulos',
    limitacionesMetodologicas: [
      'Evaluación sobre subconjunto de prueba independiente de 213 nódulos nunca vistos durante entrenamiento.',
      'Excluye nódulos indeterminados (clase 3 LIDC-IDRI).',
      'Umbral fijo de decisión de 0.5 para binarización diagnóstica.',
      'Inferencia sobre parches axiales centrales 2D (96x96 px).',
    ],
  },
  'EV-04': {
    conjuntoEvaluacion: 'prueba_independiente',
    resumenMuestral: 'Prueba independiente E2, N=213 nódulos',
    limitacionesMetodologicas: [
      'Curvas ROC calculadas sobre probabilidades continuas del conjunto de prueba independiente (N=213).',
      'Excluye nódulos indeterminados (clase 3 LIDC-IDRI).',
      'Comparativa pareada homogénea entre las 4 arquitecturas (DataLoader shuffle=False).',
    ],
  },
  'EV-05': {
    conjuntoEvaluacion: 'prueba_independiente',
    resumenMuestral: 'Prueba independiente E1, N=762 parches',
    limitacionesMetodologicas: [
      'Análisis de concordancia clínica de Bland-Altman sobre parches con presencia de nódulo (N=762).',
      'Cálculo de área geométrica en mm² derivado de la segmentación predicha vs máscara real.',
    ],
  },
  'EV-06': {
    conjuntoEvaluacion: 'prueba_independiente',
    resumenMuestral: 'Prueba independiente E2, 3 pacientes',
    limitacionesMetodologicas: [
      'Mapas de saliencia generados por gradientes de retropropagación directa sobre 3 pacientes malignos del conjunto de prueba.',
      'Integra corte tomográfico original y máscara de referencia en rojo.',
    ],
  },
  'EV-07': {
    conjuntoEvaluacion: 'prueba_independiente',
    resumenMuestral: 'Prueba independiente E2, 2 pacientes',
    limitacionesMetodologicas: [
      'Mapas Grad-CAM generados sobre la última capa convolucional para 2 pacientes del conjunto de prueba.',
      'Muestra porcentaje de confianza asignado a la malignidad.',
    ],
  },
  'EV-08': {
    conjuntoEvaluacion: 'prueba_independiente',
    resumenMuestral: 'Prueba independiente E1 + E2, 4 pacientes',
    limitacionesMetodologicas: [
      'Comparativa clínica simultánea en 4 pacientes del conjunto de prueba.',
      'Evalúa contorno de segmentación (E1) y clasificación diagnóstica con acierto/fallo cromático (E2).',
    ],
  },
};

/**
 * Diccionario de equivalencias de identificadores de modelos del proyecto PulmoVision AI.
 */
const MAPA_IDENTIFICADORES_MODELOS: Record<string, string[]> = {
  'unet-v1': ['UNet', 'unet', 'U-Net'],
  'unet-cbam-v1': ['CBAM', 'cbam', 'U-Net + CBAM', 'UNet + CBAM'],
  'modcbam-v1': ['ModCBAM', 'modcbam', 'Modified CBAM', 'Mod-CBAM'],
  'transunet-v1': ['TransUNet', 'transunet', 'Transformer U-Net', 'Transformer UNet'],
};

/**
 * Resuelve una ruta relativa de activo estático considerando `import.meta.env.BASE_URL`.
 * Garantiza compatibilidad tanto en raíz (`/`) como en subdirectorios de despliegue.
 */
export function resolverRutaPublica(ruta: string): string {
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = ruta.startsWith('/') ? ruta : `/${ruta}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Type predicate que comprueba si un objeto cumple con la estructura mínima de RecursoVisualJSON.
 */
export function esRecursoVisualValido(item: unknown): item is RecursoVisualJSON {
  if (item === null || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }

  const r = item as Record<string, unknown>;

  const idValido = typeof r.id === 'string' && r.id.trim().length > 0;
  const nombreValido = typeof r.nombre_archivo === 'string' && r.nombre_archivo.trim().length > 0;
  const categoriaValida =
    typeof r.categoria_principal === 'string' &&
    CATEGORIAS_EVIDENCIA_VALIDAS.includes(r.categoria_principal as CategoriaEvidencia);
  const subcategoriasValidas =
    Array.isArray(r.subcategorias_visibles) &&
    r.subcategorias_visibles.every(
      (sub) => typeof sub === 'string' && CATEGORIAS_EVIDENCIA_VALIDAS.includes(sub as CategoriaEvidencia)
    );
  const celdaValida = typeof r.celda_origen === 'number' && Number.isInteger(r.celda_origen) && r.celda_origen >= 0;
  const etapaValida =
    typeof r.etapa === 'string' && ETAPAS_EVIDENCIA_VALIDAS.includes(r.etapa as EtapaEvidencia);
  const arquitecturasValidas =
    Array.isArray(r.arquitecturas_asociadas) &&
    r.arquitecturas_asociadas.length > 0 &&
    r.arquitecturas_asociadas.every((arq) => typeof arq === 'string' && arq.trim().length > 0);
  const dimensionesValidas =
    r.dimensiones !== null &&
    typeof r.dimensiones === 'object' &&
    !Array.isArray(r.dimensiones) &&
    typeof (r.dimensiones as Record<string, unknown>).ancho === 'number' &&
    (r.dimensiones as Record<string, number>).ancho > 0 &&
    typeof (r.dimensiones as Record<string, unknown>).alto === 'number' &&
    (r.dimensiones as Record<string, number>).alto > 0;
  const tamanoValido = typeof r.tamano_bytes === 'number' && r.tamano_bytes > 0;
  const sha256Valido = typeof r.sha256 === 'string' && r.sha256.trim().length === 64;
  const tituloValido = typeof r.titulo === 'string' && r.titulo.trim().length > 0;
  const descripcionValida = typeof r.descripcion === 'string' && r.descripcion.trim().length > 0;
  const rutaValida = typeof r.ruta_relativa_directa === 'string' && r.ruta_relativa_directa.trim().length > 0;

  return (
    idValido &&
    nombreValido &&
    categoriaValida &&
    subcategoriasValidas &&
    celdaValida &&
    etapaValida &&
    arquitecturasValidas &&
    dimensionesValidas &&
    tamanoValido &&
    sha256Valido &&
    tituloValido &&
    descripcionValida &&
    rutaValida
  );
}

/**
 * Valida la integridad estructural de un índice completo deserializado.
 * Comprueba tipos, campos obligatorios, categorías, etapas y unicidad de identificadores.
 */
export function validarIndiceRecursos(data: unknown): { esValido: boolean; errores: string[] } {
  const errores: string[] = [];

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { esValido: false, errores: ['El índice debe ser un objeto JSON no nulo.'] };
  }

  const indice = data as Record<string, unknown>;

  if (typeof indice.version !== 'string' || indice.version.trim().length === 0) {
    errores.push('Falta la propiedad "version" o es inválida.');
  }

  if (typeof indice.origen !== 'string' || indice.origen.trim().length === 0) {
    errores.push('Falta la propiedad "origen" con el nombre del notebook fuente.');
  }

  if (!Array.isArray(indice.recursos)) {
    errores.push('La propiedad "recursos" debe ser un array.');
    return { esValido: false, errores };
  }

  const idsVistos = new Set<string>();

  indice.recursos.forEach((item, index) => {
    if (!esRecursoVisualValido(item)) {
      errores.push(`El recurso en la posición ${index} no cumple la estructura obligatoria.`);
      return;
    }

    if (idsVistos.has(item.id)) {
      errores.push(`Identificador duplicado detectado: "${item.id}" en el recurso "${item.nombre_archivo}".`);
    } else {
      idsVistos.add(item.id);
    }

    if (!CATEGORIAS_EVIDENCIA_VALIDAS.includes(item.categoria_principal)) {
      errores.push(`Categoría no válida "${item.categoria_principal}" en recurso ${item.id}.`);
    }

    if (!ETAPAS_EVIDENCIA_VALIDAS.includes(item.etapa)) {
      errores.push(`Etapa no válida "${item.etapa}" en recurso ${item.id}.`);
    }
  });

  return {
    esValido: errores.length === 0,
    errores,
  };
}

/**
 * Normaliza un RecursoVisualJSON a la estructura tipada RecursoVisualEvidencia para React.
 * Asigna los metadatos científicos auditados y garantiza la naturaleza comparativa.
 */
export function normalizarRecursoVisual(
  raw: RecursoVisualJSON,
  origenNotebook = 'LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb'
): RecursoVisualEvidencia {
  const metaAuditada = METADATOS_CIENTIFICOS_AUDITADOS[raw.id];

  // Regla metodológica: Todos los recursos son comparativos compartidos
  // No se permite que el servicio clasifique una evidencia comparativa como individual.
  const tipoEvidencia = 'comparativa';

  const conjuntoEvaluacion = metaAuditada
    ? metaAuditada.conjuntoEvaluacion
    : raw.etapa === 'E1'
    ? 'prueba_independiente'
    : 'prueba_independiente';

  const resumenMuestral = metaAuditada
    ? metaAuditada.resumenMuestral
    : `Evaluación ${raw.etapa}`;

  const rutaResuelta = resolverRutaPublica(raw.ruta_relativa_directa);

  // Normalización estructurada de metadatos de entrenamiento (E1 / E2)
  let metadatosEntrenamiento: MetadatosEntrenamiento | undefined = undefined;

  if (raw.metadatos_entrenamiento) {
    const meRaw = raw.metadatos_entrenamiento;
    metadatosEntrenamiento = {
      etapa: meRaw.etapa,
      epocasMaximasConfiguradas: meRaw.epocas_maximas_configuradas,
      criterioParadaGeneral: meRaw.criterio_parada_general,
      pacienciaGeneral: meRaw.paciencia_general,
      notaMetodologica: meRaw.nota_metodologica,
      arquitecturas: meRaw.arquitecturas.map((arq) => ({
        arquitectura: arq.arquitectura,
        etapa: arq.etapa,
        epocasEfectivas: arq.epocas_efectivas,
        epocasMaximasConfiguradas: arq.epocas_maximas_configuradas,
        criterioParada: arq.criterio_parada,
        paciencia: arq.paciencia,
        mejorEpoca: arq.mejor_epoca,
        mejorMetrica: arq.mejor_metrica,
        mejorValor: arq.mejor_valor,
      })),
    };
  } else if (raw.id === 'EV-01') {
    metadatosEntrenamiento = METADATOS_ENTRENAMIENTO_E1;
  } else if (raw.id === 'EV-02') {
    metadatosEntrenamiento = METADATOS_ENTRENAMIENTO_E2;
  }

  return {
    id: raw.id,
    nombreArchivo: raw.nombre_archivo,
    categoriaPrincipal: raw.categoria_principal,
    subcategoriasVisibles: [...raw.subcategorias_visibles],
    tipoEvidencia,
    esComparativa: true,
    esCompartida: true,
    etapa: raw.etapa,
    conjuntoEvaluacion,
    resumenMuestral,
    arquitecturasRepresentadas: [...raw.arquitecturas_asociadas],
    tipoRecurso: raw.tipo_recurso,
    celdaOrigen: raw.celda_origen,
    indiceSalida: raw.indice_salida,
    origenNotebook,
    formatoOriginal: raw.formato_original,
    modoColor: raw.modo_color,
    dimensiones: { ...raw.dimensiones },
    tamanoBytes: raw.tamano_bytes,
    sha256: raw.sha256,
    titulo: raw.titulo,
    descripcion: raw.descripcion,
    rutaRelativaPublic: raw.ruta_relativa_public,
    rutaRelativaDirecta: raw.ruta_relativa_directa,
    rutaResuelta,
    limitacionesMetodologicas: metaAuditada
      ? [...metaAuditada.limitacionesMetodologicas]
      : undefined,
    metadatosEntrenamiento,
  };
}

/**
 * Procesa un índice completo validado y retorna la lista de evidencias normalizadas.
 */
export function procesarIndiceRecursos(data: IndiceRecursosVisualesJSON): RecursoVisualEvidencia[] {
  const origen = data.origen || 'LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb';
  return data.recursos.map((raw) => normalizarRecursoVisual(raw, origen));
}

/**
 * Carga de forma asíncrona el índice JSON de recursos desde la carpeta pública de Vite.
 * Maneja errores de red, respuestas HTTP no exitosas y JSON malformado sin interrumpir la aplicación.
 */
export async function cargarIndiceRecursos(
  urlOpcional?: string
): Promise<{ indice: IndiceRecursosVisualesJSON | null; error?: string }> {
  const url = urlOpcional || resolverRutaPublica('/evidencias/indice_recursos.json');

  try {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      return {
        indice: null,
        error: `Error HTTP ${respuesta.status} al cargar el índice de evidencias desde ${url}`,
      };
    }

    const json = (await respuesta.json()) as unknown;
    const validacion = validarIndiceRecursos(json);

    if (!validacion.esValido) {
      return {
        indice: null,
        error: `Estructura del índice inválida: ${validacion.errores.join('; ')}`,
      };
    }

    return {
      indice: json as IndiceRecursosVisualesJSON,
    };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    return {
      indice: null,
      error: `Error de red o procesamiento al obtener ${url}: ${mensaje}`,
    };
  }
}

/**
 * Filtra la lista de evidencias por categoría principal o subcategorías visibles.
 */
export function filtrarEvidenciasPorCategoria(
  evidencias: RecursoVisualEvidencia[],
  categoria: CategoriaEvidencia | 'todas'
): RecursoVisualEvidencia[] {
  if (categoria === 'todas') {
    return evidencias;
  }
  return evidencias.filter(
    (ev) =>
      ev.categoriaPrincipal === categoria ||
      ev.subcategoriasVisibles.includes(categoria)
  );
}

/**
 * Filtra la lista de evidencias por etapa del experimento (E1, E2 o E1 + E2).
 */
export function filtrarEvidenciasPorEtapa(
  evidencias: RecursoVisualEvidencia[],
  etapa: EtapaEvidencia | 'todas'
): RecursoVisualEvidencia[] {
  if (etapa === 'todas') {
    return evidencias;
  }
  if (etapa === 'E1') {
    return evidencias.filter((ev) => ev.etapa === 'E1' || ev.etapa === 'E1 + E2');
  }
  if (etapa === 'E2') {
    return evidencias.filter((ev) => ev.etapa === 'E2' || ev.etapa === 'E1 + E2');
  }
  return evidencias.filter((ev) => ev.etapa === 'E1 + E2');
}

/**
 * Comprueba si un modelo especificado está representado en la lista de arquitecturas del recurso.
 */
function coincideArquitectura(arquitecturasAsociadas: string[], idOIdentificador: string): boolean {
  if (!idOIdentificador || idOIdentificador.trim().length === 0) {
    return false;
  }

  const normalizado = idOIdentificador.trim().toLowerCase();

  // Comprobar coincidencia directa insensible a mayúsculas
  if (arquitecturasAsociadas.some((a) => a.toLowerCase() === normalizado)) {
    return true;
  }

  // Comprobar contra alias y modelos homologados del proyecto
  const aliasEncontrados = MAPA_IDENTIFICADORES_MODELOS[normalizado];
  if (aliasEncontrados) {
    return aliasEncontrados.some((alias) =>
      arquitecturasAsociadas.some((a) => a.toLowerCase() === alias.toLowerCase())
    );
  }

  // Comprobación invertida (si el usuario pasó 'UNet', buscar si mapea a 'unet-v1')
  for (const [clave, aliases] of Object.entries(MAPA_IDENTIFICADORES_MODELOS)) {
    if (clave === normalizado || aliases.some((a) => a.toLowerCase() === normalizado)) {
      if (aliases.some((alias) => arquitecturasAsociadas.some((a) => a.toLowerCase() === alias.toLowerCase()))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Filtra la lista de evidencias por modelo o arquitectura representada.
 */
export function filtrarEvidenciasPorArquitectura(
  evidencias: RecursoVisualEvidencia[],
  arquitecturaId: string
): RecursoVisualEvidencia[] {
  if (!arquitecturaId || arquitecturaId === 'todos' || arquitecturaId === 'todas') {
    return evidencias;
  }
  return evidencias.filter((ev) => coincideArquitectura(ev.arquitecturasRepresentadas, arquitecturaId));
}

/**
 * Busca y retorna un recurso de evidencia por su ID único (e.g. 'EV-01').
 */
export function obtenerEvidenciaPorId(
  evidencias: RecursoVisualEvidencia[],
  id: string
): RecursoVisualEvidencia | undefined {
  if (!id || id.trim().length === 0) {
    return undefined;
  }
  return evidencias.find((ev) => ev.id.toLowerCase() === id.trim().toLowerCase());
}

/**
 * Metadatos de rigor conceptual y metodológico auditados para técnicas de visualización.
 */
export const ETIQUETAS_CONCEPTUALES_EVIDENCIA: Record<string, EtiquetaConceptualEvidencia> = {
  'EV-06': {
    tecnica: 'Saliencia por Gradientes Directos (Vanilla Saliency)',
    nombre: 'Vanilla Saliency',
    descripcion:
      'Sensibilidad de la salida del modelo respecto a los píxeles de entrada mediante gradientes.',
    aclaracion:
      'No representa atención CBAM nativa. Evalúa la respuesta de los pesos de la red a través de retropropagación del gradiente hacia la imagen original.',
    advertenciaNormalizacion:
      'Los mapas se normalizan independientemente por modelo y paciente. La comparación permite examinar patrones espaciales de focalización, pero no interpretar las intensidades de color como magnitudes absolutas comparables entre arquitecturas.',
  },
  'EV-07': {
    tecnica: 'Grad-CAM en Última Capa Convolucional',
    nombre: 'Grad-CAM',
    descripcion:
      'Activación convolucional ponderada por gradientes.',
    aclaracion:
      'En TransUNet el mapa se obtiene de down4, antes del bloque Transformer; no representa directamente la autoatención del Transformer.',
    advertenciaNormalizacion:
      'Los mapas se normalizan independientemente por modelo y paciente. La comparación permite examinar patrones espaciales de focalización, pero no interpretar las intensidades de color como magnitudes absolutas comparables entre arquitecturas.',
  },
  'EV-08': {
    tecnica: 'Validación Cualitativa Conjunta (Segmentación & Clasificación)',
    nombre: 'Comparación visual de segmentación y clasificación',
    descripcion:
      'Comparación cualitativa sobre muestras compartidas.',
    aclaracion:
      'No permite establecer superioridad poblacional por sí sola. Constituye una inspección cualitativa sobre 4 casos concretos que debe contrastarse con las métricas cuantitativas globales (EV-03, EV-04 y EV-05).',
  },
};

/**
 * Obtiene la etiqueta conceptual y notas metodológicas para una evidencia visual.
 */
export function obtenerEtiquetaConceptual(recursoId: string): EtiquetaConceptualEvidencia | null {
  if (!recursoId) return null;
  return ETIQUETAS_CONCEPTUALES_EVIDENCIA[recursoId.toUpperCase()] || null;
}

// Esquemas de disposición de columnas y paneles auditados
const ESQUEMA_CURVAS: ColumnaEsquema[] = [
  { indice: 0, etiqueta: 'U-Net', color: '#1f77b4', arquitectura: 'UNet' },
  { indice: 1, etiqueta: 'CBAM', color: '#ff7f0e', arquitectura: 'CBAM' },
  { indice: 2, etiqueta: 'ModCBAM', color: '#2ca02c', arquitectura: 'ModCBAM' },
  { indice: 3, etiqueta: 'TransUNet', color: '#d62728', arquitectura: 'TransUNet' },
];

const ESQUEMA_EV03: ColumnaEsquema[] = [
  { indice: 0, etiqueta: 'Col 0: U-Net', arquitectura: 'UNet' },
  { indice: 1, etiqueta: 'Col 1: CBAM', arquitectura: 'CBAM' },
  { indice: 2, etiqueta: 'Col 2: ModCBAM', arquitectura: 'ModCBAM' },
  { indice: 3, etiqueta: 'Col 3: TransUNet', arquitectura: 'TransUNet' },
];

const ESQUEMA_EV05: ColumnaEsquema[] = [
  { indice: 0, etiqueta: 'Col 0: U-Net', arquitectura: 'UNet' },
  { indice: 1, etiqueta: 'Col 1: CBAM', arquitectura: 'CBAM' },
  { indice: 2, etiqueta: 'Col 2: ModCBAM', arquitectura: 'ModCBAM' },
  { indice: 3, etiqueta: 'Col 3: TransUNet', arquitectura: 'TransUNet' },
];

const ESQUEMA_EV06: ColumnaEsquema[] = [
  { indice: 0, etiqueta: 'Col 0: TAC', esReferencia: true },
  { indice: 1, etiqueta: 'Col 1: GT', esReferencia: true },
  { indice: 2, etiqueta: 'Col 2: U-Net', arquitectura: 'UNet' },
  { indice: 3, etiqueta: 'Col 3: CBAM', arquitectura: 'CBAM' },
  { indice: 4, etiqueta: 'Col 4: ModCBAM', arquitectura: 'ModCBAM' },
  { indice: 5, etiqueta: 'Col 5: TransUNet', arquitectura: 'TransUNet' },
];

const ESQUEMA_EV07: ColumnaEsquema[] = [
  { indice: 0, etiqueta: 'Col 0: TAC + GT', esReferencia: true },
  { indice: 1, etiqueta: 'Col 1: U-Net', arquitectura: 'UNet' },
  { indice: 2, etiqueta: 'Col 2: CBAM', arquitectura: 'CBAM' },
  { indice: 3, etiqueta: 'Col 3: ModCBAM', arquitectura: 'ModCBAM' },
  { indice: 4, etiqueta: 'Col 4: TransUNet', arquitectura: 'TransUNet' },
];

const ESQUEMA_EV08: ColumnaEsquema[] = [
  { indice: 0, etiqueta: 'Col 0: TAC', esReferencia: true },
  { indice: 1, etiqueta: 'Col 1: GT', esReferencia: true },
  { indice: 2, etiqueta: 'Col 2: U-Net', arquitectura: 'UNet' },
  { indice: 3, etiqueta: 'Col 3: CBAM', arquitectura: 'CBAM' },
  { indice: 4, etiqueta: 'Col 4: ModCBAM', arquitectura: 'ModCBAM' },
  { indice: 5, etiqueta: 'Col 5: TransUNet', arquitectura: 'TransUNet' },
];

/**
 * Retorna el esquema de columnas o trazados para un recurso visual dado.
 */
export function obtenerEsquemaEvidencia(recursoId: string): ColumnaEsquema[] | undefined {
  if (!recursoId) return undefined;
  switch (recursoId.toUpperCase()) {
    case 'EV-01':
    case 'EV-02':
    case 'EV-04':
      return ESQUEMA_CURVAS;
    case 'EV-03':
      return ESQUEMA_EV03;
    case 'EV-05':
      return ESQUEMA_EV05;
    case 'EV-06':
      return ESQUEMA_EV06;
    case 'EV-07':
      return ESQUEMA_EV07;
    case 'EV-08':
      return ESQUEMA_EV08;
    default:
      return undefined;
  }
}

/**
 * Diccionario de correspondencia visual documentada por recurso y arquitectura.
 * Extraído directamente del código ejecutable del notebook.
 */
const GUIAS_VISUALES_DOCUMENTADAS: Record<string, Record<string, GuiaVisualModelo>> = {
  'EV-01': {
    UNet: {
      posicion: 'Trazado Azul (#1f77b4)',
      color: '#1f77b4',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Línea azul en gráficos de Loss (BCE + Hausdorff) y Dice de validación (E1).',
    },
    CBAM: {
      posicion: 'Trazado Naranja (#ff7f0e)',
      color: '#ff7f0e',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Línea naranja en gráficos de Loss (BCE + Hausdorff) y Dice de validación (E1).',
    },
    ModCBAM: {
      posicion: 'Trazado Verde (#2ca02c)',
      color: '#2ca02c',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Línea verde en gráficos de Loss (BCE + Hausdorff) y Dice de validación (E1).',
    },
    TransUNet: {
      posicion: 'Trazado Rojo (#d62728)',
      color: '#d62728',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Línea roja en gráficos de Loss (BCE + Hausdorff) y Dice de validación (E1).',
    },
  },
  'EV-02': {
    UNet: {
      posicion: 'Trazado Azul (#1f77b4)',
      color: '#1f77b4',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Línea azul en gráficos de Loss BCE, MCC y F1-Macro de validación (E2).',
    },
    CBAM: {
      posicion: 'Trazado Naranja (#ff7f0e)',
      color: '#ff7f0e',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Línea naranja en gráficos de Loss BCE, MCC y F1-Macro de validación (E2).',
    },
    ModCBAM: {
      posicion: 'Trazado Verde (#2ca02c)',
      color: '#2ca02c',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Línea verde en gráficos de Loss BCE, MCC y F1-Macro de validación (E2).',
    },
    TransUNet: {
      posicion: 'Trazado Rojo (#d62728)',
      color: '#d62728',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Línea roja en gráficos de Loss BCE, MCC y F1-Macro de validación (E2).',
    },
  },
  'EV-03': {
    UNet: {
      posicion: 'Columna 1 (Subplot 1)',
      columnaIndice: 0,
      totalColumnas: 4,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV03,
      detalle: 'Matriz de confusión de UNet en Columna 0 (Subplot 1) sobre 213 nódulos de prueba (Benigno vs Maligno).',
    },
    CBAM: {
      posicion: 'Columna 2 (Subplot 2)',
      columnaIndice: 1,
      totalColumnas: 4,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV03,
      detalle: 'Matriz de confusión de CBAM en Columna 1 (Subplot 2) sobre 213 nódulos de prueba (Benigno vs Maligno).',
    },
    ModCBAM: {
      posicion: 'Columna 3 (Subplot 3)',
      columnaIndice: 2,
      totalColumnas: 4,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV03,
      detalle: 'Matriz de confusión de ModCBAM en Columna 2 (Subplot 3) sobre 213 nódulos de prueba (Benigno vs Maligno).',
    },
    TransUNet: {
      posicion: 'Columna 4 (Subplot 4)',
      columnaIndice: 3,
      totalColumnas: 4,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV03,
      detalle: 'Matriz de confusión de TransUNet en Columna 3 (Subplot 4) sobre 213 nódulos de prueba (Benigno vs Maligno).',
    },
  },
  'EV-04': {
    UNet: {
      posicion: 'Curva Azul (AUC = 0.914)',
      color: '#1f77b4',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Curva ROC de UNet con AUC de 0.914 en conjunto de prueba.',
    },
    CBAM: {
      posicion: 'Curva Naranja (AUC = 0.896)',
      color: '#ff7f0e',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Curva ROC de CBAM con AUC de 0.896 en conjunto de prueba.',
    },
    ModCBAM: {
      posicion: 'Curva Verde (AUC = 0.900)',
      color: '#2ca02c',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Curva ROC de ModCBAM con AUC de 0.900 en conjunto de prueba.',
    },
    TransUNet: {
      posicion: 'Curva Roja (AUC = 0.809)',
      color: '#d62728',
      tipoDisposicion: 'curvas',
      esquemaColumnas: ESQUEMA_CURVAS,
      detalle: 'Curva ROC de TransUNet con AUC de 0.809 en conjunto de prueba.',
    },
  },
  'EV-05': {
    UNet: {
      posicion: 'Panel 1 (Columna 1)',
      columnaIndice: 0,
      totalColumnas: 4,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV05,
      detalle: 'Dispersión y límites de concordancia Bland-Altman del área segmentada por UNet en Panel 1 (Columna 0).',
    },
    CBAM: {
      posicion: 'Panel 2 (Columna 2)',
      columnaIndice: 1,
      totalColumnas: 4,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV05,
      detalle: 'Dispersión y límites de concordancia Bland-Altman del área segmentada por CBAM en Panel 2 (Columna 1).',
    },
    ModCBAM: {
      posicion: 'Panel 3 (Columna 3)',
      columnaIndice: 2,
      totalColumnas: 4,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV05,
      detalle: 'Dispersión y límites de concordancia Bland-Altman del área segmentada por ModCBAM en Panel 3 (Columna 2).',
    },
    TransUNet: {
      posicion: 'Panel 4 (Columna 4)',
      columnaIndice: 3,
      totalColumnas: 4,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV05,
      detalle: 'Dispersión y límites de concordancia Bland-Altman del área segmentada por TransUNet en Panel 4 (Columna 3).',
    },
  },
  'EV-06': {
    UNet: {
      posicion: 'Columna 2 (U-Net)',
      columnaIndice: 2,
      totalColumnas: 6,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV06,
      detalle: 'Mapa de saliencia visual y predicción de UNet en Columna 2 (tras TAC en Col 0 y GT en Col 1).',
    },
    CBAM: {
      posicion: 'Columna 3 (U-Net + CBAM)',
      columnaIndice: 3,
      totalColumnas: 6,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV06,
      detalle: 'Mapa de saliencia visual y predicción de CBAM en Columna 3 (tras TAC en Col 0 y GT en Col 1).',
    },
    ModCBAM: {
      posicion: 'Columna 4 (ModCBAM)',
      columnaIndice: 4,
      totalColumnas: 6,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV06,
      detalle: 'Mapa de saliencia visual y predicción de ModCBAM en Columna 4 (tras TAC en Col 0 y GT en Col 1).',
    },
    TransUNet: {
      posicion: 'Columna 5 (TransUNet)',
      columnaIndice: 5,
      totalColumnas: 6,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV06,
      detalle: 'Mapa de saliencia visual y predicción de TransUNet en Columna 5 (tras TAC en Col 0 y GT en Col 1).',
    },
  },
  'EV-07': {
    UNet: {
      posicion: 'Columna 1 (U-Net)',
      columnaIndice: 1,
      totalColumnas: 5,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV07,
      detalle: 'Mapa de calor Grad-CAM y confianza de UNet en Columna 1 (tras corte TAC+GT combinado en Col 0).',
    },
    CBAM: {
      posicion: 'Columna 2 (U-Net + CBAM)',
      columnaIndice: 2,
      totalColumnas: 5,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV07,
      detalle: 'Mapa de calor Grad-CAM y confianza de CBAM en Columna 2 (tras corte TAC+GT combinado en Col 0).',
    },
    ModCBAM: {
      posicion: 'Columna 3 (ModCBAM)',
      columnaIndice: 3,
      totalColumnas: 5,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV07,
      detalle: 'Mapa de calor Grad-CAM y confianza de ModCBAM en Columna 3 (tras corte TAC+GT combinado en Col 0).',
    },
    TransUNet: {
      posicion: 'Columna 4 (TransUNet)',
      columnaIndice: 4,
      totalColumnas: 5,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV07,
      detalle: 'Mapa de calor Grad-CAM y confianza de TransUNet en Columna 4 (tras corte TAC+GT combinado en Col 0).',
    },
  },
  'EV-08': {
    UNet: {
      posicion: 'Columna 2 (U-Net)',
      columnaIndice: 2,
      totalColumnas: 6,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV08,
      detalle: 'Contorno predicho en amarillo y diagnóstico inferido por UNet en Columna 2 (tras TAC en Col 0 y GT en Col 1).',
    },
    CBAM: {
      posicion: 'Columna 3 (U-Net + CBAM)',
      columnaIndice: 3,
      totalColumnas: 6,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV08,
      detalle: 'Contorno predicho en amarillo y diagnóstico inferido por CBAM en Columna 3 (tras TAC en Col 0 y GT en Col 1).',
    },
    ModCBAM: {
      posicion: 'Columna 4 (ModCBAM)',
      columnaIndice: 4,
      totalColumnas: 6,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV08,
      detalle: 'Contorno predicho en amarillo y diagnóstico inferido por ModCBAM en Columna 4 (tras TAC en Col 0 y GT en Col 1).',
    },
    TransUNet: {
      posicion: 'Columna 5 (TransUNet)',
      columnaIndice: 5,
      totalColumnas: 6,
      tipoDisposicion: 'columnas',
      esquemaColumnas: ESQUEMA_EV08,
      detalle: 'Contorno predicho en amarillo y diagnóstico inferido por TransUNet en Columna 5 (tras TAC en Col 0 y GT en Col 1).',
    },
  },
};

/**
 * Retorna la guía visual documentada para una arquitectura específica dentro de una evidencia comparativa.
 * Si la arquitectura no tiene correspondencia verificable, retorna un descriptor seguro con "Correspondencia no documentada".
 */
export function obtenerGuiaVisualModelo(
  recursoId: string,
  modeloIdOAlias?: string
): GuiaVisualModelo | null {
  if (!recursoId) return null;
  if (!modeloIdOAlias || modeloIdOAlias.trim().length === 0) return null;

  const guiasPorRecurso = GUIAS_VISUALES_DOCUMENTADAS[recursoId.toUpperCase()];
  if (!guiasPorRecurso) return null;

  const normalizado = modeloIdOAlias.trim().toLowerCase();

  // Mapear el ID o alias recibido a una clave canónica ('UNet', 'CBAM', 'ModCBAM', 'TransUNet')
  let claveCanonica: string | null = null;
  if (normalizado === 'unet-v1' || normalizado === 'unet' || normalizado === 'u-net') {
    claveCanonica = 'UNet';
  } else if (
    normalizado === 'unet-cbam-v1' ||
    normalizado === 'cbam' ||
    normalizado === 'u-net + cbam' ||
    normalizado === 'unet + cbam' ||
    normalizado === 'unet-cbam'
  ) {
    claveCanonica = 'CBAM';
  } else if (
    normalizado === 'modcbam-v1' ||
    normalizado === 'modcbam' ||
    normalizado === 'modified cbam' ||
    normalizado === 'mod-cbam'
  ) {
    claveCanonica = 'ModCBAM';
  } else if (
    normalizado === 'transunet-v1' ||
    normalizado === 'transunet' ||
    normalizado === 'transformer u-net' ||
    normalizado === 'transformer unet' ||
    normalizado === 'trans-unet'
  ) {
    claveCanonica = 'TransUNet';
  }

  if (claveCanonica && guiasPorRecurso[claveCanonica]) {
    return guiasPorRecurso[claveCanonica];
  }

  // Búsqueda directa por si coincide exactamente
  for (const [clave, guia] of Object.entries(guiasPorRecurso)) {
    if (clave.toLowerCase() === normalizado) {
      return guia;
    }
  }

  return null;
}
