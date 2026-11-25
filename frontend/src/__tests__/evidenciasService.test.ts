import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validarIndiceRecursos,
  esRecursoVisualValido,
  normalizarRecursoVisual,
  procesarIndiceRecursos,
  cargarIndiceRecursos,
  filtrarEvidenciasPorCategoria,
  filtrarEvidenciasPorEtapa,
  filtrarEvidenciasPorArquitectura,
  obtenerEvidenciaPorId,
  resolverRutaPublica,
  METADATOS_CIENTIFICOS_AUDITADOS,
} from '../services/evidenciasService';
import type {
  IndiceRecursosVisualesJSON,
  RecursoVisualJSON,
} from '../types/evidencias';
import realIndiceJson from '../../public/evidencias/indice_recursos.json';

const recursoBaseValido: RecursoVisualJSON = {
  id: 'EV-01',
  nombre_archivo: 'curvas_aprendizaje_e1_segmentacion.png',
  categoria_principal: 'metricas',
  subcategorias_visibles: ['metricas'],
  tipo_recurso: 'Gráfica comparativa de entrenamiento/validación (E1)',
  celda_origen: 32,
  indice_salida: 0,
  etapa: 'E1',
  arquitecturas_asociadas: ['UNet', 'CBAM', 'ModCBAM', 'TransUNet'],
  formato_original: 'PNG',
  modo_color: 'RGBA',
  dimensiones: { ancho: 1390, alto: 495 },
  tamano_bytes: 116050,
  sha256: '774f4563e7ccc06cabdd44dc3956daf667e83a2fc5372cbf1e8d82bb2950eab7',
  titulo: 'Etapa 1: Evolución de Segmentación y Detección',
  descripcion: 'Evolución por época de la función de pérdida de validación...',
  ruta_relativa_public: '/evidencias/metricas/curvas_aprendizaje_e1_segmentacion.png',
  ruta_relativa_directa: '/evidencias/curvas_aprendizaje_e1_segmentacion.png',
};

const indiceValidoEjemplo: IndiceRecursosVisualesJSON = {
  version: '1.0.0',
  origen: 'LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb',
  total_celdas_notebook: 51,
  total_recursos_extraidos: 1,
  resumen_por_categoria: {
    metricas: 1,
    atencion: 0,
    comparaciones: 0,
    tomografias: 0,
    mascaras: 0,
    segmentaciones: 0,
    arquitecturas: 0,
    otros: 0,
  },
  recursos: [recursoBaseValido],
};

describe('Servicio de Evidencias Visuales (evidenciasService)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validarIndiceRecursos y esRecursoVisualValido', () => {
    it('valida con éxito el archivo real indice_recursos.json del proyecto', () => {
      const resultado = validarIndiceRecursos(realIndiceJson);
      expect(resultado.esValido).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    it('valida correctamente un objeto de índice bien estructurado', () => {
      const resultado = validarIndiceRecursos(indiceValidoEjemplo);
      expect(resultado.esValido).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    it('falla si el índice es null, undefined o un tipo no objeto', () => {
      expect(validarIndiceRecursos(null).esValido).toBe(false);
      expect(validarIndiceRecursos(undefined).esValido).toBe(false);
      expect(validarIndiceRecursos('no-es-objeto').esValido).toBe(false);
      expect(validarIndiceRecursos([]).esValido).toBe(false);
    });

    it('detecta falta de versión u origen en la raíz del índice', () => {
      const invalidoSinVersion = { ...indiceValidoEjemplo, version: '' };
      const resVersion = validarIndiceRecursos(invalidoSinVersion);
      expect(resVersion.esValido).toBe(false);
      expect(resVersion.errores.some((e) => e.includes('version'))).toBe(true);

      const invalidoSinOrigen = { ...indiceValidoEjemplo, origen: '   ' };
      const resOrigen = validarIndiceRecursos(invalidoSinOrigen);
      expect(resOrigen.esValido).toBe(false);
      expect(resOrigen.errores.some((e) => e.includes('origen'))).toBe(true);
    });

    it('detecta si "recursos" no es un array', () => {
      const invalido = { ...indiceValidoEjemplo, recursos: 'no-array' as unknown as RecursoVisualJSON[] };
      const res = validarIndiceRecursos(invalido);
      expect(res.esValido).toBe(false);
      expect(res.errores.some((e) => e.includes('"recursos" debe ser un array'))).toBe(true);
    });

    it('detecta identificadores duplicados en la lista de recursos', () => {
      const duplicado: IndiceRecursosVisualesJSON = {
        ...indiceValidoEjemplo,
        recursos: [
          recursoBaseValido,
          { ...recursoBaseValido, nombre_archivo: 'copia_mismo_id.png' },
        ],
      };
      const res = validarIndiceRecursos(duplicado);
      expect(res.esValido).toBe(false);
      expect(res.errores.some((e) => e.includes('Identificador duplicado'))).toBe(true);
    });

    it('detecta categorías no válidas', () => {
      const conCategoriaInvalida: RecursoVisualJSON = {
        ...recursoBaseValido,
        // @ts-expect-error probando valor inválido deliberado
        categoria_principal: 'categoria_falsa',
      };
      expect(esRecursoVisualValido(conCategoriaInvalida)).toBe(false);

      const res = validarIndiceRecursos({
        ...indiceValidoEjemplo,
        recursos: [conCategoriaInvalida],
      });
      expect(res.esValido).toBe(false);
    });

    it('detecta etapas no válidas', () => {
      const conEtapaInvalida: RecursoVisualJSON = {
        ...recursoBaseValido,
        // @ts-expect-error probando valor inválido deliberado
        etapa: 'E3',
      };
      expect(esRecursoVisualValido(conEtapaInvalida)).toBe(false);

      const res = validarIndiceRecursos({
        ...indiceValidoEjemplo,
        recursos: [conEtapaInvalida],
      });
      expect(res.esValido).toBe(false);
    });

    it('detecta dimensiones o tamaños inválidos', () => {
      const dimensionCero: RecursoVisualJSON = {
        ...recursoBaseValido,
        dimensiones: { ancho: 0, alto: 400 },
      };
      expect(esRecursoVisualValido(dimensionCero)).toBe(false);

      const tamanoNegativo: RecursoVisualJSON = {
        ...recursoBaseValido,
        tamano_bytes: -50,
      };
      expect(esRecursoVisualValido(tamanoNegativo)).toBe(false);
    });
  });

  describe('normalizarRecursoVisual y Reglas Científicas', () => {
    it('convierte snake_case a camelCase y preserva la naturaleza comparativa', () => {
      const normalizado = normalizarRecursoVisual(recursoBaseValido);
      expect(normalizado.id).toBe('EV-01');
      expect(normalizado.nombreArchivo).toBe('curvas_aprendizaje_e1_segmentacion.png');
      expect(normalizado.categoriaPrincipal).toBe('metricas');
      expect(normalizado.tipoEvidencia).toBe('comparativa');
      expect(normalizado.etapa).toBe('E1');
      expect(normalizado.conjuntoEvaluacion).toBe('validacion');
      expect(normalizado.resumenMuestral).toContain('Validación E1');
      expect(normalizado.arquitecturasRepresentadas).toEqual(['UNet', 'CBAM', 'ModCBAM', 'TransUNet']);
      expect(normalizado.rutaResuelta).toContain('curvas_aprendizaje_e1_segmentacion.png');
    });

    it('asigna correctamente las etiquetas científicas auditadas de EV-01 a EV-08', () => {
      const recursosNormalizados = procesarIndiceRecursos(realIndiceJson as IndiceRecursosVisualesJSON);
      expect(recursosNormalizados).toHaveLength(8);

      const mapa = new Map(recursosNormalizados.map((r) => [r.id, r]));

      // EV-01: validación E1
      const ev01 = mapa.get('EV-01')!;
      expect(ev01.etapa).toBe('E1');
      expect(ev01.conjuntoEvaluacion).toBe('validacion');
      expect(ev01.tipoEvidencia).toBe('comparativa');

      // EV-02: validación E2
      const ev02 = mapa.get('EV-02')!;
      expect(ev02.etapa).toBe('E2');
      expect(ev02.conjuntoEvaluacion).toBe('validacion');
      expect(ev02.tipoEvidencia).toBe('comparativa');

      // EV-03: prueba independiente E2, N=213
      const ev03 = mapa.get('EV-03')!;
      expect(ev03.etapa).toBe('E2');
      expect(ev03.conjuntoEvaluacion).toBe('prueba_independiente');
      expect(ev03.resumenMuestral).toContain('N=213');
      expect(ev03.limitacionesMetodologicas).toBeDefined();
      expect(ev03.tipoEvidencia).toBe('comparativa');

      // EV-04: prueba independiente E2, N=213
      const ev04 = mapa.get('EV-04')!;
      expect(ev04.etapa).toBe('E2');
      expect(ev04.conjuntoEvaluacion).toBe('prueba_independiente');
      expect(ev04.resumenMuestral).toContain('N=213');
      expect(ev04.tipoEvidencia).toBe('comparativa');

      // EV-05: prueba independiente E1, N=762
      const ev05 = mapa.get('EV-05')!;
      expect(ev05.etapa).toBe('E1');
      expect(ev05.conjuntoEvaluacion).toBe('prueba_independiente');
      expect(ev05.resumenMuestral).toContain('N=762');
      expect(ev05.tipoEvidencia).toBe('comparativa');

      // EV-06: prueba independiente E2, 3 pacientes
      const ev06 = mapa.get('EV-06')!;
      expect(ev06.etapa).toBe('E2');
      expect(ev06.conjuntoEvaluacion).toBe('prueba_independiente');
      expect(ev06.resumenMuestral).toContain('3 pacientes');
      expect(ev06.tipoEvidencia).toBe('comparativa');

      // EV-07: prueba independiente E2, 2 pacientes
      const ev07 = mapa.get('EV-07')!;
      expect(ev07.etapa).toBe('E2');
      expect(ev07.conjuntoEvaluacion).toBe('prueba_independiente');
      expect(ev07.resumenMuestral).toContain('2 pacientes');
      expect(ev07.tipoEvidencia).toBe('comparativa');

      // EV-08: prueba independiente E1 + E2, 4 pacientes
      const ev08 = mapa.get('EV-08')!;
      expect(ev08.etapa).toBe('E1 + E2');
      expect(ev08.conjuntoEvaluacion).toBe('prueba_independiente');
      expect(ev08.resumenMuestral).toContain('4 pacientes');
      expect(ev08.tipoEvidencia).toBe('comparativa');

      // Verificar diccionario de metadatos auditados
      expect(Object.keys(METADATOS_CIENTIFICOS_AUDITADOS)).toHaveLength(8);
      expect(METADATOS_CIENTIFICOS_AUDITADOS['EV-03'].limitacionesMetodologicas).toBeDefined();
    });

    it('no permite clasificar ninguna evidencia como individual', () => {
      const normalizado = normalizarRecursoVisual(recursoBaseValido);
      expect(normalizado.tipoEvidencia).not.toBe('individual');
      expect(normalizado.tipoEvidencia).toBe('comparativa');
    });
  });

  describe('resolverRutaPublica', () => {
    it('resuelve rutas estándar añadiendo barra si no existe', () => {
      const ruta1 = resolverRutaPublica('/evidencias/imagen.png');
      expect(ruta1.endsWith('/evidencias/imagen.png')).toBe(true);

      const ruta2 = resolverRutaPublica('evidencias/imagen.png');
      expect(ruta2.endsWith('/evidencias/imagen.png')).toBe(true);
    });
  });

  describe('cargarIndiceRecursos (asíncrono con fetch)', () => {
    it('carga con éxito cuando fetch responde ok con JSON válido', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => indiceValidoEjemplo,
      });

      const res = await cargarIndiceRecursos('/test-url.json');
      expect(res.indice).toBeDefined();
      expect(res.indice?.version).toBe('1.0.0');
      expect(res.error).toBeUndefined();
    });

    it('maneja error HTTP 404 o 500 sin lanzar excepciones no controladas', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const res = await cargarIndiceRecursos('/no-existe.json');
      expect(res.indice).toBeNull();
      expect(res.error).toContain('Error HTTP 404');
    });

    it('maneja error de red o timeout en fetch', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network request failed'));

      const res = await cargarIndiceRecursos('/error-red.json');
      expect(res.indice).toBeNull();
      expect(res.error).toContain('Network request failed');
    });

    it('maneja respuestas con estructura JSON que no pasa la validación', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ version: '1.0', recursos: 'no-es-array' }),
      });

      const res = await cargarIndiceRecursos('/estructura-invalida.json');
      expect(res.indice).toBeNull();
      expect(res.error).toContain('Estructura del índice inválida');
    });
  });

  describe('Filtrado y Búsqueda de Evidencias', () => {
    const evidencias = procesarIndiceRecursos(realIndiceJson as IndiceRecursosVisualesJSON);

    it('filtra por categoría principal y por subcategorías visibles', () => {
      const soloMetricas = filtrarEvidenciasPorCategoria(evidencias, 'metricas');
      expect(soloMetricas).toHaveLength(5);
      expect(soloMetricas.every((e) => e.categoriaPrincipal === 'metricas')).toBe(true);

      const soloAtencion = filtrarEvidenciasPorCategoria(evidencias, 'atencion');
      expect(soloAtencion).toHaveLength(2); // EV-06 y EV-07

      const soloComparaciones = filtrarEvidenciasPorCategoria(evidencias, 'comparaciones');
      expect(soloComparaciones).toHaveLength(1); // EV-08

      const subTomografias = filtrarEvidenciasPorCategoria(evidencias, 'tomografias');
      expect(subTomografias).toHaveLength(3); // EV-06, EV-07, EV-08 integran tomografías

      const subMascaras = filtrarEvidenciasPorCategoria(evidencias, 'mascaras');
      expect(subMascaras).toHaveLength(2); // EV-06 y EV-08 integran máscaras GT

      const todas = filtrarEvidenciasPorCategoria(evidencias, 'todas');
      expect(todas).toHaveLength(8);
    });

    it('filtra por etapa metodológica (E1, E2, E1 + E2)', () => {
      const e1 = filtrarEvidenciasPorEtapa(evidencias, 'E1');
      // Debe incluir EV-01, EV-05 (E1 pura) y EV-08 (E1 + E2)
      expect(e1.map((r) => r.id).sort()).toEqual(['EV-01', 'EV-05', 'EV-08'].sort());

      const e2 = filtrarEvidenciasPorEtapa(evidencias, 'E2');
      // Debe incluir EV-02, EV-03, EV-04, EV-06, EV-07 y EV-08
      expect(e2.map((r) => r.id).sort()).toEqual(
        ['EV-02', 'EV-03', 'EV-04', 'EV-06', 'EV-07', 'EV-08'].sort()
      );

      const e1PlusE2 = filtrarEvidenciasPorEtapa(evidencias, 'E1 + E2');
      expect(e1PlusE2).toHaveLength(1);
      expect(e1PlusE2[0].id).toBe('EV-08');

      const todas = filtrarEvidenciasPorEtapa(evidencias, 'todas');
      expect(todas).toHaveLength(8);
    });

    it('filtra por modelo o arquitectura representada mediante ID de experimento o alias', () => {
      const unetPorId = filtrarEvidenciasPorArquitectura(evidencias, 'unet-v1');
      expect(unetPorId).toHaveLength(8);

      const cbamPorId = filtrarEvidenciasPorArquitectura(evidencias, 'unet-cbam-v1');
      expect(cbamPorId).toHaveLength(8);

      const modcbamPorNombre = filtrarEvidenciasPorArquitectura(evidencias, 'ModCBAM');
      expect(modcbamPorNombre).toHaveLength(8);

      const transunetPorAlias = filtrarEvidenciasPorArquitectura(evidencias, 'Transformer U-Net');
      expect(transunetPorAlias).toHaveLength(8);

      const modeloInexistente = filtrarEvidenciasPorArquitectura(evidencias, 'resnet50-v1');
      expect(modeloInexistente).toHaveLength(0);

      const todas = filtrarEvidenciasPorArquitectura(evidencias, 'todos');
      expect(todas).toHaveLength(8);
    });

    it('obtiene un recurso específico por ID y maneja recursos inexistentes', () => {
      const ev03 = obtenerEvidenciaPorId(evidencias, 'EV-03');
      expect(ev03).toBeDefined();
      expect(ev03?.id).toBe('EV-03');
      expect(ev03?.titulo).toContain('Matrices de Confusión');

      // Búsqueda insensible a mayúsculas
      const ev04Minuscula = obtenerEvidenciaPorId(evidencias, 'ev-04');
      expect(ev04Minuscula).toBeDefined();
      expect(ev04Minuscula?.id).toBe('EV-04');

      // ID inexistente retorna undefined
      const noExiste = obtenerEvidenciaPorId(evidencias, 'EV-99');
      expect(noExiste).toBeUndefined();

      // Cadena vacía retorna undefined
      const vacio = obtenerEvidenciaPorId(evidencias, '');
      expect(vacio).toBeUndefined();
    });
  });
});
