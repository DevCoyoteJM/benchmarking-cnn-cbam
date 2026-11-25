import type { HistorialEntrenamiento } from './historialEntrenamiento';
import unetHistorial from './historiales/UNet_historial.json';
import cbamHistorial from './historiales/CBAM_historial.json';
import modcbamHistorial from './historiales/ModCBAM_historial.json';
import transunetHistorial from './historiales/TransUNet_historial.json';

export interface HistorialCanónicoModelo {
  id: 'unet' | 'unet-cbam' | 'modcbam' | 'transunet';
  nombreArchivo: string;
  datos: HistorialEntrenamiento;
}

export const HISTORIALES_CANONICOS: Record<'unet' | 'unet-cbam' | 'modcbam' | 'transunet', HistorialEntrenamiento> = {
  unet: unetHistorial as unknown as HistorialEntrenamiento,
  'unet-cbam': cbamHistorial as unknown as HistorialEntrenamiento,
  modcbam: modcbamHistorial as unknown as HistorialEntrenamiento,
  transunet: transunetHistorial as unknown as HistorialEntrenamiento,
};
