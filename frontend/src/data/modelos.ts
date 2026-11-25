export type EstadoModelo =
  | "disponible"
  | "en_entrenamiento"
  | "pendiente";

export interface ModeloIA {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  principal: boolean;
  estado: EstadoModelo;
  color: string;
}

export const modelos: ModeloIA[] = [
  {
    id: "unet",
    nombre: "U-Net",
    descripcion:
      "Arquitectura convolucional base de referencia para la segmentación y detección de lesiones pulmonares.",
    categoria: "CNN Base",
    principal: true,
    estado: "pendiente",
    color: "unet",
  },
  {
    id: "unet-cbam",
    nombre: "U-Net + CBAM",
    descripcion:
      "Arquitectura optimizada con el Módulo de Atención Convolucional de Bloque (CBAM) en canales y espacio.",
    categoria: "CNN con Atención",
    principal: true,
    estado: "pendiente",
    color: "cbam",
  },
  {
    id: "modcbam",
    nombre: "ModCBAM",
    descripcion:
      "Variante experimental con modificación en el mecanismo de atención para análisis comparativo.",
    categoria: "Variante Experimental",
    principal: false,
    estado: "pendiente",
    color: "modcbam",
  },
  {
    id: "transunet",
    nombre: "TransUNet",
    descripcion:
      "Arquitectura híbrida que combina Transformer y U-Net como punto de comparación de vanguardia.",
    categoria: "Híbrido / Transformer",
    principal: false,
    estado: "pendiente",
    color: "transunet",
  },
];