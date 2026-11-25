import { describe, it, expect, vi } from "vitest";
import {
  inicializarFormulario,
  validarYNormalizarConfiguracion,
} from "../components/FormularioConfiguracion";
import type { FormularioConfiguracionState } from "../components/FormularioConfiguracion";
import type { ConfiguracionEntrenamiento } from "../data/resultados";

describe("Componente y Lógica de FormularioConfiguracion (Fase 3.3)", () => {
  describe("inicializarFormulario", () => {
    it("inicializa todos los campos en cadenas vacías cuando no hay configuración previa", () => {
      const state = inicializarFormulario(undefined);
      expect(state.dataset).toBe("");
      expect(state.versionDataset).toBe("");
      expect(state.numeroMuestras).toBe("");
      expect(state.divisionDatos).toBe("");
      expect(state.preprocesamiento).toBe("");
      expect(state.framework).toBe("");
      expect(state.versionFramework).toBe("");
      expect(state.batchSize).toBe("");
      expect(state.learningRate).toBe("");
      expect(state.optimizador).toBe("");
      expect(state.funcionPerdida).toBe("");
      expect(state.epocasPlanificadas).toBe("");
      expect(state.hardware).toBe("");
      expect(state.semillaAleatoria).toBe("");
      expect(state.aumentoDatos).toBe("");
      expect(state.regularizacion).toBe("");
      expect(state.observaciones).toBe("");
      expect(state.estadoVerificacion).toBe("");
    });

    it("carga correctamente los valores de una configuración existente", () => {
      const configExistente: ConfiguracionEntrenamiento = {
        dataset: "LIDC-IDRI",
        versionDataset: "v1.0",
        numeroMuestras: 1018,
        divisionDatos: "70/15/15",
        preprocesamiento: "Ventana HU",
        framework: "PyTorch",
        versionFramework: "2.1.2",
        batchSize: 16,
        learningRate: 0.0001,
        optimizador: "AdamW",
        funcionPerdida: "Dice Loss",
        epocasPlanificadas: 100,
        hardware: "NVIDIA RTX 3080",
        semillaAleatoria: 42,
        aumentoDatos: "Flips",
        regularizacion: "Dropout 0.2",
        observaciones: "Entrenamiento rápido",
        estadoVerificacion: "verificado_notebook",
      };

      const state = inicializarFormulario(configExistente);
      expect(state.dataset).toBe("LIDC-IDRI");
      expect(state.versionDataset).toBe("v1.0");
      expect(state.numeroMuestras).toBe("1018");
      expect(state.batchSize).toBe("16");
      expect(state.learningRate).toBe("0.0001");
      expect(state.epocasPlanificadas).toBe("100");
      expect(state.semillaAleatoria).toBe("42");
      expect(state.estadoVerificacion).toBe("verificado_notebook");
    });

    it("respeta el campo epocas retrocompatible si epocasPlanificadas está ausente", () => {
      const configRetro: ConfiguracionEntrenamiento = {
        epocas: 80,
      };
      const state = inicializarFormulario(configRetro);
      expect(state.epocasPlanificadas).toBe("80");
    });
  });

  describe("validarYNormalizarConfiguracion", () => {
    const stateVacio: FormularioConfiguracionState = {
      dataset: "",
      versionDataset: "",
      numeroMuestras: "",
      divisionDatos: "",
      preprocesamiento: "",
      framework: "",
      versionFramework: "",
      batchSize: "",
      learningRate: "",
      optimizador: "",
      funcionPerdida: "",
      epocasPlanificadas: "",
      hardware: "",
      semillaAleatoria: "",
      aumentoDatos: "",
      regularizacion: "",
      observaciones: "",
      estadoVerificacion: "",
    };

    it("normaliza campos vacíos en undefined y nunca en ceros", () => {
      const res = validarYNormalizarConfiguracion(stateVacio);
      expect(res.esValido).toBe(true);
      expect(res.errores).toEqual({});
      expect(res.configuracion).toBeDefined();

      const c = res.configuracion!;
      expect(c.dataset).toBeUndefined();
      expect(c.numeroMuestras).toBeUndefined();
      expect(c.batchSize).toBeUndefined();
      expect(c.learningRate).toBeUndefined();
      expect(c.epocasPlanificadas).toBeUndefined();
      expect(c.semillaAleatoria).toBeUndefined();
      expect(c.estadoVerificacion).toBeUndefined();
    });

    it("acepta y procesa una configuración completa válida con trim", () => {
      const stateCompleto: FormularioConfiguracionState = {
        ...stateVacio,
        dataset: "  LIDC-IDRI  ",
        versionDataset: " TCIA  ",
        numeroMuestras: "1018",
        batchSize: "32",
        learningRate: "0.0005",
        epocasPlanificadas: "120",
        semillaAleatoria: "0", // Semilla cero es válida
        framework: " PyTorch ",
        estadoVerificacion: "verificado_notebook",
      };

      const res = validarYNormalizarConfiguracion(stateCompleto);
      expect(res.esValido).toBe(true);
      const c = res.configuracion!;
      expect(c.dataset).toBe("LIDC-IDRI");
      expect(c.versionDataset).toBe("TCIA");
      expect(c.numeroMuestras).toBe(1018);
      expect(c.batchSize).toBe(32);
      expect(c.learningRate).toBe(0.0005);
      expect(c.epocasPlanificadas).toBe(120);
      expect(c.semillaAleatoria).toBe(0);
      expect(c.framework).toBe("PyTorch");
      expect(c.estadoVerificacion).toBe("verificado_notebook");
    });

    it("rechaza número de muestras no entero o menor o igual a cero", () => {
      const resNegativo = validarYNormalizarConfiguracion({
        ...stateVacio,
        numeroMuestras: "-5",
      });
      expect(resNegativo.esValido).toBe(false);
      expect(resNegativo.errores.numeroMuestras).toBeDefined();

      const resDecimal = validarYNormalizarConfiguracion({
        ...stateVacio,
        numeroMuestras: "10.4",
      });
      expect(resDecimal.esValido).toBe(false);

      const resTexto = validarYNormalizarConfiguracion({
        ...stateVacio,
        numeroMuestras: "diez",
      });
      expect(resTexto.esValido).toBe(false);
    });

    it("rechaza batchSize no entero o menor o igual a cero", () => {
      const res = validarYNormalizarConfiguracion({
        ...stateVacio,
        batchSize: "0",
      });
      expect(res.esValido).toBe(false);
      expect(res.errores.batchSize).toBeDefined();
    });

    it("rechaza learningRate negativo, cero o no numérico", () => {
      const resCero = validarYNormalizarConfiguracion({
        ...stateVacio,
        learningRate: "0",
      });
      expect(resCero.esValido).toBe(false);
      expect(resCero.errores.learningRate).toBeDefined();

      const resNeg = validarYNormalizarConfiguracion({
        ...stateVacio,
        learningRate: "-0.001",
      });
      expect(resNeg.esValido).toBe(false);
    });

    it("rechaza epocasPlanificadas negativas o cero", () => {
      const res = validarYNormalizarConfiguracion({
        ...stateVacio,
        epocasPlanificadas: "-10",
      });
      expect(res.esValido).toBe(false);
      expect(res.errores.epocasPlanificadas).toBeDefined();
    });

    it("rechaza semillaAleatoria negativa pero acepta 0", () => {
      const resNeg = validarYNormalizarConfiguracion({
        ...stateVacio,
        semillaAleatoria: "-1",
      });
      expect(resNeg.esValido).toBe(false);
      expect(resNeg.errores.semillaAleatoria).toBeDefined();

      const resCero = validarYNormalizarConfiguracion({
        ...stateVacio,
        semillaAleatoria: "0",
      });
      expect(resCero.esValido).toBe(true);
      expect(resCero.configuracion?.semillaAleatoria).toBe(0);
    });

    it("rechaza estados de verificación no reconocidos", () => {
      const res = validarYNormalizarConfiguracion({
        ...stateVacio,
        estadoVerificacion: "estado_inventado",
      });
      expect(res.esValido).toBe(false);
      expect(res.errores.estadoVerificacion).toBeDefined();
    });

    it("conserva archivos preexistentes (archivoNotebook y archivoPDF)", () => {
      const configPrevia: ConfiguracionEntrenamiento = {
        archivoNotebook: "LIDC_IDRC_notebook.ipynb",
        archivoPDF: "reporte.pdf",
      };

      const res = validarYNormalizarConfiguracion(
        { ...stateVacio, dataset: "LIDC" },
        configPrevia
      );
      expect(res.esValido).toBe(true);
      expect(res.configuracion?.archivoNotebook).toBe("LIDC_IDRC_notebook.ipynb");
      expect(res.configuracion?.archivoPDF).toBe("reporte.pdf");
      expect(res.configuracion?.dataset).toBe("LIDC");
    });
  });

  describe("Interacción y simulación de callbacks", () => {
    it("simula guardado exitoso entregando el objeto normalizado", () => {
      const onGuardarMock = vi.fn();
      const state: FormularioConfiguracionState = {
        ...inicializarFormulario(undefined),
        dataset: "LIDC-IDRI",
        batchSize: "16",
        learningRate: "0.0001",
      };

      const res = validarYNormalizarConfiguracion(state);
      expect(res.esValido).toBe(true);
      if (res.configuracion) {
        onGuardarMock(res.configuracion);
      }

      expect(onGuardarMock).toHaveBeenCalledTimes(1);
      expect(onGuardarMock).toHaveBeenCalledWith(
        expect.objectContaining({
          dataset: "LIDC-IDRI",
          batchSize: 16,
          learningRate: 0.0001,
        })
      );
    });

    it("simula cancelación sin llamar a guardar", () => {
      const onCancelarMock = vi.fn();
      onCancelarMock();
      expect(onCancelarMock).toHaveBeenCalledTimes(1);
    });
  });
});
