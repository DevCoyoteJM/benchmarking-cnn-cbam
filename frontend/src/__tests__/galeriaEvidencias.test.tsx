import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TarjetaEvidencia from '../components/TarjetaEvidencia';
import GaleriaEvidencias from '../components/GaleriaEvidencias';
import * as evidenciasService from '../services/evidenciasService';
import realIndiceJson from '../../public/evidencias/indice_recursos.json';
import type { IndiceRecursosVisualesJSON, RecursoVisualEvidencia } from '../types/evidencias';

const mockRecursos: RecursoVisualEvidencia[] = evidenciasService.procesarIndiceRecursos(
  realIndiceJson as IndiceRecursosVisualesJSON
);

describe('Componente TarjetaEvidencia y GaleriaEvidencias (Fase 4.3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('TarjetaEvidencia (renderizado estático)', () => {
    it('renderiza correctamente los metadatos de una tarjeta de evidencia', () => {
      const ev03 = mockRecursos.find((r) => r.id === 'EV-03')!;

      const html = renderToString(
        <TarjetaEvidencia
          evidencia={ev03}
          modeloActivoId="unet-v1"
          nombreModeloActivo="U-Net"
        />
      );

      // Identificador y título
      expect(html).toContain('EV-03');
      expect(html).toContain(ev03.titulo);

      // Badges semánticos
      expect(html).toContain('Comparativa multiarquitectura');
      expect(html).toContain('Compartida (4 modelos)');
      expect(html).toContain('Prueba Independiente');
      expect(html).toContain('Etapa E2');

      // Enfoque del modelo activo
      expect(html).toContain('Correspondencia para U-Net:');
      expect(html).toContain('Columna 1 (Subplot 1)');

      // Imagen con ruta resuelta y dimensiones
      expect(html).toContain(`src="${ev03.rutaResuelta}"`);
      expect(html).toContain('1989 × 440 px');
    });

    it('adapta la correspondencia visual cuando el modelo activo es ModCBAM', () => {
      const ev03 = mockRecursos.find((r) => r.id === 'EV-03')!;

      const html = renderToString(
        <TarjetaEvidencia
          evidencia={ev03}
          modeloActivoId="modcbam-v1"
          nombreModeloActivo="Modified CBAM"
        />
      );

      expect(html).toContain('Correspondencia para Modified CBAM:');
      expect(html).toContain('Columna 3 (Subplot 3)');
    });

    it('adapta la correspondencia para EV-01 con color de trazado para CBAM y TransUNet', () => {
      const ev01 = mockRecursos.find((r) => r.id === 'EV-01')!;

      const htmlCBAM = renderToString(
        <TarjetaEvidencia
          evidencia={ev01}
          modeloActivoId="unet-cbam-v1"
          nombreModeloActivo="U-Net + CBAM"
        />
      );
      expect(htmlCBAM).toContain('Trazado Naranja (#ff7f0e)');

      const htmlTransUNet = renderToString(
        <TarjetaEvidencia
          evidencia={ev01}
          modeloActivoId="transunet-v1"
          nombreModeloActivo="TransUNet"
        />
      );
      expect(htmlTransUNet).toContain('Trazado Rojo (#d62728)');
    });

    it('muestra notas metodológicas auditadas cuando el recurso las incluye', () => {
      const ev03 = mockRecursos.find((r) => r.id === 'EV-03')!;
      const html = renderToString(<TarjetaEvidencia evidencia={ev03} />);

      expect(html).toContain('Notas metodológicas verificadas:');
      expect(html).toContain('Excluye nódulos indeterminados (clase 3 LIDC-IDRI)');
      expect(html).toContain('Umbral fijo de decisión de 0.5');
    });
  });

  describe('GaleriaEvidencias (renderizado estático y estructura)', () => {
    it('renderiza la cabecera, aviso de benchmarking comparativo y filtros', () => {
      const html = renderToString(
        <GaleriaEvidencias modeloActivoId="unet-v1" nombreModeloActivo="U-Net" />
      );

      expect(html).toContain('Galería Visual de Evidencias Experimentales');
      expect(html).toContain('Aviso de Benchmarking Comparativo:');
      expect(html).toContain('Filtrar por Etapa:');
      expect(html).toContain('Área Temática / Categoría:');
      expect(html).toContain('Todas las etapas');
      expect(html).toContain('Etapa 1 (Segmentación)');
      expect(html).toContain('Etapa 2 (Clasificación)');
      expect(html).toContain('Etapa Mixta (E1 + E2)');
      expect(html).toContain('Métricas &amp; Evaluación (5)');
      expect(html).toContain('Interpretabilidad / Atención (2)');
      expect(html).toContain('Comparaciones Clínicas (1)');
    });
  });

  describe('Lógica de Filtrado Combinable en la Galería', () => {
    it('filtra por etapa y categoría de forma combinada', () => {
      // Caso 1: E2 + Métricas -> EV-02, EV-03, EV-04
      const porEtapaE2 = evidenciasService.filtrarEvidenciasPorEtapa(mockRecursos, 'E2');
      const e2YMetricas = evidenciasService.filtrarEvidenciasPorCategoria(porEtapaE2, 'metricas');

      expect(e2YMetricas).toHaveLength(3);
      expect(e2YMetricas.map((r) => r.id).sort()).toEqual(['EV-02', 'EV-03', 'EV-04'].sort());

      // Caso 2: E1 + Métricas -> EV-01, EV-05
      const porEtapaE1 = evidenciasService.filtrarEvidenciasPorEtapa(mockRecursos, 'E1');
      const e1YMetricas = evidenciasService.filtrarEvidenciasPorCategoria(porEtapaE1, 'metricas');

      expect(e1YMetricas).toHaveLength(2);
      expect(e1YMetricas.map((r) => r.id).sort()).toEqual(['EV-01', 'EV-05'].sort());

      // Caso 3: E2 + Interpretabilidad -> EV-06, EV-07
      const e2YAtencion = evidenciasService.filtrarEvidenciasPorCategoria(porEtapaE2, 'atencion');
      expect(e2YAtencion).toHaveLength(2);
      expect(e2YAtencion.map((r) => r.id).sort()).toEqual(['EV-06', 'EV-07'].sort());

      // Caso 4: E1 + Interpretabilidad -> Vacio (0 resultados)
      const e1YAtencion = evidenciasService.filtrarEvidenciasPorCategoria(porEtapaE1, 'atencion');
      expect(e1YAtencion).toHaveLength(0);

      // Caso 5: E1 + E2 + Comparaciones -> EV-08
      const mixta = evidenciasService.filtrarEvidenciasPorEtapa(mockRecursos, 'E1 + E2');
      const mixtaYComp = evidenciasService.filtrarEvidenciasPorCategoria(mixta, 'comparaciones');
      expect(mixtaYComp).toHaveLength(1);
      expect(mixtaYComp[0].id).toBe('EV-08');
    });

    it('permite restablecer filtros restaurando las ocho evidencias', () => {
      let etapa: 'todas' | 'E1' | 'E2' = 'E1';
      let categoria: 'todas' | 'atencion' = 'atencion';

      // Filtrado restrictivo
      let filtrados = evidenciasService.filtrarEvidenciasPorCategoria(
        evidenciasService.filtrarEvidenciasPorEtapa(mockRecursos, etapa),
        categoria
      );
      expect(filtrados).toHaveLength(0);

      // Restablecimiento
      etapa = 'todas';
      categoria = 'todas';
      filtrados = evidenciasService.filtrarEvidenciasPorCategoria(
        evidenciasService.filtrarEvidenciasPorEtapa(mockRecursos, etapa),
        categoria
      );
      expect(filtrados).toHaveLength(8);
    });
  });

  describe('Guías Visuales Documentadas por Arquitectura', () => {
    it('obtiene la correspondencia para los cuatro modelos en los ocho recursos', () => {
      const modelos = ['UNet', 'CBAM', 'ModCBAM', 'TransUNet'];

      for (let i = 1; i <= 8; i++) {
        const id = `EV-0${i}`;
        for (const m of modelos) {
          const guia = evidenciasService.obtenerGuiaVisualModelo(id, m);
          expect(guia).toBeDefined();
          expect(guia?.posicion).toBeTruthy();
          expect(guia?.detalle).toBeTruthy();
        }
      }
    });

    it('retorna null ante modelos o recursos no documentados', () => {
      expect(evidenciasService.obtenerGuiaVisualModelo('EV-99', 'UNet')).toBeNull();
      expect(evidenciasService.obtenerGuiaVisualModelo('EV-01', 'InceptionV3')).toBeNull();
      expect(evidenciasService.obtenerGuiaVisualModelo('', '')).toBeNull();
    });
  });
});
