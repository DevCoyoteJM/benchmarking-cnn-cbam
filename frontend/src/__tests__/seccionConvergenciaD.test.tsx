import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SeccionConvergenciaD from '../components/interpretacion/SeccionConvergenciaD';
import InterpretacionCientifica from '../pages/InterpretacionCientifica';
import {
  obtenerSeriesConvergenciaE1,
  obtenerSeriesConvergenciaE2,
  obtenerIndicadoresEstabilidadConvergencia,
  obtenerAnalisisBrechasGeneralizacion,
  obtenerSintesisConvergenciaPorArquitectura,
  calcularDesviacionPrimerasDiferencias,
} from '../services/interpretacionService';

describe('Sección D: Convergencia y Dinámica de Entrenamiento (FASE 4.7E)', () => {
  describe('1. Carga Canónica y Separación E1 / E2 en Servicio', () => {
    it('carga las cuatro series de E1 con conteos de épocas exactos y sin métricas de E2', () => {
      const seriesE1 = obtenerSeriesConvergenciaE1();
      expect(seriesE1).toHaveLength(4);

      const mapaE1 = Object.fromEntries(seriesE1.map((s) => [s.arquitecturaId, s]));

      // Épocas efectivas de parada temprana por Early Stopping (Paciencia 25)
      expect(mapaE1.unet.epocasEfectivas).toBe(80);
      expect(mapaE1['unet-cbam'].epocasEfectivas).toBe(48);
      expect(mapaE1.modcbam.epocasEfectivas).toBe(75);
      expect(mapaE1.transunet.epocasEfectivas).toBe(106);

      // Longitudes de arrays idénticas
      for (const s of seriesE1) {
        expect(s.valDice).toHaveLength(s.epocasEfectivas);
        expect(s.trainLoss).toHaveLength(s.epocasEfectivas);
        expect(s.valLoss).toHaveLength(s.epocasEfectivas);
        expect(s.epocasConfiguradas).toBe(150);
        expect(s.pacienciaEarlyStopping).toBe(25);
        // Ausencia de métricas de E2
        expect((s as unknown as Record<string, unknown>).valMcc).toBeUndefined();
        expect((s as unknown as Record<string, unknown>).valF1).toBeUndefined();
      }
    });

    it('identifica con exactitud las mejores épocas y caídas post-pico en E1', () => {
      const seriesE1 = obtenerSeriesConvergenciaE1();
      const mapaE1 = Object.fromEntries(seriesE1.map((s) => [s.arquitecturaId, s]));

      // U-Net: Pico en época 55
      expect(mapaE1.unet.mejorEpocaDice).toBe(55);
      expect(mapaE1.unet.mejorValDice).toBeCloseTo(0.895, 3);
      expect(mapaE1.unet.ultimoValDice).toBeCloseTo(0.8842, 3);
      expect(mapaE1.unet.diferenciaDicePicoFinal).toBeCloseTo(0.0108, 4);
      expect(mapaE1.unet.epocasEfectivas - mapaE1.unet.mejorEpocaDice).toBe(25); // Ventana de paciencia

      // U-Net + CBAM: Pico precoz en época 23
      expect(mapaE1['unet-cbam'].mejorEpocaDice).toBe(23);
      expect(mapaE1['unet-cbam'].mejorValDice).toBeCloseTo(0.8731, 3);
      expect(mapaE1['unet-cbam'].ultimoValDice).toBeCloseTo(0.8278, 3);
      expect(mapaE1['unet-cbam'].diferenciaDicePicoFinal).toBeCloseTo(0.0453, 4);
      expect(mapaE1['unet-cbam'].epocasEfectivas - mapaE1['unet-cbam'].mejorEpocaDice).toBe(25);

      // ModCBAM: Pico en época 50
      expect(mapaE1.modcbam.mejorEpocaDice).toBe(50);
      expect(mapaE1.modcbam.mejorValDice).toBeCloseTo(0.8935, 3);
      expect(mapaE1.modcbam.ultimoValDice).toBeCloseTo(0.8858, 3);
      expect(mapaE1.modcbam.diferenciaDicePicoFinal).toBeCloseTo(0.0077, 4);
      expect(mapaE1.modcbam.epocasEfectivas - mapaE1.modcbam.mejorEpocaDice).toBe(25);

      // TransUNet: Pico en época 81
      expect(mapaE1.transunet.mejorEpocaDice).toBe(81);
      expect(mapaE1.transunet.mejorValDice).toBeCloseTo(0.8969, 3);
      expect(mapaE1.transunet.ultimoValDice).toBeCloseTo(0.8913, 3);
      expect(mapaE1.transunet.diferenciaDicePicoFinal).toBeCloseTo(0.0056, 4);
      expect(mapaE1.transunet.epocasEfectivas - mapaE1.transunet.mejorEpocaDice).toBe(25);
    });

    it('carga las cuatro series de E2 con 100 épocas completas y sin métricas de E1', () => {
      const seriesE2 = obtenerSeriesConvergenciaE2();
      expect(seriesE2).toHaveLength(4);

      for (const s of seriesE2) {
        expect(s.epocasEfectivas).toBe(100);
        expect(s.epocasConfiguradas).toBe(100);
        expect(s.encoderCongelado).toBe(true);
        expect(s.valMcc).toHaveLength(100);
        expect(s.valF1).toHaveLength(100);
        expect(s.trainLoss).toHaveLength(100);
        expect(s.valLoss).toHaveLength(100);
        // Ausencia de métricas de E1
        expect((s as unknown as Record<string, unknown>).valDice).toBeUndefined();
      }

      const mapaE2 = Object.fromEntries(seriesE2.map((s) => [s.arquitecturaId, s]));

      // ModCBAM es el pico en MCC de E2
      expect(mapaE2.modcbam.mejorEpocaMcc).toBe(54);
      expect(mapaE2.modcbam.mejorValMcc).toBeCloseTo(0.7388, 3);

      // TransUNet picos
      expect(mapaE2.transunet.mejorEpocaMcc).toBe(66);
      expect(mapaE2.transunet.mejorValMcc).toBeCloseTo(0.6866, 3);
    });
  });

  describe('2. Indicadores Descriptivos de Estabilidad (Apartado D3)', () => {
    it('calcula la desviación estándar de primeras diferencias correctamente sin fallar en arrays cortos', () => {
      expect(calcularDesviacionPrimerasDiferencias([])).toBe(0);
      expect(calcularDesviacionPrimerasDiferencias([1])).toBe(0);
      expect(calcularDesviacionPrimerasDiferencias([1, 2, 3, 4])).toBeCloseTo(0, 5); // Diferencias constantes = varianza 0
      expect(calcularDesviacionPrimerasDiferencias([1, 3, 2, 4])).toBeGreaterThan(0);
    });

    it('retorna los 4 indicadores formales con fórmulas e interpretaciones documentadas', () => {
      const indicadores = obtenerIndicadoresEstabilidadConvergencia();
      expect(indicadores).toHaveLength(4);

      const ids = indicadores.map((i) => i.id);
      expect(ids).toContain('IND-VOL-01');
      expect(ids).toContain('IND-DEG-02');
      expect(ids).toContain('IND-GAP-03');
      expect(ids).toContain('IND-DES-04');

      for (const ind of indicadores) {
        expect(ind.formula).toBeDefined();
        expect(ind.descripcionSignificado).toBeDefined();
        expect(ind.interpretacionCientifica).toBeDefined();
        expect(ind.valoresE1.unet).toBeDefined();
        expect(ind.valoresE2.transunet).toBeDefined();
      }

      // Volatilidad de TransUNet en E2 sustancialmente mayor que en CNNs
      const indVol = indicadores.find((i) => i.id === 'IND-VOL-01');
      expect(indVol?.valoresE2.transunet).toBeGreaterThan(0.15);
      expect(indVol?.valoresE2.unet).toBeLessThan(0.05);
    });
  });

  describe('3. Análisis de Brechas de Generalización y Rigor (Apartado D4)', () => {
    it('retorna el desglose de brechas para E1 y E2 con advertencia sobre TransUNet', () => {
      const brechas = obtenerAnalisisBrechasGeneralizacion();
      expect(brechas.length).toBe(8); // 4 modelos * 2 etapas

      const brechaTransE1 = brechas.find((b) => b.arquitecturaId === 'transunet' && b.etapa === 'E1');
      expect(brechaTransE1).toBeDefined();
      expect(brechaTransE1?.brechaPerdida).toBeCloseTo(0.1531, 3);
      expect(brechaTransE1?.alertaRigor).toContain('No existe evidencia empírica suficiente para concluir sobreajuste');

      const brechaTransE2 = brechas.find((b) => b.arquitecturaId === 'transunet' && b.etapa === 'E2');
      expect(brechaTransE2).toBeDefined();
      expect(brechaTransE2?.alertaRigor).toContain('subajuste relativo');
    });

    it('verifica matemáticamente que las brechas de pérdida corresponden a la misma época exacta', () => {
      const seriesE1 = obtenerSeriesConvergenciaE1();
      const seriesE2 = obtenerSeriesConvergenciaE2();

      const mapaE1 = Object.fromEntries(seriesE1.map((s) => [s.arquitecturaId, s]));
      const mapaE2 = Object.fromEntries(seriesE2.map((s) => [s.arquitecturaId, s]));

      // TransUNet E1: Época 106 exacta
      const transE1 = mapaE1.transunet;
      const lastIdxE1 = transE1.epocasEfectivas - 1; // índice 105 (época 106)
      const diffCalculadaE1 = transE1.valLoss[lastIdxE1] - transE1.trainLoss[lastIdxE1];
      expect(transE1.brechaPerdidaFinal).toBeCloseTo(diffCalculadaE1, 5);
      expect(transE1.brechaPerdidaFinal).toBeCloseTo(0.1531, 3);

      // TransUNet E2: Época 100 exacta
      const transE2 = mapaE2.transunet;
      const lastIdxE2 = transE2.epocasEfectivas - 1; // índice 99 (época 100)
      const diffCalculadaE2 = transE2.valLoss[lastIdxE2] - transE2.trainLoss[lastIdxE2];
      expect(transE2.brechaPerdidaFinal).toBeCloseTo(diffCalculadaE2, 5);
      expect(transE2.brechaPerdidaFinal).toBeCloseTo(-0.0089, 3);

      // CBAM E1: Época 48 exacta
      const cbamE1 = mapaE1['unet-cbam'];
      const lastIdxCbam = cbamE1.epocasEfectivas - 1;
      expect(cbamE1.valLoss[lastIdxCbam] - cbamE1.trainLoss[lastIdxCbam]).toBeCloseTo(-0.0183, 3);
    });

    it('verifica los desfases temporales exactos de IND-DES-04 entre mínimo de pérdida y máximo clínico', () => {
      const indicadores = obtenerIndicadoresEstabilidadConvergencia();
      const indDes = indicadores.find((i) => i.id === 'IND-DES-04');
      expect(indDes).toBeDefined();

      // E1: U-Net sincronía perfecta (desfase 0), ModCBAM (desfase 1), CBAM (desfase 25), TransUNet (desfase 33)
      expect(indDes?.valoresE1.unet).toBe(0);
      expect(indDes?.valoresE1.modcbam).toBe(1);
      expect(indDes?.valoresE1['unet-cbam']).toBe(25);
      expect(indDes?.valoresE1.transunet).toBe(33);

      // E2: U-Net (30), CBAM (16), ModCBAM (21), TransUNet (21)
      expect(indDes?.valoresE2.unet).toBe(30);
      expect(indDes?.valoresE2['unet-cbam']).toBe(16);
      expect(indDes?.valoresE2.modcbam).toBe(21);
      expect(indDes?.valoresE2.transunet).toBe(21);
    });
  });

  describe('4. Síntesis por Arquitectura (Apartado D5)', () => {
    it('retorna perfiles individualizados completos para las 4 arquitecturas propias', () => {
      const sintesis = obtenerSintesisConvergenciaPorArquitectura();
      expect(sintesis).toHaveLength(4);

      for (const mod of sintesis) {
        expect(mod.arquitecturaId).toBeDefined();
        expect(mod.convergenciaE1.dinamicaEarlyStopping).toBeDefined();
        expect(mod.convergenciaE2.dinamicaEncoderCongelado).toBeDefined();
        expect(mod.estabilidadObservada.descripcionEstabilidad).toBeDefined();
        expect(mod.limitacionesMetodologicas.length).toBeGreaterThan(0);
      }
    });
  });

  describe('5. Renderizado del Componente SeccionConvergenciaD', () => {
    it('renderiza todos los apartados D1 a D5 y los marcadores metodológicos', () => {
      const html = renderToString(<SeccionConvergenciaD />);

      // Contenedor principal y banner
      expect(html).toContain('data-testid="seccion-convergencia-d"');
      expect(html).toContain('data-testid="aviso-rigor-convergencia"');
      expect(html).toContain('Principio Epistemológico: No Confundir Convergencia con Rendimiento Ciego');

      // Apartado D1
      expect(html).toContain('data-testid="apartado-d1-convergencia-e1"');
      expect(html).toContain('Apartado D1');
      expect(html).toContain('data-testid="grafica-e1-dice"');
      expect(html).toContain('U-Net (80 ep)');
      expect(html).toContain('U-Net + CBAM (48 ep)');
      expect(html).toContain('ModCBAM (75 ep)');
      expect(html).toContain('TransUNet (106 ep)');

      // Apartado D2
      expect(html).toContain('data-testid="apartado-d2-convergencia-e2"');
      expect(html).toContain('Apartado D2');
      expect(html).toContain('data-testid="grafica-e2-metricas"');
      expect(html).toContain('100 Épocas Completas');

      // Apartado D3
      expect(html).toContain('data-testid="apartado-d3-estabilidad"');
      expect(html).toContain('Apartado D3');
      expect(html).toContain('IND-VOL-01');
      expect(html).toContain('IND-DEG-02');
      expect(html).toContain('IND-GAP-03');
      expect(html).toContain('IND-DES-04');

      // Apartado D4
      expect(html).toContain('data-testid="apartado-d4-brechas"');
      expect(html).toContain('Apartado D4');
      expect(html).toContain('Precaución Científica sobre TransUNet');

      // Apartado D5
      expect(html).toContain('data-testid="apartado-d5-sintesis"');
      expect(html).toContain('Apartado D5');
      expect(html).toContain('data-testid="sintesis-conv-unet"');
      expect(html).toContain('data-testid="sintesis-conv-unet-cbam"');
      expect(html).toContain('data-testid="sintesis-conv-modcbam"');
      expect(html).toContain('data-testid="sintesis-conv-transunet"');
    });
  });

  describe('6. Integración en Navegación Principal (InterpretacionCientifica.tsx)', () => {
    it('incluye la pestaña para la Sección D en la barra de navegación', () => {
      const html = renderToString(<InterpretacionCientifica />);

      expect(html).toContain('data-testid="tab-seccion-d"');
      expect(html).toContain('Sección D: Convergencia y Dinámica');
      expect(html).toContain('Secciones E a H: Análisis Avanzado');
    });
  });
});
