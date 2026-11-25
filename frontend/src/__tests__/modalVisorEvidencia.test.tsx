import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModalVisorEvidencia from '../components/ModalVisorEvidencia';
import TarjetaEvidencia from '../components/TarjetaEvidencia';
import * as evidenciasService from '../services/evidenciasService';
import realIndiceJson from '../../public/evidencias/indice_recursos.json';
import type { IndiceRecursosVisualesJSON, RecursoVisualEvidencia } from '../types/evidencias';

const todosRecursos: RecursoVisualEvidencia[] = evidenciasService.procesarIndiceRecursos(
  realIndiceJson as IndiceRecursosVisualesJSON
);

describe('Componente ModalVisorEvidencia (Fase 4.4)', () => {
  const dummyOnCerrar = vi.fn();
  const dummyOnCambiar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado de Metadatos Científicos y Alta Resolución', () => {
    it('renderiza la imagen científica utilizando exactamente el PNG original de public/evidencias/', () => {
      const ev04 = todosRecursos.find((r) => r.id === 'EV-04')!;

      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev04}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
          modeloActivoId="unet-v1"
          nombreModeloActivo="U-Net"
        />
      );

      // Verificación de imagen original sin Base64
      expect(html).toContain(`src="${ev04.rutaResuelta}"`);
      expect(html).not.toContain('data:image/');
      expect(html).toContain('curvas_roc_clasificacion_malignidad.png');

      // Modal accesible
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('EV-04');
      expect(html).toContain(ev04.titulo);
    });

    it('exhibe las dimensiones nativas, peso de archivo y celda de origen sin distorsión', () => {
      const ev05 = todosRecursos.find((r) => r.id === 'EV-05')!; // Panorámica 2390x490

      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev05}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      // Metadatos técnicos exactos
      expect(html).toContain('2390 × 490 px');
      expect(html).toContain('153.0 KB');
      expect(html).toContain('Celda 40 (Salida #0)');
      expect(html).toContain('PNG (RGBA)');
    });

    it('distingue rigurosamente entre conjunto de validación y prueba independiente', () => {
      const ev01Validacion = todosRecursos.find((r) => r.id === 'EV-01')!;
      const ev03Prueba = todosRecursos.find((r) => r.id === 'EV-03')!;

      const htmlVal = renderToString(
        <ModalVisorEvidencia
          evidencia={ev01Validacion}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      const htmlTest = renderToString(
        <ModalVisorEvidencia
          evidencia={ev03Prueba}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      expect(htmlVal).toContain('Validación Interna (Tuning de hiperparámetros)');
      expect(htmlTest).toContain('Prueba Independiente (Blind Test)');
    });

    it('muestra las notas metodológicas verificadas y el resumen muestral', () => {
      const ev08 = todosRecursos.find((r) => r.id === 'EV-08')!;

      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev08}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      // Resumen de muestra
      expect(html).toContain('Prueba independiente E1 + E2, 4 pacientes');

      // Notas metodológicas
      expect(html).toContain('Notas Metodológicas Verificadas');
      expect(html).toContain('Comparativa clínica simultánea en 4 pacientes del conjunto de prueba.');
    });

    it('adapta la correspondencia para la arquitectura activa en el visor', () => {
      const ev04 = todosRecursos.find((r) => r.id === 'EV-04')!;

      const htmlModcbam = renderToString(
        <ModalVisorEvidencia
          evidencia={ev04}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
          modeloActivoId="modcbam-v1"
          nombreModeloActivo="ModCBAM"
        />
      );

      expect(htmlModcbam).toContain('Correspondencia para ModCBAM:');
      expect(htmlModcbam).toContain('Curva Verde (AUC = 0.900)');
      expect(htmlModcbam).toContain('#2ca02c');
    });
  });

  describe('Navegación e Indicadores de Subconjuntos Filtrados', () => {
    it('muestra la posición contextual en la lista completa (ej. Recurso 3 de 8)', () => {
      const ev03 = todosRecursos.find((r) => r.id === 'EV-03')!;

      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev03}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      expect(html).toContain('Recurso 3 de 8');
      expect(html).toContain('aria-label="Evidencia anterior"');
      expect(html).toContain('aria-label="Evidencia siguiente"');
    });

    it('respeta la navegación dentro de un subconjunto filtrado de evidencias', () => {
      // Supongamos que el usuario filtró por "atencion" (EV-06 y EV-07)
      const subsetAtencion = todosRecursos.filter((r) => r.categoriaPrincipal === 'atencion');
      expect(subsetAtencion.length).toBe(2);

      const primerRecurso = subsetAtencion[0]; // EV-06
      const htmlPrimero = renderToString(
        <ModalVisorEvidencia
          evidencia={primerRecurso}
          evidenciasLista={subsetAtencion}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      // En el primero del subconjunto: 1 de 2, NO hay botón anterior, SI hay botón siguiente
      expect(htmlPrimero).toContain('Recurso 1 de 2');
      expect(htmlPrimero).not.toContain('aria-label="Evidencia anterior"');
      expect(htmlPrimero).toContain('aria-label="Evidencia siguiente"');

      const segundoRecurso = subsetAtencion[1]; // EV-07
      const htmlSegundo = renderToString(
        <ModalVisorEvidencia
          evidencia={segundoRecurso}
          evidenciasLista={subsetAtencion}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      // En el segundo del subconjunto: 2 de 2, SI hay botón anterior, NO hay botón siguiente
      expect(htmlSegundo).toContain('Recurso 2 de 2');
      expect(htmlSegundo).toContain('aria-label="Evidencia anterior"');
      expect(htmlSegundo).not.toContain('aria-label="Evidencia siguiente"');
    });
  });

  describe('Controles de Zoom, Escala y Accesibilidad', () => {
    it('incluye los controles de zoom (In, Out, Ajustar, 100%) y pantalla completa', () => {
      const ev01 = todosRecursos[0];

      const html = renderToString(
        <ModalVisorEvidencia
          evidencia={ev01}
          evidenciasLista={todosRecursos}
          onCerrar={dummyOnCerrar}
          onCambiarEvidencia={dummyOnCambiar}
        />
      );

      expect(html).toContain('aria-label="Aumentar zoom"');
      expect(html).toContain('aria-label="Reducir zoom"');
      expect(html).toContain('aria-label="Ajustar al contenedor"');
      expect(html).toContain('aria-label="Escala original 100%"');
      expect(html).toContain('aria-label="Pantalla completa"');
      expect(html).toContain('aria-label="Cerrar visor"');
    });

    it('la tarjeta de evidencia expone acción accesible para invocar el visor', () => {
      const ev02 = todosRecursos.find((r) => r.id === 'EV-02')!;
      const mockAbrir = vi.fn();

      const htmlTarjeta = renderToString(
        <TarjetaEvidencia
          evidencia={ev02}
          onAbrirVisor={mockAbrir}
        />
      );

      expect(htmlTarjeta).toContain('aria-label="Examinar EV-02 en alta resolución"');
      expect(htmlTarjeta).toContain('Examinar en alta resolución');
      expect(htmlTarjeta).toContain('role="button"');
    });
  });
});
