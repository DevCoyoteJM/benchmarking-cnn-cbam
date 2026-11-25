import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VisualizacionCBAM from '../pages/VisualizacionCBAM';
import GaleriaEvidencias, { SUBSECCIONES_CONFIG } from '../components/GaleriaEvidencias';
import * as evidenciasService from '../services/evidenciasService';
import realIndiceJson from '../../public/evidencias/indice_recursos.json';
import type { IndiceRecursosVisualesJSON, RecursoVisualEvidencia } from '../types/evidencias';

const todosRecursos: RecursoVisualEvidencia[] = evidenciasService.procesarIndiceRecursos(
  realIndiceJson as IndiceRecursosVisualesJSON
);

describe('Módulo Independiente VisualizacionCBAM (Fase 4.5B)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Renderizado de la Página y Aviso Metodológico', () => {
    it('renderiza la cabecera, aviso epistemológico y selector de modelo de enfoque', () => {
      const html = renderToString(<VisualizacionCBAM />);

      // Título y eyebrow
      expect(html).toContain('Visualización CBAM');
      expect(html).toContain('EVALUACIÓN VISUAL &amp; ATENCIÓN · BENCHMARKING MULTIARQUITECTURA');

      // Aviso metodológico sobre no exclusividad de CBAM y técnicas post-hoc
      expect(html).toContain('Alcance Científico y No Exclusividad CBAM:');
      expect(html).toContain('no mecanismos de atención nativos exclusivos de CBAM');

      // Selector de modelo activo
      expect(html).toContain('Resaltar correspondencia para:');
      expect(html).toContain('U-Net');
      expect(html).toContain('U-Net + CBAM');
      expect(html).toContain('ModCBAM');
      expect(html).toContain('TransUNet');
    });
  });

  describe('Organización en 4 Subsecciones Temáticas', () => {
    it('verifica la configuración rigurosa de las 4 subsecciones A, B, C y D', () => {
      expect(SUBSECCIONES_CONFIG).toHaveLength(4);

      // Subsección A: Interpretabilidad (EV-06, EV-07)
      expect(SUBSECCIONES_CONFIG[0].letra).toBe('A');
      expect(SUBSECCIONES_CONFIG[0].titulo).toContain('Mapas de Atención e Interpretabilidad');
      expect(SUBSECCIONES_CONFIG[0].ids).toEqual(['EV-06', 'EV-07']);
      expect(SUBSECCIONES_CONFIG[0].descripcion).toContain('no módulos CBAM nativos');

      // Subsección B: Segmentación y Clasificación (EV-08)
      expect(SUBSECCIONES_CONFIG[1].letra).toBe('B');
      expect(SUBSECCIONES_CONFIG[1].titulo).toContain('Segmentación y Clasificación Visual Directa');
      expect(SUBSECCIONES_CONFIG[1].ids).toEqual(['EV-08']);

      // Subsección C: Rendimiento Experimental (EV-01, EV-02)
      expect(SUBSECCIONES_CONFIG[2].letra).toBe('C');
      expect(SUBSECCIONES_CONFIG[2].titulo).toContain('Rendimiento Experimental y Curvas de Aprendizaje');
      expect(SUBSECCIONES_CONFIG[2].ids).toEqual(['EV-01', 'EV-02']);

      // Subsección D: Evaluación Cuantitativa (EV-03, EV-04, EV-05)
      expect(SUBSECCIONES_CONFIG[3].letra).toBe('D');
      expect(SUBSECCIONES_CONFIG[3].titulo).toContain('Evaluación Cuantitativa y Concordancia');
      expect(SUBSECCIONES_CONFIG[3].ids).toEqual(['EV-03', 'EV-04', 'EV-05']);
    });

    it('renderiza las 4 subsecciones con sus títulos y descripciones en la galería organizada', () => {
      const html = renderToString(
        <GaleriaEvidencias
          modeloActivoId="unet-cbam"
          nombreModeloActivo="U-Net + CBAM"
          organizarPorSubsecciones={true}
          recursosIniciales={todosRecursos}
        />
      );

      // Cabeceras de subsección
      expect(html).toContain('Subsección A');
      expect(html).toContain('Mapas de Atención e Interpretabilidad');
      expect(html).toContain('Subsección B');
      expect(html).toContain('Segmentación y Clasificación Visual Directa');
      expect(html).toContain('Subsección C');
      expect(html).toContain('Rendimiento Experimental y Curvas de Aprendizaje');
      expect(html).toContain('Subsección D');
      expect(html).toContain('Evaluación Cuantitativa y Concordancia');
    });

    it('distribuye exactamente las ocho evidencias en sus subsecciones sin duplicados', () => {
      const todosIdsEnSubsecciones = SUBSECCIONES_CONFIG.flatMap((s) => s.ids);

      // Exactamente 8 recursos
      expect(todosIdsEnSubsecciones).toHaveLength(8);

      // Comprobar que contiene EV-01 a EV-08 sin omisiones
      for (let i = 1; i <= 8; i++) {
        expect(todosIdsEnSubsecciones).toContain(`EV-0${i}`);
      }

      // Comprobar unicidad absoluta (sin duplicados entre subsecciones)
      const unicos = new Set(todosIdsEnSubsecciones);
      expect(unicos.size).toBe(8);
    });
  });

  describe('Filtros Combinables Incluyendo Arquitectura', () => {
    it('permite filtrar evidencias por arquitectura mediante el servicio', () => {
      const soloUNet = evidenciasService.filtrarEvidenciasPorArquitectura(todosRecursos, 'unet');
      expect(soloUNet.length).toBeGreaterThan(0);

      const soloTransunet = evidenciasService.filtrarEvidenciasPorArquitectura(
        todosRecursos,
        'transunet'
      );
      expect(soloTransunet.length).toBeGreaterThan(0);

      const todas = evidenciasService.filtrarEvidenciasPorArquitectura(todosRecursos, 'todas');
      expect(todas).toHaveLength(8);
    });
  });
});
