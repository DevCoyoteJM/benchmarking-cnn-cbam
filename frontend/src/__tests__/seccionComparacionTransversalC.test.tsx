import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SeccionComparacionTransversalC from '../components/interpretacion/SeccionComparacionTransversalC';
import InterpretacionCientifica from '../pages/InterpretacionCientifica';

describe('Sección C: Comparación Transversal de Arquitecturas (FASE 4.7D)', () => {
  describe('1. Principio Metodológico: Ausencia de Ranking Global Arbitrario', () => {
    it('renderiza la advertencia de invalidez de ranking global y análisis de compromisos multidimensionales', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('data-testid="aviso-ausencia-ranking-global"');
      expect(html).toContain('Principio Epistemológico: Ausencia de Ranking Global Arbitrario');
      expect(html).toContain('Colapsar métricas de distinta naturaleza clínica');
      expect(html).toContain('análisis visual de compromisos multidimensionales');
    });
  });

  describe('2. Apartado C1 — Comparación de Rendimiento E1 y E2', () => {
    it('renderiza el contenedor C1 y los selectores de subetapa', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('data-testid="apartado-c1-rendimiento"');
      expect(html).toContain('Apartado C1');
      expect(html).toContain('Comparación de Rendimiento Experimental en E1 y E2');
      expect(html).toContain('data-testid="tab-c1-e1"');
      expect(html).toContain('data-testid="tab-c1-e2"');
    });

    it('por defecto despliega la tabla de E1 con las 4 arquitecturas y dirección óptima', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      // 4 arquitecturas propias
      expect(html).toContain('U-Net');
      expect(html).toContain('U-Net + CBAM');
      expect(html).toContain('ModCBAM');
      expect(html).toContain('TransUNet');

      // Métricas E1
      expect(html).toContain('Dice');
      expect(html).toContain('(↑ Mayor es mejor)');
      expect(html).toContain('HD95');
      expect(html).toContain('(↓ Menor es mejor)');
      expect(html).toContain('F1-det');

      // Valores exactos E1 (Celda 34)
      expect(html).toContain('0.873'); // U-Net Dice
      expect(html).toContain('1.57 mm'); // U-Net HD95 (Líder en contorno)
      expect(html).toContain('0.893'); // ModCBAM Dice (Líder en solapamiento)
      expect(html).toContain('1.72 mm'); // ModCBAM HD95
      expect(html).toContain('0.973'); // CBAM y ModCBAM F1-det
      expect(html).toContain('1.83 mm'); // TransUNet HD95
    });

    it('incluye notas de advertencia para no asumir significancia estadística sin pruebas formales', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('Ninguna diferencia porcentual debe asumirse como estadísticamente significativa');
    });
  });

  describe('3. Apartado C2 — Complejidad Computacional y Hardware', () => {
    it('muestra las especificaciones exactas del hardware verificado en el notebook', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('data-testid="apartado-c2-complejidad"');
      expect(html).toContain('NVIDIA GeForce RTX 5060 Ti');
      expect(html).toContain('Batch size = 1');
      expect(html).toContain('Float32');
      expect(html).toContain('140.5 FPS'); // U-Net
      expect(html).toContain('7.12 ms'); // U-Net
      expect(html).toContain('31.30 M'); // U-Net (o 31.3)
      expect(html).toContain('64.90 M'); // TransUNet (o 64.9)
    });

    it('reporta la memoria VRAM explícitamente como "No disponible" y nunca como 0', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('No disponible');
      expect(html).toContain('Consumo de Memoria VRAM');
      expect(html).toContain('No fue instrumentada formalmente en notebook');
      expect(html).toContain('torch.cuda.max_memory_allocated()');
      expect(html).not.toContain('0 MB');
      expect(html).not.toContain('0.0 MB');
    });

    it('evalúa la contextualización operativa respecto a la referencia de 30 FPS', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('≥ 30 FPS (Referencia operativa)');
      expect(html).toContain('Contextualización Operativa (Ref. 30 FPS)');
    });
  });

  describe('4. Apartado C3 — Análisis de Compromisos Multidimensionales (Trade-offs)', () => {
    it('renderiza los cuatro compromisos experimentales canónicos auditados', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('data-testid="apartado-c3-tradeoffs"');
      expect(html).toContain('data-testid="compromiso-TRADE-01"');
      expect(html).toContain('data-testid="compromiso-TRADE-02"');
      expect(html).toContain('data-testid="compromiso-TRADE-03"');
      expect(html).toContain('data-testid="compromiso-TRADE-04"');

      // Títulos de compromisos
      expect(html).toContain('Solapamiento de Área (Dice) vs Precisión Periférica de Contorno (HD95)');
      expect(html).toContain('Sensibilidad Oncológica (Minimizar FN) vs Especificidad (Minimizar FP)');
      expect(html).toContain('Complejidad Paramétrica vs Rendimiento en Prueba Ciega');
      expect(html).toContain('Velocidad de Inferencia (FPS / Latencia) vs Capacidad Representacional');
    });

    it('incluye visualizaciones del espacio de compromisos sin gráficos de radar artificiales', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('data-testid="visualizaciones-transversales"');
      expect(html).toContain('data-testid="tab-grafica-roc"');
      expect(html).toContain('data-testid="tab-grafica-params"');
      expect(html).toContain('data-testid="tab-grafica-latencia"');
      expect(html).toContain('data-testid="grafica-sens-vs-espec"');
      expect(html).not.toContain('radar');
    });
  });

  describe('5. Apartado C4 — Síntesis Crítica Individualizada por Arquitectura', () => {
    it('renderiza las cuatro tarjetas de síntesis con fortalezas, limitaciones y advertencias', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('data-testid="apartado-c4-sintesis"');
      expect(html).toContain('data-testid="sintesis-unet"');
      expect(html).toContain('data-testid="sintesis-unet-cbam"');
      expect(html).toContain('data-testid="sintesis-modcbam"');
      expect(html).toContain('data-testid="sintesis-transunet"');

      // Fortalezas y advertencias específicas
      expect(html).toContain('Menor distancia de Hausdorff al 95% (HD95 = 1.57 mm)'); // U-Net
      expect(html).toContain('Líder clínico en sensibilidad diagnóstica (76.2%'); // ModCBAM
      expect(html).toContain('ADV-02: La correlación observada entre parada a 48 épocas y baja sensibilidad'); // CBAM
      expect(html).toContain('ADV-07: La brecha de generalización en parches 2D concurre con la ausencia de sesgo inductivo'); // TransUNet
    });
  });

  describe('6. Segregación de Referencia Externa Bibliográfica 3D', () => {
    it('mantiene a Swin UNETR + KAN segregada de la comparación directa de los 4 modelos 2D', () => {
      const html = renderToString(<SeccionComparacionTransversalC />);

      expect(html).toContain('data-testid="referencia-externa-3d-transversal"');
      expect(html).toContain('Aviso de Segregación Metodológica');
      expect(html).toContain('Referencia bibliográfica externa 3D, no directamente comparable con el benchmark experimental 2D');
    });
  });

  describe('7. Integración en Página Principal (InterpretacionCientifica.tsx)', () => {
    it('incluye la pestaña de navegación para la Sección C', () => {
      const html = renderToString(<InterpretacionCientifica />);

      expect(html).toContain('data-testid="tab-seccion-c"');
      expect(html).toContain('Sección C: Comparación Transversal');
    });
  });
});
