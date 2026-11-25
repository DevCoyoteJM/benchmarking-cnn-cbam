import { describe, expect, it } from 'vitest';
import {
  REGISTROS_EVALUACION_CANONICOS,
  compararPorMetrica,
  evaluarComparabilidad,
  explicarInvalidezRankingGlobal,
  obtenerAdvertenciasMetodologicas,
  obtenerConclusionesRespaldadas,
  obtenerMetadatosMuestra,
  obtenerMetricasDisponibles,
  obtenerMetricasHardware,
  obtenerRegistroPorId,
  obtenerRegistrosEvaluacion,
  obtenerResultadosE1,
  obtenerResultadosE2,
} from '../services/interpretacionService';
import type { IdArquitectura } from '../types/interpretacion';

describe('Servicio de Interpretación Científica (interpretacionService)', () => {
  describe('1. Separación estricta de Etapas E1 y E2', () => {
    it('separa limpiamente los resultados de E1 y E2 sin mezclar métricas', () => {
      const e1Resultados = obtenerResultadosE1();
      const e2Resultados = obtenerResultadosE2();

      expect(e1Resultados).toHaveLength(4); // 4 arquitecturas 2D por defecto
      expect(e2Resultados).toHaveLength(4);

      // Verificación de métricas específicas de E1
      for (const res of e1Resultados) {
        expect(res.etapa).toBe('E1');
        expect(res.metricas).toHaveProperty('dice');
        expect(res.metricas).toHaveProperty('iou');
        expect(res.metricas).not.toHaveProperty('f1Macro');
        expect(res.metricas).not.toHaveProperty('mcc');
        expect(res.muestra.tamanoMuestra).toBe(762);
        expect(res.muestra.unidad).toBe('parches_2d_96x96');
      }

      // Verificación de métricas específicas de E2
      for (const res of e2Resultados) {
        expect(res.etapa).toBe('E2');
        expect(res.metricas).toHaveProperty('f1Macro');
        expect(res.metricas).toHaveProperty('mcc');
        expect(res.metricas).toHaveProperty('rocAuc');
        expect(res.metricas).toHaveProperty('sensibilidad');
        expect(res.metricas).toHaveProperty('especificidad');
        expect(res.metricas).not.toHaveProperty('dice');
        expect(res.muestra.tamanoMuestra).toBe(213);
        expect(res.muestra.unidad).toBe('nodulos_2d_96x96');
      }
    });

    it('proporciona los metadatos muestrales correctos según la etapa', () => {
      const muestraE1 = obtenerMetadatosMuestra('E1');
      const muestraE2 = obtenerMetadatosMuestra('E2');

      expect(muestraE1.tamanoMuestra).toBe(762);
      expect(muestraE1.unidad).toBe('parches_2d_96x96');
      expect(muestraE1.particionPacienteDisjunta).toBe(true);

      expect(muestraE2.tamanoMuestra).toBe(213);
      expect(muestraE2.unidad).toBe('nodulos_2d_96x96');
      expect(muestraE2.particionPacienteDisjunta).toBe(true);
      expect(muestraE2.distribucionClases).toBeDefined();
      expect(muestraE2.distribucionClases?.benignos).toBe(150);
      expect(muestraE2.distribucionClases?.malignos).toBe(63);
      expect(muestraE2.distribucionClases?.total).toBe(213);
    });
  });

  describe('2. Separación de Validación y Prueba Independiente', () => {
    it('garantiza que todas las métricas principales provienen del conjunto de test ciego', () => {
      const registros = obtenerRegistrosEvaluacion();

      for (const reg of registros) {
        expect(reg.e1.origen).toBe('prueba_independiente');
        expect(reg.e2.origen).toBe('prueba_independiente');

        // Las métricas de convergencia de validación residen en un objeto separado
        expect(reg.e1.dinamicaEntrenamiento).toBeDefined();
        expect(reg.e1.dinamicaEntrenamiento?.valDicePico).toBeGreaterThan(0);
        expect(reg.e1.dinamicaEntrenamiento?.valDicePico).not.toEqual(reg.e1.metricas.dice);

        expect(reg.e2.dinamicaEntrenamiento).toBeDefined();
        expect(reg.e2.dinamicaEntrenamiento?.valMccPico).toBeGreaterThan(0);
      }
    });
  });

  describe('3. Honestidad de datos y ausencia de métricas no medidas', () => {
    it('reporta explícitamente la memoria VRAM como no instrumentada en notebook para no inventar datos', () => {
      const hw = obtenerMetricasHardware();

      for (const [, metricas] of Object.entries(hw)) {
        expect(metricas.vramMb).toBeNull();
        expect(metricas.vramMedidaEnNotebook).toBe(false);
        expect(metricas.parametrosMillones).toBeGreaterThan(0);
        expect(metricas.latenciaMs).toBeGreaterThan(0);
        expect(metricas.fps).toBeGreaterThan(0);
        expect(metricas.dispositivo).toContain('RTX');
      }
    });

    it('maneja identificadores inexistentes retornando undefined sin lanzar excepciones', () => {
      const desconocido = obtenerRegistroPorId('modelo-inexistente' as IdArquitectura);
      expect(desconocido).toBeUndefined();
    });

    it('lista con precisión las métricas registradas disponibles para cada etapa', () => {
      const metricasE1 = obtenerMetricasDisponibles('E1');
      const metricasE2 = obtenerMetricasDisponibles('E2');

      expect(metricasE1.map((m) => m.clave)).toEqual(['dice', 'iou', 'hd95Mm', 'f1Det']);
      expect(metricasE2.map((m) => m.clave)).toEqual([
        'f1Macro',
        'mcc',
        'rocAuc',
        'accuracy',
        'sensibilidad',
        'especificidad',
      ]);
    });
  });

  describe('4. Evaluación de Comparabilidad y Reglas Metodológicas', () => {
    it('detecta y advierte cuando se compara una red 2D con la referencia 3D externa', () => {
      const comp = evaluarComparabilidad('modcbam', 'swin-unetr-kan-3d', 'E1');
      expect(comp.comparable).toBe(false);
      expect(comp.tipo).toBe('heterogenea_2d_vs_3d');
      expect(comp.motivo).toContain('heterogénea');
      expect(comp.advertencia).toBeDefined();
    });

    it('identifica la asimetría por Early Stopping en E1 entre U-Net+CBAM y TransUNet', () => {
      const comp = evaluarComparabilidad('unet-cbam', 'transunet', 'E1');
      expect(comp.comparable).toBe(true);
      expect(comp.tipo).toBe('asimetrica_parada_temprana');
      expect(comp.motivo).toContain('48');
      expect(comp.motivo).toContain('106');
    });

    it('reconoce como equivalente la comparación en E2 entre modelos 2D con 100 épocas completas', () => {
      const comp = evaluarComparabilidad('unet', 'modcbam', 'E2');
      expect(comp.comparable).toBe(true);
      expect(comp.tipo).toBe('equivalente');
    });

    it('rechaza comparaciones si alguno de los modelos no existe', () => {
      const comp = evaluarComparabilidad('unet', 'no-existe' as IdArquitectura, 'E1');
      expect(comp.comparable).toBe(false);
      expect(comp.tipo).toBe('no_comparable');
    });
  });

  describe('5. Cálculos y Ordenamientos por Métrica Específica', () => {
    it('ordena descendentemente en métricas donde mayor es mejor (Dice en E1)', () => {
      const compDice = compararPorMetrica('dice', 'E1');
      expect(compDice.direccionOptima).toBe('mayor_es_mejor');
      expect(compDice.ranking).toHaveLength(4);

      // ModCBAM lidera en Dice con 0.893
      expect(compDice.ranking[0].arquitecturaId).toBe('modcbam');
      expect(compDice.ranking[0].valor).toBe(0.893);
      expect(compDice.ranking[0].esMejor).toBe(true);

      // U-Net tiene el menor Dice (0.873)
      expect(compDice.ranking[compDice.ranking.length - 1].arquitecturaId).toBe('unet');
      expect(compDice.ranking[compDice.ranking.length - 1].valor).toBe(0.873);
      expect(compDice.ranking[compDice.ranking.length - 1].esPeor).toBe(true);
    });

    it('ordena ascendentemente en métricas de error donde menor es mejor (HD95 en E1)', () => {
      const compHD95 = compararPorMetrica('hd95Mm', 'E1');
      expect(compHD95.direccionOptima).toBe('menor_es_mejor');

      // U-Net tiene el mejor HD95 (1.57 mm)
      expect(compHD95.ranking[0].arquitecturaId).toBe('unet');
      expect(compHD95.ranking[0].valor).toBe(1.57);
      expect(compHD95.ranking[0].esMejor).toBe(true);

      // TransUNet tiene el peor HD95 (1.83 mm) entre los modelos 2D
      expect(compHD95.ranking[compHD95.ranking.length - 1].arquitecturaId).toBe('transunet');
      expect(compHD95.ranking[compHD95.ranking.length - 1].valor).toBe(1.83);
      expect(compHD95.ranking[compHD95.ranking.length - 1].esPeor).toBe(true);
    });

    it('identifica correctamente a ModCBAM como líder en Sensibilidad diagnóstica en E2', () => {
      const compSens = compararPorMetrica('sensibilidad', 'E2');
      expect(compSens.ranking[0].arquitecturaId).toBe('modcbam');
      expect(compSens.ranking[0].valor).toBe(0.762);
      expect(compSens.ranking[0].esMejor).toBe(true);

      // U-Net + CBAM tiene la menor sensibilidad (0.587)
      const peor = compSens.ranking[compSens.ranking.length - 1];
      expect(peor.arquitecturaId).toBe('unet-cbam');
      expect(peor.valor).toBe(0.587);
      expect(peor.esPeor).toBe(true);
    });

    it('identifica a U-Net como líder en AUC y MCC en E2', () => {
      const compAUC = compararPorMetrica('rocAuc', 'E2');
      expect(compAUC.ranking[0].arquitecturaId).toBe('unet');
      expect(compAUC.ranking[0].valor).toBe(0.914);
      expect(compAUC.ranking[0].esMejor).toBe(true);

      const compMCC = compararPorMetrica('mcc', 'E2');
      expect(compMCC.ranking[0].arquitecturaId).toBe('unet');
      expect(compMCC.ranking[0].valor).toBe(0.71);
      expect(compMCC.ranking[0].esMejor).toBe(true);
    });
  });

  describe('6. Advertencias Metodológicas Auditadas', () => {
    it('contiene advertencias críticas sobre causalidad no demostrada y desbalance', () => {
      const advertencias = obtenerAdvertenciasMetodologicas();
      expect(advertencias.length).toBeGreaterThanOrEqual(6);

      // ADV-02: Causalidad no demostrada en CBAM
      const adv02 = advertencias.find((a) => a.id === 'ADV-02');
      expect(adv02).toBeDefined();
      expect(adv02?.severidad).toBe('critica');
      expect(adv02?.descripcion).toContain('No existe evidencia causal');

      // ADV-03: Desbalance de clases en E2
      const adv03 = advertencias.find((a) => a.id === 'ADV-03');
      expect(adv03).toBeDefined();
      expect(adv03?.descripcion).toContain('150 nódulos benignos (70.42%) y 63 malignos (29.58%)');

      // ADV-06: VRAM no instrumentada
      const adv06 = advertencias.find((a) => a.id === 'ADV-06');
      expect(adv06).toBeDefined();
      expect(adv06?.titulo).toContain('no instrumentado');
      expect(adv06?.descripcion).toContain('instrumentación formal');
    });
  });

  describe('7. Asociación de Evidencias Visuales (EV-01 a EV-08)', () => {
    it('asocia evidencias visuales coherentes a cada etapa y arquitectura', () => {
      const unet = REGISTROS_EVALUACION_CANONICOS.unet;

      expect(unet.e1.evidenciasAsociadas).toEqual([
        'EV-01',
        'EV-05',
        'EV-06',
        'EV-07',
        'EV-08',
      ]);
      expect(unet.e2.evidenciasAsociadas).toEqual([
        'EV-02',
        'EV-03',
        'EV-04',
        'EV-08',
      ]);
    });
  });

  describe('8. Ausencia de Rankings Globales Injustificados', () => {
    it('explica formalmente por qué colapsar métricas en un único ranking global es metodológicamente inválido', () => {
      const obj = explicarInvalidezRankingGlobal();
      expect(obj.invalido).toBe(true);
      expect(obj.razonMetodologica).toContain('pesos arbitrarios');
      expect(obj.alternativaCientifica).toContain('compromisos multidimensionales');
    });
  });

  describe('9. Conclusiones Respaldadas y Trazabilidad', () => {
    it('devuelve conclusiones empíricas vinculadas a métricas y evidencias concretas', () => {
      const conclusiones = obtenerConclusionesRespaldadas();
      expect(conclusiones.length).toBeGreaterThanOrEqual(5);

      for (const c of conclusiones) {
        expect(c.id).toBeDefined();
        expect(c.afirmacion).toBeDefined();
        expect(c.nivelCerteza).toBe('demostrado_empiricamente');
        expect(c.evidenciasCuantitativas.length).toBeGreaterThan(0);
        expect(c.limitacionesYAdvertencias).toBeDefined();
      }
    });

    it('no contiene ninguna afirmación causal categórica falsa sobre la parada temprana y la sensibilidad', () => {
      const conclusiones = obtenerConclusionesRespaldadas();
      for (const c of conclusiones) {
        expect(c.afirmacion.toLowerCase()).not.toContain('causado por el early stopping');
        expect(c.afirmacion.toLowerCase()).not.toContain('provocado exclusivamente por la parada temprana');
      }
    });
  });
});
