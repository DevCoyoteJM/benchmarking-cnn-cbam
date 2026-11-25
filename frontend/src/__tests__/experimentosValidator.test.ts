import { describe, it, expect } from "vitest";
import { validarExperimento } from "../components/ImportarResultados";
import { normalizarResultadoModelo } from "../data/resultados";

describe("Validación de Resultados Experimentales (validarExperimento)", () => {
  it("acepta un experimento válido de clasificación con todas sus métricas", () => {
    const experimentoValido = {
      id: "unet-cbam-exp-1",
      modeloId: "unet-cbam",
      version: "1.0",
      fecha: "2026-10-27",
      estado: "finalizado",
      tarea: "clasificacion",
      descripcion: "Evaluación experimental de clasificación",
      metricas: {
        accuracy: 0.94,
        precision: 0.93,
        recall: 0.95,
        f1Score: 0.94,
        rocAuc: 0.96,
      },
    };

    const resultado = validarExperimento(experimentoValido);
    expect(resultado.id).toBe("unet-cbam-exp-1");
    expect(resultado.modeloId).toBe("unet-cbam");
    expect(resultado.tarea).toBe("clasificacion");
    expect(resultado.metricas.accuracy).toBe(0.94);
    expect(resultado.metricas.rocAuc).toBe(0.96);
  });

  it("acepta un experimento válido de segmentación con Dice e IoU", () => {
    const experimentoSegmentacion = {
      id: "unet-seg-1",
      modeloId: "unet",
      version: "1.0",
      fecha: "2026-10-27",
      estado: "finalizado",
      tarea: "segmentacion",
      descripcion: "Segmentación de nódulos LIDC-IDRI",
      metricas: {
        dice: 0.88,
        iou: 0.79,
      },
    };

    const resultado = validarExperimento(experimentoSegmentacion);
    expect(resultado.id).toBe("unet-seg-1");
    expect(resultado.tarea).toBe("segmentacion");
    expect(resultado.metricas.dice).toBe(0.88);
    expect(resultado.metricas.iou).toBe(0.79);
  });

  it("acepta un experimento en estado pendiente con métricas vacías", () => {
    const experimentoPendiente = {
      id: "transunet-v1",
      modeloId: "transunet",
      version: "1.0",
      fecha: null,
      estado: "pendiente",
      tarea: "sin-especificar",
      descripcion: "Evaluación inicial pendiente",
      metricas: {},
    };

    const resultado = validarExperimento(experimentoPendiente);
    expect(resultado.estado).toBe("pendiente");
    expect(resultado.metricas).toEqual({});
  });

  it("rechaza datos si no son un objeto JSON", () => {
    expect(() => validarExperimento("no es un objeto")).toThrow(
      "El experimento debe ser un objeto JSON."
    );
    expect(() => validarExperimento(null)).toThrow(
      "El experimento debe ser un objeto JSON."
    );
    expect(() => validarExperimento([1, 2, 3])).toThrow(
      "El experimento debe ser un objeto JSON."
    );
  });

  it("rechaza experimentos con campos obligatorios faltantes", () => {
    const incompleto = {
      id: "",
      modeloId: "unet",
      version: "1.0",
      descripcion: "Falta id",
      estado: "pendiente",
      metricas: {},
    };

    expect(() => validarExperimento(incompleto)).toThrow(
      "El experimento tiene campos obligatorios faltantes o inválidos."
    );
  });

  it("rechaza identificadores de modelos no registrados en el catálogo", () => {
    const modeloDesconocido = {
      id: "resnet-1",
      modeloId: "resnet50", // Modelo no perteneciente al catálogo
      version: "1.0",
      descripcion: "Modelo no registrado",
      fecha: null,
      estado: "finalizado",
      metricas: {},
    };

    expect(() => validarExperimento(modeloDesconocido)).toThrow(
      "El modelo resnet50 no está registrado."
    );
  });

  it("rechaza métricas con valores mayores a 1 o menores a 0", () => {
    const metricaMayorAUno = {
      id: "unet-1",
      modeloId: "unet",
      version: "1.0",
      descripcion: "Métrica inválida",
      fecha: null,
      estado: "finalizado",
      tarea: "clasificacion",
      metricas: {
        accuracy: 1.5, // Fuera de rango [0, 1]
      },
    };

    expect(() => validarExperimento(metricaMayorAUno)).toThrow(
      "La métrica accuracy no es válida. Debe estar entre 0 y 1."
    );

    const metricaNegativa = {
      ...metricaMayorAUno,
      metricas: { accuracy: -0.1 },
    };

    expect(() => validarExperimento(metricaNegativa)).toThrow(
      "La métrica accuracy no es válida. Debe estar entre 0 y 1."
    );
  });

  it("rechaza valores NaN e Infinity en las métricas", () => {
    const metricaNaN = {
      id: "unet-1",
      modeloId: "unet",
      version: "1.0",
      descripcion: "Métrica NaN",
      fecha: null,
      estado: "finalizado",
      tarea: "clasificacion",
      metricas: {
        accuracy: NaN,
      },
    };

    expect(() => validarExperimento(metricaNaN)).toThrow(
      "La métrica accuracy no es válida. Debe estar entre 0 y 1."
    );

    const metricaInfinita = {
      ...metricaNaN,
      metricas: { accuracy: Infinity },
    };

    expect(() => validarExperimento(metricaInfinita)).toThrow(
      "La métrica accuracy no es válida. Debe estar entre 0 y 1."
    );
  });

  it("rechaza métricas de segmentación en un experimento de clasificación", () => {
    const conflictoClasificacion = {
      id: "unet-1",
      modeloId: "unet",
      version: "1.0",
      descripcion: "Conflicto de tareas",
      fecha: null,
      estado: "finalizado",
      tarea: "clasificacion",
      metricas: {
        accuracy: 0.92,
        dice: 0.85, // Dice no corresponde a clasificación
      },
    };

    expect(() => validarExperimento(conflictoClasificacion)).toThrow(
      "Un experimento de clasificación no debe contener métricas de segmentación."
    );
  });

  it("rechaza métricas de clasificación en un experimento de segmentación", () => {
    const conflictoSegmentacion = {
      id: "unet-1",
      modeloId: "unet",
      version: "1.0",
      descripcion: "Conflicto de tareas",
      fecha: null,
      estado: "finalizado",
      tarea: "segmentacion",
      metricas: {
        dice: 0.85,
        accuracy: 0.92, // Accuracy no corresponde a segmentación
      },
    };

    expect(() => validarExperimento(conflictoSegmentacion)).toThrow(
      "Un experimento de segmentación no debe contener métricas de clasificación."
    );
  });
});

describe("Normalización de Modelos (normalizarResultadoModelo)", () => {
  it("asigna valores predeterminados seguros a campos faltantes o antiguos", () => {
    const resultadoAntiguo = {
      id: "unet-legacy",
      modeloId: "unet",
      version: "0.9",
    };

    const normalizado = normalizarResultadoModelo(resultadoAntiguo);
    expect(normalizado.id).toBe("unet-legacy");
    expect(normalizado.modeloId).toBe("unet");
    expect(normalizado.version).toBe("0.9");
    expect(normalizado.fecha).toBeNull();
    expect(normalizado.estado).toBe("pendiente");
    expect(normalizado.tarea).toBe("sin-especificar");
    expect(normalizado.descripcion).toBe("");
    expect(normalizado.metricas).toEqual({});
  });

  it("conserva intactos los campos ya existentes y válidos", () => {
    const resultadoCompleto = {
      id: "cbam-v2",
      modeloId: "unet-cbam",
      version: "2.0",
      fecha: "2026-11-01",
      estado: "finalizado" as const,
      tarea: "clasificacion" as const,
      descripcion: "Entrenamiento completado",
      metricas: { accuracy: 0.95 },
    };

    const normalizado = normalizarResultadoModelo(resultadoCompleto);
    expect(normalizado).toEqual(resultadoCompleto);
  });

  describe("Validación de Configuración Experimental Extendida (Fase 3.2)", () => {
    const experimentoBase = {
      id: "unet-cbam-config-test",
      modeloId: "unet-cbam",
      version: "1.0",
      fecha: "2026-11-17",
      estado: "finalizado",
      tarea: "segmentacion",
      descripcion: "Prueba de configuración extendida",
      metricas: { dice: 0.89 },
    };

    it("acepta los ocho campos nuevos y los metadatos de verificación", () => {
      const configCompleta = {
        ...experimentoBase,
        configuracion: {
          dataset: "LIDC-IDRI",
          versionDataset: "TCIA 2024 XML-Consensus",
          numeroMuestras: 1018,
          preprocesamiento: "Ventana [-1000, 400 HU], normalización [0, 1]",
          framework: "PyTorch",
          versionFramework: "2.1.2+cu121",
          epocas: 80,
          epocasPlanificadas: 100,
          batchSize: 16,
          learningRate: 0.0001,
          optimizador: "AdamW",
          funcionPerdida: "BCE + Dice Loss",
          divisionDatos: "70% / 15% / 15%",
          hardware: "NVIDIA A100-40GB",
          semillaAleatoria: 42,
          aumentoDatos: "Rotaciones aleatorias +/- 15 grados, Flip horizontal",
          regularizacion: "Weight Decay 1e-4, Dropout 0.2",
          observaciones: "Entrenamiento con convergencia estable",
          estadoVerificacion: "verificado_notebook",
        },
      };

      const resultado = validarExperimento(configCompleta);
      expect(resultado.configuracion?.versionDataset).toBe("TCIA 2024 XML-Consensus");
      expect(resultado.configuracion?.numeroMuestras).toBe(1018);
      expect(resultado.configuracion?.preprocesamiento).toContain("Ventana [-1000, 400 HU]");
      expect(resultado.configuracion?.versionFramework).toBe("2.1.2+cu121");
      expect(resultado.configuracion?.epocasPlanificadas).toBe(100);
      expect(resultado.configuracion?.semillaAleatoria).toBe(42);
      expect(resultado.configuracion?.aumentoDatos).toContain("Rotaciones aleatorias");
      expect(resultado.configuracion?.regularizacion).toContain("Weight Decay");
      expect(resultado.configuracion?.estadoVerificacion).toBe("verificado_notebook");
    });

    it("acepta semillaAleatoria igual a 0", () => {
      const conSemillaCero = {
        ...experimentoBase,
        configuracion: {
          semillaAleatoria: 0,
        },
      };

      const resultado = validarExperimento(conSemillaCero);
      expect(resultado.configuracion?.semillaAleatoria).toBe(0);
    });

    it("normaliza cadenas de texto aplicando trim", () => {
      const conEspacios = {
        ...experimentoBase,
        configuracion: {
          dataset: "   LIDC-IDRI   ",
          versionDataset: "  v1.0  ",
          preprocesamiento: "  normalizado  ",
        },
      };

      const resultado = validarExperimento(conEspacios);
      expect(resultado.configuracion?.dataset).toBe("LIDC-IDRI");
      expect(resultado.configuracion?.versionDataset).toBe("v1.0");
      expect(resultado.configuracion?.preprocesamiento).toBe("normalizado");
    });

    it("rechaza número de muestras negativo, decimal o no numérico", () => {
      expect(() =>
        validarExperimento({
          ...experimentoBase,
          configuracion: { numeroMuestras: -10 },
        })
      ).toThrow("El campo numeroMuestras debe ser un número entero positivo válido.");

      expect(() =>
        validarExperimento({
          ...experimentoBase,
          configuracion: { numeroMuestras: 10.5 },
        })
      ).toThrow("El campo numeroMuestras debe ser un número entero positivo válido.");

      expect(() =>
        validarExperimento({
          ...experimentoBase,
          configuracion: { numeroMuestras: "" as unknown as number },
        })
      ).toThrow("El campo numeroMuestras debe ser un número entero positivo válido.");
    });

    it("rechaza épocas planificadas negativas o cero", () => {
      expect(() =>
        validarExperimento({
          ...experimentoBase,
          configuracion: { epocasPlanificadas: 0 },
        })
      ).toThrow("El campo epocasPlanificadas debe ser un número entero positivo válido.");
    });

    it("rechaza semillaAleatoria negativa", () => {
      expect(() =>
        validarExperimento({
          ...experimentoBase,
          configuracion: { semillaAleatoria: -1 },
        })
      ).toThrow("El campo semillaAleatoria debe ser un entero mayor o igual a cero.");
    });

    it("rechaza estadoVerificacion con valor no reconocido", () => {
      expect(() =>
        validarExperimento({
          ...experimentoBase,
          configuracion: { estadoVerificacion: "invalido_total" },
        })
      ).toThrow("El campo estadoVerificacion debe ser uno de: pendiente, verificado_notebook, verificado_otra_evidencia.");
    });

    it("conserva configuraciones antiguas y no transforma campos ausentes en cero", () => {
      const configAntigua = {
        ...experimentoBase,
        configuracion: {
          dataset: "LIDC-IDRI",
          batchSize: 16,
        },
      };

      const resultado = validarExperimento(configAntigua);
      expect(resultado.configuracion?.dataset).toBe("LIDC-IDRI");
      expect(resultado.configuracion?.batchSize).toBe(16);
      expect(resultado.configuracion?.numeroMuestras).toBeUndefined();
      expect(resultado.configuracion?.semillaAleatoria).toBeUndefined();
      expect(resultado.configuracion?.epocasPlanificadas).toBeUndefined();
      expect(resultado.configuracion?.versionDataset).toBeUndefined();
    });

    it("rechaza campos de configuración no reconocidos", () => {
      expect(() =>
        validarExperimento({
          ...experimentoBase,
          configuracion: { campoInventado: "valor" },
        })
      ).toThrow("Campo de configuración no reconocido: campoInventado.");
    });
  });

  describe("Validación de MCC en [-1, 1] (Fase 3.5B.1)", () => {
    const expBaseClasificacion = {
      id: "mcc-test-exp",
      modeloId: "modcbam",
      version: "1.0",
      fecha: "2026-11-17",
      estado: "finalizado",
      tarea: "clasificacion",
      descripcion: "Pruebas de validación de MCC",
    };

    it("acepta MCC = -1 (extremo inferior válido)", () => {
      const res = validarExperimento({
        ...expBaseClasificacion,
        metricas: { mcc: -1 },
      });
      expect(res.metricas.mcc).toBe(-1);
    });

    it("acepta MCC = -0.5 (valor negativo intermedio)", () => {
      const res = validarExperimento({
        ...expBaseClasificacion,
        metricas: { mcc: -0.5 },
      });
      expect(res.metricas.mcc).toBe(-0.5);
    });

    it("acepta MCC = 0 (punto neutro)", () => {
      const res = validarExperimento({
        ...expBaseClasificacion,
        metricas: { mcc: 0 },
      });
      expect(res.metricas.mcc).toBe(0);
    });

    it("acepta MCC = 0.75 (valor positivo intermedio)", () => {
      const res = validarExperimento({
        ...expBaseClasificacion,
        metricas: { mcc: 0.75 },
      });
      expect(res.metricas.mcc).toBe(0.75);
    });

    it("acepta MCC = 1 (extremo superior válido)", () => {
      const res = validarExperimento({
        ...expBaseClasificacion,
        metricas: { mcc: 1 },
      });
      expect(res.metricas.mcc).toBe(1);
    });

    it("rechaza MCC = -1.01 (por debajo del límite inferior)", () => {
      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { mcc: -1.01 },
        })
      ).toThrow("La métrica mcc no es válida. Debe estar entre -1 y 1.");
    });

    it("rechaza MCC = 1.01 (por encima del límite superior)", () => {
      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { mcc: 1.01 },
        })
      ).toThrow("La métrica mcc no es válida. Debe estar entre -1 y 1.");
    });

    it("rechaza MCC cuando es NaN, Infinity o -Infinity", () => {
      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { mcc: NaN },
        })
      ).toThrow("La métrica mcc no es válida. Debe estar entre -1 y 1.");

      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { mcc: Infinity },
        })
      ).toThrow("La métrica mcc no es válida. Debe estar entre -1 y 1.");

      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { mcc: -Infinity },
        })
      ).toThrow("La métrica mcc no es válida. Debe estar entre -1 y 1.");
    });

    it("garantiza que las demás métricas conserven sus rangos originales [0, 1]", () => {
      // accuracy negativo rechazado
      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { accuracy: -0.01 },
        })
      ).toThrow("La métrica accuracy no es válida. Debe estar entre 0 y 1.");

      // precision mayor a 1 rechazado
      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { precision: 1.05 },
        })
      ).toThrow("La métrica precision no es válida. Debe estar entre 0 y 1.");

      // f1Score negativo rechazado
      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { f1Score: -0.2 },
        })
      ).toThrow("La métrica f1Score no es válida. Debe estar entre 0 y 1.");

      // rocAuc mayor a 1 rechazado
      expect(() =>
        validarExperimento({
          ...expBaseClasificacion,
          metricas: { rocAuc: 1.1 },
        })
      ).toThrow("La métrica rocAuc no es válida. Debe estar entre 0 y 1.");

      // métricas válidas simultáneamente con MCC negativo
      const simultaneas = validarExperimento({
        ...expBaseClasificacion,
        metricas: {
          mcc: -0.3421,
          accuracy: 0.85,
          f1Score: 0.82,
        },
      });
      expect(simultaneas.metricas.mcc).toBe(-0.3421);
      expect(simultaneas.metricas.accuracy).toBe(0.85);
      expect(simultaneas.metricas.f1Score).toBe(0.82);
    });

    it("mantiene ausentes las métricas no registradas sin forzar ceros", () => {
      const res = validarExperimento({
        ...expBaseClasificacion,
        metricas: { mcc: -0.4 },
      });

      expect(res.metricas.mcc).toBe(-0.4);
      expect(res.metricas.accuracy).toBeUndefined();
      expect(res.metricas.precision).toBeUndefined();
      expect(res.metricas.recall).toBeUndefined();
      expect(res.metricas.f1Score).toBeUndefined();
      expect(res.metricas.rocAuc).toBeUndefined();
      expect(res.metricas.dice).toBeUndefined();
      expect(res.metricas.iou).toBeUndefined();
    });
  });
});
