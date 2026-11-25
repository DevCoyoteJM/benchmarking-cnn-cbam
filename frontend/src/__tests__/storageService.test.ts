import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  obtenerExperimentos,
  guardarExperimentos,
  esRegistroExperimentoValido,
  CLAVE_ALMACENAMIENTO_EXPERIMENTOS,
} from "../services/storage/localStorageService";
import { historialResultados } from "../data/resultados";

describe("Servicio de Almacenamiento Local (localStorageService)", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};

    // Mock seguro de localStorage para entorno Node
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    });
  });

  describe("esRegistroExperimentoValido", () => {
    it("valida correctamente un objeto con la estructura de ResultadoModelo", () => {
      const valido = {
        id: "unet-v1",
        modeloId: "unet",
        version: "1.0",
        fecha: "2026-10-27",
        estado: "finalizado",
        tarea: "segmentacion",
        descripcion: "Modelo base",
        metricas: { dice: 0.89 },
      };

      expect(esRegistroExperimentoValido(valido)).toBe(true);
    });

    it("rechaza registros con modeloId inexistente en el catálogo", () => {
      const invalido = {
        id: "modelo-x",
        modeloId: "modelo-fantasma",
        version: "1.0",
        descripcion: "No existe",
        fecha: null,
        estado: "pendiente",
        metricas: {},
      };

      expect(esRegistroExperimentoValido(invalido)).toBe(false);
    });

    it("rechaza registros con métricas numéricas mayores a 1", () => {
      const invalido = {
        id: "unet-1",
        modeloId: "unet",
        version: "1.0",
        descripcion: "Métrica incorrecta",
        fecha: null,
        estado: "finalizado",
        metricas: { dice: 1.5 },
      };

      expect(esRegistroExperimentoValido(invalido)).toBe(false);
    });

    it("valida correctamente MCC en el rango [-1, 1] y rechaza fuera de rango", () => {
      const base = {
        id: "modcbam-mcc-test",
        modeloId: "modcbam",
        version: "1.0",
        descripcion: "Prueba MCC",
        fecha: null,
        estado: "finalizado",
        tarea: "clasificacion",
      };

      // Válidos en [-1, 1]
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: -1 } })).toBe(true);
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: -0.5 } })).toBe(true);
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: 0 } })).toBe(true);
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: 0.75 } })).toBe(true);
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: 1 } })).toBe(true);

      // Fuera de rango o no finitos
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: -1.01 } })).toBe(false);
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: 1.01 } })).toBe(false);
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: NaN } })).toBe(false);
      expect(esRegistroExperimentoValido({ ...base, metricas: { mcc: Infinity } })).toBe(false);

      // Otras métricas no aceptan negativos
      expect(esRegistroExperimentoValido({ ...base, metricas: { accuracy: -0.05 } })).toBe(false);
    });
  });

  describe("obtenerExperimentos", () => {
    it("retorna la lista inicial por defecto cuando localStorage está vacío", () => {
      const experimentos = obtenerExperimentos();
      expect(experimentos).toHaveLength(historialResultados.length);
      expect(experimentos[0].modeloId).toBe("unet");
      expect(experimentos[1].modeloId).toBe("unet-cbam");
    });

    it("retorna la lista por defecto si el JSON almacenado está corrupto", () => {
      mockStorage[CLAVE_ALMACENAMIENTO_EXPERIMENTOS] = "json no valido {{";

      const experimentos = obtenerExperimentos();
      expect(experimentos).toHaveLength(historialResultados.length);
    });

    it("recupera y normaliza los experimentos correctamente cuando son válidos", () => {
      const datosGuardados = [
        {
          id: "unet-v1",
          modeloId: "unet",
          version: "1.0",
          fecha: "2026-10-27",
          estado: "finalizado",
          tarea: "segmentacion",
          descripcion: "Prueba guardada",
          metricas: { dice: 0.9 },
        },
      ];

      mockStorage[CLAVE_ALMACENAMIENTO_EXPERIMENTOS] = JSON.stringify(datosGuardados);

      const experimentos = obtenerExperimentos();
      expect(experimentos).toHaveLength(1);
      expect(experimentos[0].id).toBe("unet-v1");
      expect(experimentos[0].metricas.dice).toBe(0.9);
    });
  });

  describe("guardarExperimentos", () => {
    it("serializa y almacena los experimentos exitosamente", () => {
      const paraGuardar = [
        {
          id: "cbam-v1",
          modeloId: "unet-cbam",
          version: "1.0",
          fecha: "2026-11-01",
          estado: "finalizado" as const,
          tarea: "clasificacion" as const,
          descripcion: "Prueba guardado",
          metricas: { accuracy: 0.95 },
        },
      ];

      const exito = guardarExperimentos(paraGuardar);
      expect(exito).toBe(true);

      const enStorage = JSON.parse(mockStorage[CLAVE_ALMACENAMIENTO_EXPERIMENTOS]);
      expect(enStorage).toHaveLength(1);
      expect(enStorage[0].modeloId).toBe("unet-cbam");
    });
  });
});
