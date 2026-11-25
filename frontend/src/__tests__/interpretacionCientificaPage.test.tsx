import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import InterpretacionCientifica from '../pages/InterpretacionCientifica';
import SeccionSegmentacionE1 from '../components/interpretacion/SeccionSegmentacionE1';
import SeccionClasificacionE2 from '../components/interpretacion/SeccionClasificacionE2';
import TarjetaMetricaInterpretacion from '../components/interpretacion/TarjetaMetricaInterpretacion';
import BadgeProcedencia from '../components/interpretacion/BadgeProcedencia';
import AvisoCientifico from '../components/interpretacion/AvisoCientifico';

describe('Página e Interfaz de Interpretación Científica', () => {
  describe('1. Página Principal (InterpretacionCientifica.tsx)', () => {
    it('renderiza la cabecera principal, resumen introductorio y pestañas de navegación', () => {
      const html = renderToString(<InterpretacionCientifica />);

      // Título y eyebrow
      expect(html).toContain('Interpretación Científica');
      expect(html).toContain('SÍNTESIS CIENTÍFICA &amp; BENCHMARKING RIGUROSO · LIDC-IDRI');

      // Resumen introductorio de las dos etapas
      expect(html).toContain('Etapa 1: Segmentación y Detección (E1)');
      expect(html).toContain('Etapa 2: Clasificación de Malignidad (E2)');
      expect(html).toContain('762 parches 2D (96×96)');
      expect(html).toContain('213 nódulos (150B / 63M)');

      // Pestañas
      expect(html).toContain('Sección A: Segmentación (E1)');
      expect(html).toContain('Sección B: Clasificación (E2)');
      expect(html).toContain('Sección C: Comparación Transversal');
      expect(html).toContain('Sección D: Convergencia y Dinámica');
      expect(html).toContain('Secciones E a H: Análisis Avanzado');
      expect(html).toContain('Próximamente');

      // Por defecto la sección activa inicial es Sección A
      expect(html).toContain('seccion-segmentacion-e1');
    });
  });

  describe('2. Sección A — Resultados de Segmentación E1', () => {
    it('renderiza el contexto muestral de 762 parches axiales 2D independientes', () => {
      const html = renderToString(<SeccionSegmentacionE1 />);

      expect(html).toContain('762 parches axiales 2D');
      expect(html).toContain('Semilla 42');
      expect(html).toContain('consenso ≥ 50%');
      expect(html).toContain('corte axial central z de 96×96 píxeles');
    });

    it('renderiza las cuatro arquitecturas 2D y la referencia 3D con sus valores reales', () => {
      const html = renderToString(<SeccionSegmentacionE1 />);

      // Nombres de arquitecturas
      expect(html).toContain('U-Net');
      expect(html).toContain('U-Net + CBAM');
      expect(html).toContain('ModCBAM');
      expect(html).toContain('TransUNet');
      expect(html).toContain('Swin UNETR + KAN');

      // Valores exactos de Dice en prueba independiente (Celda 34)
      expect(html).toContain('0.873'); // U-Net
      expect(html).toContain('0.881'); // CBAM
      expect(html).toContain('0.893'); // ModCBAM
      expect(html).toContain('0.882'); // TransUNet y Ref 3D

      // Valores exactos de HD95 en mm
      expect(html).toContain('1.57 mm'); // U-Net (Líder)
      expect(html).toContain('1.72 mm'); // ModCBAM
      expect(html).toContain('1.76 mm'); // CBAM
      expect(html).toContain('1.83 mm'); // TransUNet

      // Valores exactos de F1-det
      expect(html).toContain('0.937'); // U-Net
      expect(html).toContain('0.973'); // CBAM y ModCBAM
      expect(html).toContain('0.968'); // TransUNet
    });

    it('destaca adecuadamente a los líderes multi-criterio sin inventar un ganador global', () => {
      const html = renderToString(<SeccionSegmentacionE1 />);

      // ModCBAM destacado en Dice e IoU
      expect(html).toContain('Máximo Solapamiento 2D');
      expect(html).toContain('Mayor Área de Solapamiento');

      // U-Net destacada en HD95 (contorno)
      expect(html).toContain('Menor Distancia de Frontera (Más Favorable)');

      // ModCBAM y CBAM destacados en Detección F1
      expect(html).toContain('Alta Sensibilidad Periférica');
    });

    it('segrega la referencia 3D externa de la tabla principal con advertencia de no comparabilidad', () => {
      const html = renderToString(<SeccionSegmentacionE1 />);

      expect(html).toContain('data-testid="referencia-externa-3d-e1"');
      expect(html).toContain('Aviso de Falta de Comparabilidad Directa');
      expect(html).toContain('Referencia Externa Bibliográfica (Tesis 3D — Swin UNETR + KAN)');
    });

    it('muestra la advertencia metodológica ADV-01 sobre la parada temprana en E1', () => {
      const html = renderToString(<SeccionSegmentacionE1 />);

      expect(html).toContain('ADV-01');
      expect(html).toContain('Disparidad de épocas efectivas en Etapa 1 por Early Stopping');
      expect(html).toContain('U-Net (80), CBAM (48), ModCBAM (75) y TransUNet (106)');
    });

    it('separa el bloque de interpretación cualitativa de los números', () => {
      const html = renderToString(<SeccionSegmentacionE1 />);

      expect(html).toContain('Síntesis e Interpretación Científica de la Etapa 1');
      expect(html).toContain('1. Solapamiento Volumétrico y Detección Fina');
      expect(html).toContain('2. Precisión Periférica y Regularidad de Contorno (HD95)');
    });
  });

  describe('3. Sección B — Resultados de Clasificación E2 y Matrices de Confusión', () => {
    it('muestra el contexto muestral real de 213 nódulos patológicos (150 Benignos / 63 Malignos)', () => {
      const html = renderToString(<SeccionClasificacionE2 />);

      expect(html).toContain('213 nódulos 2D patológicos');
      expect(html).toContain('150 benignos (70.42%)');
      expect(html).toContain('63 malignos (29.58%)');
      expect(html).toContain('Encoder Congelado · 100 Épocas Efectivas');
    });

    it('renderiza la tabla comparativa de E2 con Sensibilidad, Especificidad, AUC y MCC', () => {
      const html = renderToString(<SeccionClasificacionE2 />);

      // Sensibilidad (Recall Maligno)
      expect(html).toContain('0.762'); // ModCBAM (Líder en sensibilidad)
      expect(html).toContain('0.730'); // U-Net
      expect(html).toContain('0.651'); // TransUNet
      expect(html).toContain('0.587'); // CBAM

      // Especificidad (Benigno)
      expect(html).toContain('0.947'); // U-Net (Líder en especificidad)
      expect(html).toContain('0.927'); // CBAM y ModCBAM
      expect(html).toContain('0.933'); // TransUNet

      // AUC-ROC
      expect(html).toContain('0.914'); // U-Net (Líder)
      expect(html).toContain('0.900'); // ModCBAM
      expect(html).toContain('0.896'); // CBAM
      expect(html).toContain('0.809'); // TransUNet

      // MCC
      expect(html).toContain('0.710'); // U-Net (Líder)
      expect(html).toContain('0.702'); // ModCBAM
      expect(html).toContain('0.625'); // TransUNet
      expect(html).toContain('0.561'); // CBAM
    });

    it('renderiza el bloque de matrices de confusión con el impacto clínico en pacientes', () => {
      const html = renderToString(<SeccionClasificacionE2 />);

      expect(html).toContain('Desglose de Matrices de Confusión (N=213 Nódulos)');
      expect(html).toContain('Predicción Benigno');
      expect(html).toContain('Predicción Maligno');
      expect(html).toContain('GT Benigno (150)');
      expect(html).toContain('GT Maligno (63)');
      expect(html).toContain('VN');
      expect(html).toContain('FP');
      expect(html).toContain('FN (Riesgo)');
      expect(html).toContain('VP');
    });

    it('no utiliza la expresión causal o imprecisa "pacientes rescatados" para nódulos', () => {
      const html = renderToString(<SeccionClasificacionE2 />);

      expect(html).not.toContain('pacientes rescatados');
      expect(html).not.toContain('rescatando');
      expect(html).toContain('identificando correctamente 11 nódulos malignos adicionales');
    });

    it('segrega la referencia 3D en E2 con advertencia de no comparabilidad', () => {
      const html = renderToString(<SeccionClasificacionE2 />);

      expect(html).toContain('data-testid="referencia-externa-3d-e2"');
      expect(html).toContain('Aviso de Falta de Comparabilidad Directa');
      expect(html).toContain('Referencia Externa Bibliográfica (Tesis 3D — Swin UNETR + KAN)');
    });

    it('incluye las advertencias ADV-02 (correlación vs causalidad) y ADV-03 (desbalance)', () => {
      const html = renderToString(<SeccionClasificacionE2 />);

      expect(html).toContain('ADV-02');
      expect(html).toContain('Correlación observada vs Causalidad no demostrada en U-Net + CBAM');
      expect(html).toContain('No existe evidencia causal empírica');

      expect(html).toContain('ADV-03');
      expect(html).toContain('Desbalance de clases en evaluación de malignidad');
    });
  });

  describe('4. Honestidad de datos y componentes reutilizables', () => {
    it('muestra "No disponible" cuando una métrica no está presente sin romper la interfaz', () => {
      const html = renderToString(
        <TarjetaMetricaInterpretacion
          titulo="Métrica Inexistente"
          valor={null}
          arquitectura="U-Net"
          colorArquitectura="unet"
          etapa="E1"
          origen="prueba_independiente"
        />
      );

      expect(html).toContain('No disponible');
      expect(html).toContain('Métrica Inexistente');
      expect(html).toContain('U-Net');
    });

    it('renderiza adecuadamente los badges de procedencia', () => {
      const htmlTest = renderToString(<BadgeProcedencia origen="prueba_independiente" tamanoMuestra={762} />);
      expect(htmlTest).toContain('Test ciego (N=762)');

      const htmlRef3D = renderToString(<BadgeProcedencia origen="referencia_3d" />);
      expect(htmlRef3D).toContain('Ref. 3D Externa');

      const htmlVal = renderToString(<BadgeProcedencia origen="validacion" />);
      expect(htmlVal).toContain('Validación');
    });

    it('renderiza cajas de aviso científico con su severidad e ID', () => {
      const htmlAviso = renderToString(
        <AvisoCientifico
          idAdvertencia="ADV-TEST"
          titulo="Aviso de Prueba"
          descripcion="Descripción de prueba"
          justificacion="Justificación metodológica"
          severidad="critica"
        />
      );

      expect(htmlAviso).toContain('ADV-TEST');
      expect(htmlAviso).toContain('Aviso de Prueba');
      expect(htmlAviso).toContain('Descripción de prueba');
      expect(htmlAviso).toContain('Justificación metodológica');
      expect(htmlAviso).toContain('aviso-critica');
    });
  });
});
