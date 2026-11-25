
export interface EtapaEntrenamiento {
  train_loss?: number[];
  val_loss?: number[];
  val_dice?: number[];
  val_mcc?: number[];
  val_f1?: number[];
}

export interface HistorialEntrenamiento {
  [etapa: string]: EtapaEntrenamiento;
}

export interface RegistroHistorialEntrenamiento {
  id: string;
  modeloId: string;
  nombreArchivo: string;
  fechaImportacion: string;
  etapas: HistorialEntrenamiento;
}

// Nombres de las métricas originales de los JSON
export const nombresMetricasEntrenamiento: Record<
  keyof EtapaEntrenamiento,
  string
> = {
  train_loss: "Pérdida de entrenamiento",
  val_loss: "Pérdida de validación",
  val_dice: "Dice de validación",
  val_mcc: "MCC de validación",
  val_f1: "F1 de validación",
};
