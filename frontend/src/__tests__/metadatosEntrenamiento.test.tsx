import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModalVisorEvidencia from '../components/ModalVisorEvidencia';
import GaleriaEvidencias from '../components/GaleriaEvidencias';
import * as evidenciasService from '../services/evidenciasService';
import realIndiceJson from '../../public/evidencias/indice_recursos.json';
import type {
  IndiceRecursosVisualesJSON,
  RecursoVisualEvidencia,
  RecursoVisualJSON,
} from '../types/evidencias';

const todosRecursos: RecursoVisualEvidencia[] = evidenciasService.procesarIndiceRecursos(
  realIndiceJson as IndiceRecursosVisualesJSON
);

describe('FASE 4.5D — Precisión de Metadatos y Documentación de Épocas de Entrenamiento', () => {
  const dummyOnCerrar = vi.fn();
  const dummyOnCambiar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Valores Correctos de Épocas E1 y E2 en el Modelo de Datos', () => {
    it('valida las épocas efectivas correctas de Etapa 1 para cada arquitectura en EV-01', () => {
      const ev01 = todosRecursos.find((r) => r.id === 'EV-01');
      expect(ev01).toBeDefined();
      expect(ev01?.metadatosEntrenamiento).toBeDefined();

      const metaE1 = ev01!.metadatosEntrenamiento!;
      expect(metaE1.etapa).toBe('E1');

      const arqs = metaE1.arquitecturas;
      expect(arqs).toHaveLength(4);

      const unet = arqs.find((a) => a.arquitectura === 'UNet');
      const cbam = arqs.find((a) => a.arquitectura === 'CBAM');
      const modcbam = arqs.find((a) => a.arquitectura === 'ModCBAM');
      const transunet = arqs.find((a) => a.arquitectura === 'TransUNet');

      expect(unet?.epocasEfectivas).toBe(80);
      expect(cbam?.epocasEfectivas).toBe(48);
      expect(modcbam?.epocasEfectivas).toBe(75);
      expect(transunet?.epocasEfectivas).toBe(106);
    });

    it('valida que las 4 arquitecturas completaron con exactitud 100 épocas en Etapa 2 (EV-02)', () => {
      const ev02 = todosRecursos.find((r) => r.id === 'EV-02');
      expect(ev02).toBeDefined();
      expect(ev02?.metadatosEntrenamiento).toBeDefined();

      const metaE2 = ev02!.metadatosEntrenamiento!;
      expect(metaE2.etapa).toBe('E2');
      expect(metaE2.epocasMaximasConfiguradas).toBe(100);

      const arqs = metaE2.arquitecturas;
      expect(arqs).toHaveLength(4);

      arqs.forEach((a) => {
        expect(a.epocasEfectivas).toBe(100);
        expect(a.epocasMaximasConfiguradas).toBe(100);
      });
    });
  });

  describe('2. Separación entre Máximo Configurado y Épocas Efectivas', () => {
    it('documenta el tope de 150 épocas con paciencia 25 por Dice de validación en E1', () => {
      const ev01 = todosRecursos.find((r) => r.id === 'EV-01')!;
      const metaE1 = ev01.metadatosEntrenamiento!;

      expect(metaE1.epocasMaximasConfiguradas).toBe(150);
      expect(metaE1.pacienciaGeneral).toBe(25);
      expect(metaE1.criterioParadaGeneral).toContain('Early Stopping');
      expect(metaE1.criterioParadaGeneral).toContain('Dice');

      // Ningún modelo en E1 alcanzó las 150 épocas
      metaE1.arquitecturas.forEach((a) => {
        expect(a.epocasMaximasConfiguradas).toBe(150);
        expect(a.epocasEfectivas).toBeLessThan(150);
      });
    });

    it('documenta que en E2 las épocas efectivas coinciden con el tope configurado de 100', () => {
      const ev02 = todosRecursos.find((r) => r.id === 'EV-02')!;
      const metaE2 = ev02.metadatosEntrenamiento!;

      expect(metaE2.epocasMaximasConfiguradas).toBe(100);
      expect(metaE2.pacienciaGeneral).toBe(50);

      metaE2.arquitecturas.forEach((a) => {
        expect(a.epocasEfectivas).toBe(a.epocasMaximasConfiguradas);
      });
    });
  });

  describe('3. Visualización Contextual en EV-01 y EV-02 en el Visor y Galería', () => {
    it('renderiza la sección de dinámica de épocas en EV-01 con aviso contextual de notebook', () => {
      const ev01 = todosRecursos.find((r) => r.id === 'EV-01')!;

      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev01}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      expect(html).toContain('data-testid="visor-seccion-entrenamiento"');
      expect(html).toContain('Dinámica de Épocas (E1)');
      expect(html).toContain('150 épocas');
      expect(html).toContain('80');
      expect(html).toContain('48');
      expect(html).toContain('75');
      expect(html).toContain('106');
      expect(html).toContain(
        'Contexto metodológico del notebook original. No corresponde a una medición directa sobre la imagen.'
      );
    });

    it('renderiza la sección de dinámica de épocas en EV-02 con 100 épocas en las 4 arquitecturas', () => {
      const ev02 = todosRecursos.find((r) => r.id === 'EV-02')!;

      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev02}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      expect(html).toContain('data-testid="visor-seccion-entrenamiento"');
      expect(html).toContain('Dinámica de Épocas (E2)');
      expect(html).toContain('100 épocas');
      expect(html).toContain(
        'Contexto metodológico del notebook original. No corresponde a una medición directa sobre la imagen.'
      );
    });

    it('renderiza el callout estructurado de épocas en Subsección C de la galería', () => {
      const html = renderToString(
        <GaleriaEvidencias
          recursosIniciales={todosRecursos}
          organizarPorSubsecciones={true}
        />
      );

      expect(html).toContain('data-testid="callout-epocas-subseccion-c"');
      expect(html).toContain('Etapa 1 — Segmentación');
      expect(html).toContain('Etapa 2 — Clasificación');
      expect(html).toContain('80 épocas efectivas');
      expect(html).toContain('48 épocas efectivas');
      expect(html).toContain('75 épocas efectivas');
      expect(html).toContain('106 épocas efectivas');
      expect(html).toContain(
        'Las épocas efectivas de E1 dependen de la parada temprana según el Dice de validación'
      );
    });
  });

  describe('4. Ausencia de Información Artificial en Otras Evidencias', () => {
    it('garantiza que EV-03 a EV-08 carecen de metadatos de entrenamiento artificiales', () => {
      const noEntrenamientoIds = ['EV-03', 'EV-04', 'EV-05', 'EV-06', 'EV-07', 'EV-08'];

      noEntrenamientoIds.forEach((id) => {
        const ev = todosRecursos.find((r) => r.id === id);
        expect(ev).toBeDefined();
        expect(ev?.metadatosEntrenamiento).toBeUndefined();
      });
    });

    it('no renderiza la sección de entrenamiento en el modal para EV-03, EV-04 ni EV-05', () => {
      ['EV-03', 'EV-04', 'EV-05'].forEach((id) => {
        const ev = todosRecursos.find((r) => r.id === id)!;
        const html = renderToString(
          <ModalVisorEvidencia
            evidencia={ev}
            evidenciasLista={todosRecursos}
            onCerrar={dummyOnCerrar}
            onCambiarEvidencia={dummyOnCambiar}
          />
        );

        expect(html).not.toContain('data-testid="visor-seccion-entrenamiento"');
        expect(html).not.toContain('Dinámica de Épocas');
      });
    });
  });

  describe('5. Compatibilidad con Metadatos Antiguos / Heredados', () => {
    it('normaliza de forma segura un recurso antiguo que no contiene metadatos_entrenamiento', () => {
      const recursoAntiguoSinMetadatos: RecursoVisualJSON = {
        id: 'EV-04',
        nombre_archivo: 'curvas_roc_clasificacion_malignidad.png',
        categoria_principal: 'metricas',
        subcategorias_visibles: ['metricas'],
        tipo_recurso: 'Curvas ROC',
        celda_origen: 38,
        indice_salida: 0,
        etapa: 'E2',
        arquitecturas_asociadas: ['UNet', 'CBAM', 'ModCBAM', 'TransUNet'],
        formato_original: 'PNG',
        modo_color: 'RGBA',
        dimensiones: { ancho: 706, alto: 707 },
        tamano_bytes: 79680,
        sha256: '46672271f3ba1aa195c5e8e9b2bae881f59f77ea8959517db12e92c32c3ada76',
        titulo: 'Curvas ROC',
        descripcion: 'Curvas ROC',
        ruta_relativa_public: '/evidencias/curvas_roc.png',
        ruta_relativa_directa: '/evidencias/curvas_roc.png',
      };

      const normalizado = evidenciasService.normalizarRecursoVisual(recursoAntiguoSinMetadatos);
      expect(normalizado.id).toBe('EV-04');
      expect(normalizado.metadatosEntrenamiento).toBeUndefined();
    });

    it('asigna metadatos auditados por defecto si EV-01 proviene de un JSON heredado sin el campo', () => {
      const ev01Heredado: RecursoVisualJSON = {
        id: 'EV-01',
        nombre_archivo: 'curvas_aprendizaje_e1_segmentacion.png',
        categoria_principal: 'metricas',
        subcategorias_visibles: ['metricas'],
        tipo_recurso: 'Gráfica E1',
        celda_origen: 32,
        indice_salida: 0,
        etapa: 'E1',
        arquitecturas_asociadas: ['UNet', 'CBAM', 'ModCBAM', 'TransUNet'],
        formato_original: 'PNG',
        modo_color: 'RGBA',
        dimensiones: { ancho: 1390, alto: 495 },
        tamano_bytes: 116050,
        sha256: '774f4563e7ccc06cabdd44dc3956daf667e83a2fc5372cbf1e8d82bb2950eab7',
        titulo: 'Evolución E1',
        descripcion: 'Evolución E1',
        ruta_relativa_public: '/evidencias/curvas_e1.png',
        ruta_relativa_directa: '/evidencias/curvas_e1.png',
      };

      const normalizado = evidenciasService.normalizarRecursoVisual(ev01Heredado);
      expect(normalizado.id).toBe('EV-01');
      expect(normalizado.metadatosEntrenamiento).toBeDefined();
      expect(normalizado.metadatosEntrenamiento?.epocasMaximasConfiguradas).toBe(150);
      expect(normalizado.metadatosEntrenamiento?.arquitecturas.find((a) => a.arquitectura === 'CBAM')?.epocasEfectivas).toBe(48);
    });

    it('validarIndiceRecursos valida con éxito tanto índices con como sin metadatos_entrenamiento', () => {
      const validacion = evidenciasService.validarIndiceRecursos(realIndiceJson);
      expect(validacion.esValido).toBe(true);
      expect(validacion.errores).toHaveLength(0);
    });
  });
});
