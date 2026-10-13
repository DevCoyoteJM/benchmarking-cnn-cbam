export interface MetricasModelo {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rocAuc?: number;
  dice?: number;
}

export type EstadoExperimento =
  | "pendiente"
  | "parcial"
  | "finalizado";


export interface ConfiguracionEntrenamiento {
  dataset?: string;
  framework?: string;
  epocas?: number;
  batchSize?: number;
  learningRate?: number;
  optimizador?: string;
  funcionPerdida?: string;
  divisionDatos?: string;
  hardware?: string;
  archivoNotebook?: string;
  archivoPDF?: string;
  observaciones?: string;
}

export interface ResultadoModelo {
  id: string;
  modeloId: string;
  version: string;
  fecha: string | null;
  estado: EstadoExperimento;
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
    descripcion: "Evaluación inicial de U-Net.",
    metricas: {},
  },
  {
    id: "unet-cbam-v1",
    modeloId: "unet-cbam",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    descripcion: "Evaluación inicial de U-Net + CBAM.",
    metricas: {},
  },
  {
    id: "modcbam-v1",
    modeloId: "modcbam",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    descripcion: "Evaluación inicial de ModCBAM.",
    metricas: {},
  },
  {
    id: "transunet-v1",
    modeloId: "transunet",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    descripcion: "Evaluación inicial de TransUNet.",
    metricas: {},
  },
];

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