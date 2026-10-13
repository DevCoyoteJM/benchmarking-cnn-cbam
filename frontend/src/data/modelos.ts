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
    descripcion: "Arquitectura de referencia.",
    categoria: "CNN",
    principal: true,
    estado: "pendiente",
    color: "unet",
  },
  {
    id: "unet-cbam",
    nombre: "U-Net + CBAM",
    descripcion: "Arquitectura con mecanismo de atención CBAM.",
    categoria: "CNN con atención",
    principal: true,
    estado: "pendiente",
    color: "cbam",
  },
  {
    id: "modcbam",
    nombre: "ModCBAM",
    descripcion: "Variante modificada del mecanismo de atención.",
    categoria: "Modelo experimental",
    principal: false,
    estado: "pendiente",
    color: "modcbam",
  },
  {
    id: "transunet",
    nombre: "TransUNet",
    descripcion: "Arquitectura adicional para comparación.",
    categoria: "Modelo experimental",
    principal: false,
    estado: "pendiente",
    color: "transunet",
  },
];