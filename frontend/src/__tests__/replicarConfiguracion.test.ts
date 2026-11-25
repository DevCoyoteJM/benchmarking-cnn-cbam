import { describe, it, expect } from "vitest";
import {
  replicarConfiguracionExperimentos,
  type ResultadoModelo,
} from "../data/resultados";

describe("Replicación Guiada de Configuración Experimental (Fase 3.5B.2)", () => {
  const origenCompleto: ResultadoModelo = {
    id: "unet-v1",
    modeloId: "unet",
    version: "1.0",
    fecha: "2026-11-15T12:00:00Z",
    estado: "finalizado",
    tarea: "segmentacion",
    descripcion: "Experimento base U-Net con configuración metodológica completa",
    metricas: { dice: 0.895 },
    configuracion: {
      // 1. Campos comunes permitidos (12)
      dataset: "LIDC-IDRI",
      versionDataset: "v1.0 (1018 scans)",
      numeroMuestras: 1018,
      divisionDatos: "70/15/15",
      preprocesamiento: "Ventana pulmonar (-1000 a 400 HU), resize 256x256",
      framework: "PyTorch",
      versionFramework: "2.1.2+cu121",
      hardware: "NVIDIA RTX 3080 10GB",
      semillaAleatoria: 42,
      aumentoDatos: "Flips horizontales y rotaciones +/-15°",
      regularizacion: "Dropout 0.2, Weight Decay 1e-4",
      observaciones: "Entrenamiento metodológico base",

      // 2. Campos específicos prohibidos para replicación (9)
      epocas: 80,
      epocasPlanificadas: 100,
      batchSize: 16,
      learningRate: 0.0001,
      optimizador: "AdamW",
      funcionPerdida: "Combined Dice + BCE",
      archivoNotebook:
        "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb",
      archivoPDF: "reporte_unet.pdf",
      estadoVerificacion: "verificado_notebook",
    },
  };

  const destinoVacio: ResultadoModelo = {
    id: "modcbam-v1",
    modeloId: "modcbam",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    tarea: "clasificacion",
    descripcion: "Variante ModCBAM sin configuración previa",
    metricas: { f1Score: 0.82 },
  };

  const destinoConDatosPrevios: ResultadoModelo = {
    id: "transunet-v1",
    modeloId: "transunet",
    version: "1.0",
    fecha: null,
    estado: "pendiente",
    tarea: "clasificacion",
    descripcion: "TransUNet con configuración parcial previa",
    metricas: { f1Score: 0.80 },
    configuracion: {
      dataset: "LIDC-IDRI TransUNet Custom",
      framework: "PyTorch Custom",
      batchSize: 32, // Campo específico
      learningRate: 0.0005, // Campo específico
      archivoNotebook: "custom_transunet.ipynb", // Evidencia específica
      estadoVerificacion: "verificado_otra_evidencia", // Estado específico
    },
  };

  const catalogoCompleto: ResultadoModelo[] = [
    origenCompleto,
    destinoVacio,
    destinoConDatosPrevios,
  ];

  it("1. copia los campos comunes seleccionados a un destino vacío", () => {
    const res = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [destinoVacio],
      todosLosExperimentos: catalogoCompleto,
      opciones: {
        camposSeleccionados: [
          "dataset",
          "versionDataset",
          "numeroMuestras",
          "framework",
          "semillaAleatoria",
        ],
        permitirSobrescritura: false,
      },
    });

    expect(res.exito).toBe(true);
    expect(res.destinosActualizados).toHaveLength(1);

    const actual = res.destinosActualizados[0];
    expect(actual.experimentoActualizado.id).toBe("modcbam-v1");
    expect(actual.camposAgregados).toEqual([
      "dataset",
      "versionDataset",
      "numeroMuestras",
      "framework",
      "semillaAleatoria",
    ]);
    expect(actual.camposSobrescritos).toHaveLength(0);
    expect(actual.camposOmitidosPorExistir).toHaveLength(0);

    const config = actual.experimentoActualizado.configuracion;
    expect(config?.dataset).toBe("LIDC-IDRI");
    expect(config?.versionDataset).toBe("v1.0 (1018 scans)");
    expect(config?.numeroMuestras).toBe(1018);
    expect(config?.framework).toBe("PyTorch");
    expect(config?.semillaAleatoria).toBe(42);
  });

  it("2. copia simultáneamente a varios destinos en una sola operación atómica", () => {
    const res = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [destinoVacio, destinoConDatosPrevios],
      todosLosExperimentos: catalogoCompleto,
      opciones: {
        camposSeleccionados: ["dataset", "hardware", "semillaAleatoria"],
        permitirSobrescritura: true,
      },
    });

    expect(res.exito).toBe(true);
    expect(res.destinosActualizados).toHaveLength(2);
    expect(res.experimentosCompletos).toHaveLength(3);

    // Destino 1 (ModCBAM)
    const modcbam = res.experimentosCompletos.find((e) => e.id === "modcbam-v1");
    expect(modcbam?.configuracion?.dataset).toBe("LIDC-IDRI");
    expect(modcbam?.configuracion?.hardware).toBe("NVIDIA RTX 3080 10GB");
    expect(modcbam?.configuracion?.semillaAleatoria).toBe(42);

    // Destino 2 (TransUNet)
    const transunet = res.experimentosCompletos.find((e) => e.id === "transunet-v1");
    expect(transunet?.configuracion?.dataset).toBe("LIDC-IDRI");
    expect(transunet?.configuracion?.hardware).toBe("NVIDIA RTX 3080 10GB");
    expect(transunet?.configuracion?.semillaAleatoria).toBe(42);
  });

  it("3. excluye estrictamente campos no seleccionados", () => {
    const res = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [destinoVacio],
      todosLosExperimentos: catalogoCompleto,
      opciones: {
        camposSeleccionados: ["dataset"], // Solo dataset
        permitirSobrescritura: false,
      },
    });

    expect(res.exito).toBe(true);
    const config = res.destinosActualizados[0].experimentoActualizado.configuracion;
    expect(config?.dataset).toBe("LIDC-IDRI");
    expect(config?.framework).toBeUndefined();
    expect(config?.hardware).toBeUndefined();
    expect(config?.semillaAleatoria).toBeUndefined();
    expect(config?.observaciones).toBeUndefined();
  });

  it("4. nunca replica los 9 campos específicos o prohibidos", () => {
    // Intentar pasar campos prohibidos en camposSeleccionados
    const camposConProhibidos = [
      "dataset",
      "batchSize", // prohibido
      "learningRate", // prohibido
      "epocas", // prohibido
      "archivoNotebook", // prohibido
      "estadoVerificacion", // prohibido
    ] as any;

    const res = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [destinoConDatosPrevios],
      todosLosExperimentos: catalogoCompleto,
      opciones: {
        camposSeleccionados: camposConProhibidos,
        permitirSobrescritura: true,
      },
    });

    expect(res.exito).toBe(true);
    const config = res.destinosActualizados[0].experimentoActualizado.configuracion;

    // Se copió dataset
    expect(config?.dataset).toBe("LIDC-IDRI");

    // Los campos específicos de destino se conservan intactos y NO fueron sobrescritos por el origen
    expect(config?.batchSize).toBe(32); // Destino tenía 32, origen tenía 16
    expect(config?.learningRate).toBe(0.0005); // Destino tenía 0.0005, origen 0.0001
    expect(config?.archivoNotebook).toBe("custom_transunet.ipynb");
    expect(config?.estadoVerificacion).toBe("verificado_otra_evidencia");
    expect(config?.epocas).toBeUndefined(); // Destino no tenía épocas, no se copiaron las 80 del origen
  });

  it("5. campos ausentes o vacíos en el origen no borran valores existentes del destino", () => {
    const origenIncompleto: ResultadoModelo = {
      ...origenCompleto,
      configuracion: {
        dataset: "LIDC-IDRI",
        // numeroMuestras, framework, hardware, etc. son undefined
      },
    };

    const destinoConFramework: ResultadoModelo = {
      ...destinoVacio,
      configuracion: {
        framework: "TensorFlow 2.15",
      },
    };

    const res = replicarConfiguracionExperimentos({
      origen: origenIncompleto,
      destinos: [destinoConFramework],
      todosLosExperimentos: [origenIncompleto, destinoConFramework],
      opciones: {
        camposSeleccionados: ["dataset", "framework"],
        permitirSobrescritura: true,
      },
    });

    expect(res.exito).toBe(true);
    const config = res.destinosActualizados[0].experimentoActualizado.configuracion;
    expect(config?.dataset).toBe("LIDC-IDRI");
    // Framework no estaba definido en origen, por lo que NO borra el del destino
    expect(config?.framework).toBe("TensorFlow 2.15");
  });

  it("6. protege la sobrescritura cuando permitirSobrescritura = false", () => {
    const res = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [destinoConDatosPrevios],
      todosLosExperimentos: catalogoCompleto,
      opciones: {
        camposSeleccionados: ["dataset", "framework", "hardware"],
        permitirSobrescritura: false, // Desactivado
      },
    });

    expect(res.exito).toBe(true);
    const actual = res.destinosActualizados[0];

    // Se agregaron campos que destino no tenía
    expect(actual.camposAgregados).toContain("hardware");
    expect(actual.experimentoActualizado.configuracion?.hardware).toBe(
      "NVIDIA RTX 3080 10GB"
    );

    // Se omitieron campos que ya tenían valor
    expect(actual.camposOmitidosPorExistir).toContain("dataset");
    expect(actual.camposOmitidosPorExistir).toContain("framework");
    expect(actual.experimentoActualizado.configuracion?.dataset).toBe(
      "LIDC-IDRI TransUNet Custom"
    );
    expect(actual.experimentoActualizado.configuracion?.framework).toBe(
      "PyTorch Custom"
    );
  });

  it("7. permite sobrescritura solo cuando permitirSobrescritura = true con autorización", () => {
    const res = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [destinoConDatosPrevios],
      todosLosExperimentos: catalogoCompleto,
      opciones: {
        camposSeleccionados: ["dataset", "framework"],
        permitirSobrescritura: true, // Autorizado
      },
    });

    expect(res.exito).toBe(true);
    const actual = res.destinosActualizados[0];
    expect(actual.camposSobrescritos).toContain("dataset");
    expect(actual.camposSobrescritos).toContain("framework");
    expect(actual.experimentoActualizado.configuracion?.dataset).toBe("LIDC-IDRI");
    expect(actual.experimentoActualizado.configuracion?.framework).toBe(
      "PyTorch"
    );
  });

  it("8. preserva intactos IDs, métricas, tareas y descripciones", () => {
    const res = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [destinoVacio],
      todosLosExperimentos: catalogoCompleto,
      opciones: {
        camposSeleccionados: ["dataset"],
        permitirSobrescritura: false,
      },
    });

    const exp = res.destinosActualizados[0].experimentoActualizado;
    expect(exp.id).toBe("modcbam-v1");
    expect(exp.modeloId).toBe("modcbam");
    expect(exp.version).toBe("1.0");
    expect(exp.tarea).toBe("clasificacion");
    expect(exp.descripcion).toBe("Variante ModCBAM sin configuración previa");
    expect(exp.metricas).toEqual({ f1Score: 0.82 });
  });

  it("9. valida errores en lote y aborta si los parámetros son inválidos", () => {
    // Sin origen con configuración
    const resSinConfig = replicarConfiguracionExperimentos({
      origen: destinoVacio, // No tiene configuracion
      destinos: [destinoConDatosPrevios],
      todosLosExperimentos: catalogoCompleto,
      opciones: { camposSeleccionados: ["dataset"], permitirSobrescritura: false },
    });
    expect(resSinConfig.exito).toBe(false);
    expect(resSinConfig.error).toContain("no contiene configuración");

    // Sin destinos
    const resSinDestinos = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [],
      todosLosExperimentos: catalogoCompleto,
      opciones: { camposSeleccionados: ["dataset"], permitirSobrescritura: false },
    });
    expect(resSinDestinos.exito).toBe(false);
    expect(resSinDestinos.error).toContain("al menos un experimento de destino");

    // Sin campos seleccionados
    const resSinCampos = replicarConfiguracionExperimentos({
      origen: origenCompleto,
      destinos: [destinoVacio],
      todosLosExperimentos: catalogoCompleto,
      opciones: { camposSeleccionados: [], permitirSobrescritura: false },
    });
    expect(resSinCampos.exito).toBe(false);
    expect(resSinCampos.error).toContain("al menos un campo común válido");
  });
});
