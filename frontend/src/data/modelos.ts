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
}

export const modelos: ModeloIA[] = [
  {
    id: "unet",
    nombre: "U-Net",
    descripcion: "Arquitectura de referencia.",
    categoria: "CNN",
    principal: true,
    estado: "pendiente",
  },
  {
    id: "unet-cbam",
    nombre: "U-Net + CBAM",
    descripcion: "Arquitectura con mecanismo de atención CBAM.",
    categoria: "CNN con atención",
    principal: true,
    estado: "pendiente",
  },
  {
    id: "modcbam",
    nombre: "ModCBAM",
    descripcion: "Variante modificada del mecanismo de atención.",
    categoria: "Modelo experimental",
    principal: false,
    estado: "pendiente",
  },
  {
    id: "transunet",
    nombre: "TransUNet",
    descripcion: "Arquitectura adicional para comparación.",
    categoria: "Modelo experimental",
    principal: false,
    estado: "pendiente",
  },
];