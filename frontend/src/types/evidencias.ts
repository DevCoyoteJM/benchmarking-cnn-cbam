/**
 * Tipos e interfaces del modelo de evidencias visuales de PulmoVision AI.
 * Basado en el inventario real extraído del notebook de investigación:
 * LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb
 */

export const CATEGORIAS_EVIDENCIA_VALIDAS = [
  'metricas',
  'atencion',
  'comparaciones',
  'tomografias',
  'mascaras',
  'segmentaciones',
  'arquitecturas',
  'otros',
] as const;

export type CategoriaEvidencia = typeof CATEGORIAS_EVIDENCIA_VALIDAS[number];

export const ETAPAS_EVIDENCIA_VALIDAS = ['E1', 'E2', 'E1 + E2'] as const;

export type EtapaEvidencia = typeof ETAPAS_EVIDENCIA_VALIDAS[number];

export const TIPOS_EVIDENCIA_VALIDOS = [
  'comparativa',
  'individual',
  'compartida',
] as const;

export type TipoEvidencia = typeof TIPOS_EVIDENCIA_VALIDOS[number];

export const CONJUNTOS_EVALUACION_VALIDOS = [
  'entrenamiento',
  'validacion',
  'prueba_independiente',
  'mixto',
] as const;

export type ConjuntoEvaluacion = typeof CONJUNTOS_EVALUACION_VALIDOS[number];

export interface DimensionesEvidencia {
  ancho: number;
  alto: number;
}

/**
 * Registro individual de dinámica de entrenamiento para una arquitectura en JSON (snake_case).
 */
export interface InfoEntrenamientoArquitecturaJSON {
  arquitectura: string;
  etapa: 'E1' | 'E2';
  epocas_efectivas: number;
  epocas_maximas_configuradas: number;
  criterio_parada: string;
  paciencia?: number;
  mejor_epoca?: number;
  mejor_metrica?: string;
  mejor_valor?: number;
}

/**
 * Contenedor de metadatos de entrenamiento en JSON (snake_case) dentro de indice_recursos.json.
 */
export interface MetadatosEntrenamientoJSON {
  etapa: 'E1' | 'E2';
  epocas_maximas_configuradas: number;
  criterio_parada_general: string;
  paciencia_general?: number;
  nota_metodologica: string;
  arquitecturas: InfoEntrenamientoArquitecturaJSON[];
}

/**
 * Registro individual de dinámica de entrenamiento para una arquitectura (TypeScript normalizado).
 */
export interface InfoEntrenamientoArquitectura {
  arquitectura: string;
  etapa: 'E1' | 'E2';
  epocasEfectivas: number;
  epocasMaximasConfiguradas: number;
  criterioParada: string;
  paciencia?: number;
  mejorEpoca?: number;
  mejorMetrica?: string;
  mejorValor?: number;
}

/**
 * Metadatos estructurados de entrenamiento asociados a una evidencia de dinámica experimental.
 */
export interface MetadatosEntrenamiento {
  etapa: 'E1' | 'E2';
  epocasMaximasConfiguradas: number;
  criterioParadaGeneral: string;
  pacienciaGeneral?: number;
  notaMetodologica: string;
  arquitecturas: InfoEntrenamientoArquitectura[];
}

/**
 * Representación exacta de cada elemento del array `recursos`
 * dentro del archivo real `frontend/public/evidencias/indice_recursos.json`.
 */
export interface RecursoVisualJSON {
  id: string;
  nombre_archivo: string;
  categoria_principal: CategoriaEvidencia;
  subcategorias_visibles: CategoriaEvidencia[];
  tipo_recurso: string;
  celda_origen: number;
  indice_salida: number;
  etapa: EtapaEvidencia;
  arquitecturas_asociadas: string[];
  formato_original: string;
  modo_color: string;
  dimensiones: DimensionesEvidencia;
  tamano_bytes: number;
  sha256: string;
  titulo: string;
  descripcion: string;
  ruta_relativa_public: string;
  ruta_relativa_directa: string;
  metadatos_entrenamiento?: MetadatosEntrenamientoJSON;
}

/**
 * Representación exacta de la raíz del archivo real
 * `frontend/public/evidencias/indice_recursos.json`.
 */
export interface IndiceRecursosVisualesJSON {
  version: string;
  origen: string;
  total_celdas_notebook: number;
  total_recursos_extraidos: number;
  resumen_por_categoria: Record<CategoriaEvidencia, number>;
  recursos: RecursoVisualJSON[];
}

/**
 * Modelo de datos enriquecido y normalizado para el consumo en la interfaz React.
 * Añade resolución de URLs públicas (`rutaResuelta`), contexto científico verificado
 * (`conjuntoEvaluacion`, `resumenMuestral`, `limitacionesMetodologicas`)
 * y preserva la naturaleza comparativa multiarquitectura.
 */
export interface RecursoVisualEvidencia {
  id: string;
  nombreArchivo: string;
  categoriaPrincipal: CategoriaEvidencia;
  subcategoriasVisibles: CategoriaEvidencia[];
  tipoEvidencia: TipoEvidencia;
  esComparativa: boolean;
  esCompartida: boolean;
  etapa: EtapaEvidencia;
  conjuntoEvaluacion: ConjuntoEvaluacion;
  resumenMuestral: string;
  arquitecturasRepresentadas: string[];
  tipoRecurso: string;
  celdaOrigen: number;
  indiceSalida: number;
  origenNotebook: string;
  formatoOriginal: string;
  modoColor: string;
  dimensiones: DimensionesEvidencia;
  tamanoBytes: number;
  sha256: string;
  titulo: string;
  descripcion: string;
  rutaRelativaPublic: string;
  rutaRelativaDirecta: string;
  rutaResuelta: string;
  limitacionesMetodologicas?: string[];
  metadatosEntrenamiento?: MetadatosEntrenamiento;
}

/**
 * Esquema de una columna o panel individual dentro de una evidencia comparativa.
 */
export interface ColumnaEsquema {
  indice: number;
  etiqueta: string;
  esReferencia?: boolean;
  arquitectura?: string;
  color?: string;
}

/**
 * Guía visual documentada que especifica la ubicación (trazado, columna o matriz)
 * de una arquitectura particular dentro de una imagen comparativa.
 */
export interface GuiaVisualModelo {
  posicion: string;
  color?: string;
  detalle: string;
  columnaIndice?: number;
  totalColumnas?: number;
  esquemaColumnas?: ColumnaEsquema[];
  tipoDisposicion?: 'columnas' | 'curvas' | 'paneles';
  esNoDocumentada?: boolean;
}

/**
 * Metadatos de rigor conceptual y metodológico asociados a una técnica de visualización.
 */
export interface EtiquetaConceptualEvidencia {
  tecnica: string;
  nombre: string;
  descripcion: string;
  aclaracion: string;
  advertenciaNormalizacion?: string;
}
