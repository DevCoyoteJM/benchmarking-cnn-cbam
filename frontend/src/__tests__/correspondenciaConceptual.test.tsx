import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import ModalVisorEvidencia from '../components/ModalVisorEvidencia';
import TarjetaEvidencia from '../components/TarjetaEvidencia';
import {
  procesarIndiceRecursos,
  obtenerGuiaVisualModelo,
  obtenerEtiquetaConceptual,
} from '../services/evidenciasService';
import realIndiceJson from '../../public/evidencias/indice_recursos.json';
import type { IndiceRecursosVisualesJSON, RecursoVisualEvidencia } from '../types/evidencias';

const todosRecursos: RecursoVisualEvidencia[] = procesarIndiceRecursos(
  realIndiceJson as IndiceRecursosVisualesJSON
);

const ev06 = todosRecursos.find((r) => r.id === 'EV-06')!;
const ev07 = todosRecursos.find((r) => r.id === 'EV-07')!;
const ev08 = todosRecursos.find((r) => r.id === 'EV-08')!;

describe('FASE 4.6B — Indicadores de correspondencia y rigor conceptual', () => {
  const dummyOnCerrar = vi.fn();
  const dummyOnCambiar = vi.fn();

  describe('1. Correspondencia dinámica de columnas en el servicio', () => {
    it('EV-06 asigna U-Net a la columna 2 (índice 2) sobre 6 columnas', () => {
      const guiaUNet = obtenerGuiaVisualModelo('EV-06', 'unet');
      expect(guiaUNet).not.toBeNull();
      expect(guiaUNet?.posicion).toContain('Columna 2');
      expect(guiaUNet?.columnaIndice).toBe(2);
      expect(guiaUNet?.totalColumnas).toBe(6);
      expect(guiaUNet?.tipoDisposicion).toBe('columnas');
    });

    it('EV-07 asigna U-Net a la columna 1 (índice 1) sobre 5 columnas', () => {
      const guiaUNet = obtenerGuiaVisualModelo('EV-07', 'unet');
      expect(guiaUNet).not.toBeNull();
      expect(guiaUNet?.posicion).toContain('Columna 1');
      expect(guiaUNet?.columnaIndice).toBe(1);
      expect(guiaUNet?.totalColumnas).toBe(5);
      expect(guiaUNet?.tipoDisposicion).toBe('columnas');
    });

    it('EV-08 asigna U-Net a la columna 2 (índice 2) sobre 6 columnas', () => {
      const guiaUNet = obtenerGuiaVisualModelo('EV-08', 'unet');
      expect(guiaUNet).not.toBeNull();
      expect(guiaUNet?.posicion).toContain('Columna 2');
      expect(guiaUNet?.columnaIndice).toBe(2);
      expect(guiaUNet?.totalColumnas).toBe(6);
      expect(guiaUNet?.tipoDisposicion).toBe('columnas');
    });

    it('demuestra la diferencia de índices: EV-07 tiene índice 1 mientras EV-06 y EV-08 tienen índice 2', () => {
      const guiaEV06 = obtenerGuiaVisualModelo('EV-06', 'unet');
      const guiaEV07 = obtenerGuiaVisualModelo('EV-07', 'unet');
      const guiaEV08 = obtenerGuiaVisualModelo('EV-08', 'unet');

      expect(guiaEV07?.columnaIndice).not.toBe(guiaEV06?.columnaIndice);
      expect(guiaEV07?.columnaIndice).toBe(1);
      expect(guiaEV06?.columnaIndice).toBe(2);
      expect(guiaEV08?.columnaIndice).toBe(2);
    });

    it('actualiza dinámicamente las columnas al cambiar de arquitectura en EV-06, EV-07 y EV-08', () => {
      // EV-06
      expect(obtenerGuiaVisualModelo('EV-06', 'unet')?.columnaIndice).toBe(2);
      expect(obtenerGuiaVisualModelo('EV-06', 'unet-cbam')?.columnaIndice).toBe(3);
      expect(obtenerGuiaVisualModelo('EV-06', 'modcbam')?.columnaIndice).toBe(4);
      expect(obtenerGuiaVisualModelo('EV-06', 'transunet')?.columnaIndice).toBe(5);

      // EV-07
      expect(obtenerGuiaVisualModelo('EV-07', 'unet')?.columnaIndice).toBe(1);
      expect(obtenerGuiaVisualModelo('EV-07', 'unet-cbam')?.columnaIndice).toBe(2);
      expect(obtenerGuiaVisualModelo('EV-07', 'modcbam')?.columnaIndice).toBe(3);
      expect(obtenerGuiaVisualModelo('EV-07', 'transunet')?.columnaIndice).toBe(4);

      // EV-08
      expect(obtenerGuiaVisualModelo('EV-08', 'unet')?.columnaIndice).toBe(2);
      expect(obtenerGuiaVisualModelo('EV-08', 'unet-cbam')?.columnaIndice).toBe(3);
      expect(obtenerGuiaVisualModelo('EV-08', 'modcbam')?.columnaIndice).toBe(4);
      expect(obtenerGuiaVisualModelo('EV-08', 'transunet')?.columnaIndice).toBe(5);
    });

    it('retorna null cuando la arquitectura es desconocida o no verificable en el servicio', () => {
      const guiaInvalida = obtenerGuiaVisualModelo('EV-06', 'arquitectura-inexistente');
      expect(guiaInvalida).toBeNull();
    });
  });

  describe('2. Rigor conceptual y etiquetas metodológicas', () => {
    it('EV-06: etiqueta como Vanilla Saliency, describe sensibilidad por gradientes y aclara ausencia de atención CBAM nativa', () => {
      const meta = obtenerEtiquetaConceptual('EV-06');
      expect(meta).not.toBeNull();
      expect(meta?.nombre).toBe('Vanilla Saliency');
      expect(meta?.descripcion).toBe(
        'Sensibilidad de la salida del modelo respecto a los píxeles de entrada mediante gradientes.'
      );
      expect(meta?.aclaracion).toContain('No representa atención CBAM nativa');
      expect(meta?.advertenciaNormalizacion).toBeDefined();
      expect(meta?.advertenciaNormalizacion).toContain(
        'Los mapas se normalizan independientemente por modelo y paciente'
      );
    });

    it('EV-07: etiqueta como Grad-CAM, describe activación convolucional y aclara obtención en down4 antes de Transformer', () => {
      const meta = obtenerEtiquetaConceptual('EV-07');
      expect(meta).not.toBeNull();
      expect(meta?.nombre).toBe('Grad-CAM');
      expect(meta?.descripcion).toBe('Activación convolucional ponderada por gradientes.');
      expect(meta?.aclaracion).toContain(
        'En TransUNet el mapa se obtiene de down4, antes del bloque Transformer; no representa directamente la autoatención del Transformer.'
      );
      expect(meta?.advertenciaNormalizacion).toBeDefined();
      expect(meta?.advertenciaNormalizacion).toContain(
        'Los mapas se normalizan independientemente por modelo y paciente'
      );
    });

    it('EV-08: etiqueta como Comparación visual, describe muestra compartida y aclara que no establece superioridad poblacional por sí sola', () => {
      const meta = obtenerEtiquetaConceptual('EV-08');
      expect(meta).not.toBeNull();
      expect(meta?.nombre).toBe('Comparación visual de segmentación y clasificación');
      expect(meta?.descripcion).toBe('Comparación cualitativa sobre muestras compartidas.');
      expect(meta?.aclaracion).toContain('No permite establecer superioridad poblacional por sí sola');
      expect(meta?.advertenciaNormalizacion).toBeUndefined();
    });

    it('no inventa etiquetas conceptuales para evidencias que no son de interpretabilidad cualitativa', () => {
      expect(obtenerEtiquetaConceptual('EV-01')).toBeNull();
      expect(obtenerEtiquetaConceptual('EV-02')).toBeNull();
      expect(obtenerEtiquetaConceptual('EV-03')).toBeNull();
    });
  });

  describe('3. Visor Modal (ModalVisorEvidencia)', () => {
    it('renderiza la barra de correspondencia de columnas con resaltado para EV-06 (U-Net = Col 2)', () => {
      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev06}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
          modeloActivoId="unet"
          nombreModeloActivo="U-Net"
        />
      );

      // Barra superior de columnas
      expect(html).toContain('data-testid="visor-indicador-columnas"');
      expect(html).toContain('Col 0: TAC');
      expect(html).toContain('Col 1: GT');
      expect(html).toContain('Col 2: U-Net');
      expect(html).toContain('Col 3: CBAM');
      expect(html).toContain('Col 4: ModCBAM');
      expect(html).toContain('Col 5: TransUNet');

      // Resaltado de la columna activa
      expect(html).toContain('data-testid="col-chip-2"');
      expect(html).toContain('chip-activo');
      expect(html).toContain('★ U-Net');

      // Referencias identificadas
      expect(html).toContain('chip-referencia');

      // Rigor conceptual en el sidebar
      expect(html).toContain('data-testid="visor-seccion-conceptual"');
      expect(html).toContain('Vanilla Saliency');
      expect(html).toContain('Sensibilidad de la salida del modelo respecto a los píxeles de entrada mediante gradientes.');
      expect(html).toContain('No representa atención CBAM nativa');

      // Advertencia de normalización cromática visible
      expect(html).toContain('data-testid="advertencia-normalizacion"');
      expect(html).toContain(
        'Los mapas se normalizan independientemente por modelo y paciente. La comparación permite examinar patrones espaciales de focalización, pero no interpretar las intensidades de color como magnitudes absolutas comparables entre arquitecturas'
      );
    });

    it('renderiza la barra de correspondencia para EV-07 resaltando Columna 1 para U-Net', () => {
      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev07}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
          modeloActivoId="unet"
          nombreModeloActivo="U-Net"
        />
      );

      expect(html).toContain('Col 0: TAC + GT');
      expect(html).toContain('Col 1: U-Net');
      expect(html).toContain('Col 2: CBAM');
      expect(html).toContain('Col 3: ModCBAM');
      expect(html).toContain('Col 4: TransUNet');

      // Columna 1 activa
      expect(html).toContain('data-testid="col-chip-1"');
      expect(html).toContain('Grad-CAM');
      expect(html).toContain('down4, antes del bloque Transformer');
      expect(html).toContain('data-testid="advertencia-normalizacion"');
    });

    it('renderiza la barra de correspondencia para EV-08 resaltando Columna 2 para U-Net y aclaración sin advertencia cromática', () => {
      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev08}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
          modeloActivoId="unet"
          nombreModeloActivo="U-Net"
        />
      );

      expect(html).toContain('Col 2: U-Net');
      expect(html).toContain('Comparación visual de segmentación y clasificación');
      expect(html).toContain('No permite establecer superioridad poblacional por sí sola');
      // No debe contener advertencia de normalización cromática en EV-08
      expect(html).not.toContain('data-testid="advertencia-normalizacion"');
    });

    it('actualiza el chip activo al cambiar de modelo a TransUNet en EV-06 (Col 5)', () => {
      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev06}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
          modeloActivoId="transunet"
          nombreModeloActivo="TransUNet"
        />
      );

      expect(html).toContain('Columna 5 (TransUNet)');
      expect(html).toContain('★ TransUNet');
    });

    it('muestra "Correspondencia no documentada" en el visor si el modelo no tiene correspondencia', () => {
      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev06}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
          modeloActivoId="modelo-desconocido"
          nombreModeloActivo="Modelo Desconocido"
        />
      );

      expect(html).toContain('Correspondencia no documentada');
      expect(html).toContain('data-testid="correspondencia-no-documentada"');
    });
  });

  describe('4. Tarjeta de Evidencia (TarjetaEvidencia)', () => {
    it('muestra la insignia conceptual de la técnica sin saturar la tarjeta', () => {
      const htmlEV06 = renderToString(
        <TarjetaEvidencia
          evidencia={ev06}
          modeloActivoId="unet"
          nombreModeloActivo="U-Net"
        />
      );

      expect(htmlEV06).toContain('badge-tecnica-conceptual');
      expect(htmlEV06).toContain('Vanilla Saliency');
      expect(htmlEV06).toContain('Columna 2 (U-Net)');

      const htmlEV07 = renderToString(
        <TarjetaEvidencia
          evidencia={ev07}
          modeloActivoId="unet"
          nombreModeloActivo="U-Net"
        />
      );

      expect(htmlEV07).toContain('badge-tecnica-conceptual');
      expect(htmlEV07).toContain('Grad-CAM');
      expect(htmlEV07).toContain('Columna 1 (U-Net)');
    });

    it('muestra "Correspondencia no documentada" en la tarjeta cuando el modelo no es reconocido', () => {
      const html = renderToString(
        <TarjetaEvidencia
          evidencia={ev06}
          modeloActivoId="desconocido"
          nombreModeloActivo="Desconocido"
        />
      );

      expect(html).toContain('Correspondencia no documentada');
      expect(html).toContain('data-testid="tarjeta-correspondencia-no-documentada"');
    });
  });
});
