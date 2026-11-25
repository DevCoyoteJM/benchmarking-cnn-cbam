import { describe, it, expect } from "vitest";
import { serializarExperimentos } from "../components/ExportarResultados";
import { validarExperimento } from "../components/ImportarResultados";
import {
  fusionarConfiguracion,
  fusionarExperimento,
  type ResultadoModelo,
  type ConfiguracionEntrenamiento,
} from "../data/resultados";

describe("Auditoría de Roundtrip: Exportación e Importación de Configuraciones (Fase 3.4B)", () => {
  const experimentoCompleto: ResultadoModelo = {
    id: "unet-v1",
    modeloId: "unet",
    version: "1.0",
    fecha: "2026-11-15T12:00:00Z",
    estado: "finalizado",
    tarea: "segmentacion",
    descripcion: "Evaluación base U-Net con configuración metodológica completa",
    metricas: {
      dice: 0.895,
      iou: 0.812,
    },
    configuracion: {
      // 1. Dataset y Preprocesamiento
      dataset: "LIDC-IDRI",
      versionDataset: "v1.0 (1018 scans)",
      numeroMuestras: 1018,
      divisionDatos: "70/15/15",
      preprocesamiento: "Ventana pulmonar (-1000 a 400 HU), resize 256x256",

      // 2. Configuración de Entrenamiento
      framework: "PyTorch",
      versionFramework: "2.1.2+cu121",
      epocas: 100,
      epocasPlanificadas: 100,
      batchSize: 16,
      learningRate: 0.0001,
      optimizador: "AdamW",
      funcionPerdida: "Combined Dice + BCE",
      hardware: "NVIDIA RTX 3080 10GB",

      // 3. Metodología y Reproducibilidad
      semillaAleatoria: 42,
      aumentoDatos: "Flips horizontales y verticales, rotaciones +/-15°",
      regularizacion: "Dropout 0.2, Weight Decay 1e-4",
      archivoNotebook:
        "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb",
      archivoPDF: "reporte_tecnico_unet.pdf",
      observaciones: "Entrenamiento convergente sin inestabilidad numérica",
      estadoVerificacion: "verificado_notebook",
    },
  };

  it("1. realiza roundtrip perfecto (Exportar -> Importar) con los 21 campos de configuración", () => {
    // Paso 1: Exportar a JSON
    const jsonExportado = serializarExperimentos([experimentoCompleto]);
    expect(typeof jsonExportado).toBe("string");

    // Paso 2: Deserializar simulando recepción de archivo
    const parsed = JSON.parse(jsonExportado) as unknown[];
    expect(parsed).toHaveLength(1);

    // Paso 3: Validar e importar mediante validarExperimento
    const importado = validarExperimento(parsed[0]);

    // Paso 4: Comparar estructuralmente
    expect(importado).toEqual(experimentoCompleto);
    expect(importado.configuracion?.versionDataset).toBe("v1.0 (1018 scans)");
    expect(importado.configuracion?.numeroMuestras).toBe(1018);
    expect(importado.configuracion?.preprocesamiento).toBe(
      "Ventana pulmonar (-1000 a 400 HU), resize 256x256"
    );
    expect(importado.configuracion?.versionFramework).toBe("2.1.2+cu121");
    expect(importado.configuracion?.epocasPlanificadas).toBe(100);
    expect(importado.configuracion?.semillaAleatoria).toBe(42);
    expect(importado.configuracion?.aumentoDatos).toBe(
      "Flips horizontales y verticales, rotaciones +/-15°"
    );
    expect(importado.configuracion?.regularizacion).toBe(
      "Dropout 0.2, Weight Decay 1e-4"
    );
    expect(importado.configuracion?.estadoVerificacion).toBe(
      "verificado_notebook"
    );
  });

  it("2. preserva estrictamente la semilla aleatoria igual a 0 sin considerarla falsy o ausente", () => {
    const conSemillaCero: ResultadoModelo = {
      ...experimentoCompleto,
      id: "unet-cbam-v1",
      modeloId: "unet-cbam",
      configuracion: {
        ...experimentoCompleto.configuracion,
        semillaAleatoria: 0,
      },
    };

    const json = serializarExperimentos([conSemillaCero]);
    const parsed = JSON.parse(json) as unknown[];
    const importado = validarExperimento(parsed[0]);

    expect(importado.configuracion?.semillaAleatoria).toBe(0);
    expect(typeof importado.configuracion?.semillaAleatoria).toBe("number");
  });

  it("3. preserva valores decimales como learningRate = 0.0001 con máxima fidelidad", () => {
    const conLrPequeno: ResultadoModelo = {
      ...experimentoCompleto,
      configuracion: {
        ...experimentoCompleto.configuracion,
        learningRate: 0.0001,
      },
    };

    const json = serializarExperimentos([conLrPequeno]);
    const parsed = JSON.parse(json) as unknown[];
    const importado = validarExperimento(parsed[0]);

    expect(importado.configuracion?.learningRate).toBe(0.0001);
  });

  it("4. mantiene los campos opcionales ausentes como undefined (sin ceros ni strings vacíos)", () => {
    const configMinima: ResultadoModelo = {
      id: "modcbam-v1",
      modeloId: "modcbam",
      version: "1.0",
      fecha: null,
      estado: "pendiente",
      tarea: "clasificacion",
      descripcion: "Variante ModCBAM básica",
      metricas: {},
      configuracion: {
        dataset: "LIDC-IDRI",
        framework: "PyTorch",
      },
    };

    const json = serializarExperimentos([configMinima]);
    const parsed = JSON.parse(json) as unknown[];
    const importado = validarExperimento(parsed[0]);

    expect(importado.configuracion?.dataset).toBe("LIDC-IDRI");
    expect(importado.configuracion?.framework).toBe("PyTorch");

    // Verificar que los campos no especificados permanecen undefined
    expect(importado.configuracion?.versionDataset).toBeUndefined();
    expect(importado.configuracion?.numeroMuestras).toBeUndefined();
    expect(importado.configuracion?.preprocesamiento).toBeUndefined();
    expect(importado.configuracion?.versionFramework).toBeUndefined();
    expect(importado.configuracion?.epocasPlanificadas).toBeUndefined();
    expect(importado.configuracion?.batchSize).toBeUndefined();
    expect(importado.configuracion?.learningRate).toBeUndefined();
    expect(importado.configuracion?.optimizador).toBeUndefined();
    expect(importado.configuracion?.funcionPerdida).toBeUndefined();
    expect(importado.configuracion?.divisionDatos).toBeUndefined();
    expect(importado.configuracion?.hardware).toBeUndefined();
    expect(importado.configuracion?.semillaAleatoria).toBeUndefined();
    expect(importado.configuracion?.aumentoDatos).toBeUndefined();
    expect(importado.configuracion?.regularizacion).toBeUndefined();
    expect(importado.configuracion?.estadoVerificacion).toBeUndefined();
    expect(importado.configuracion?.observaciones).toBeUndefined();
  });

  it("5. importa configuraciones antiguas/legadas sin propiedad configuracion", () => {
    const experimentoLegado = {
      id: "transunet-v1",
      modeloId: "transunet",
      version: "1.0",
      fecha: "2026-10-01",
      estado: "finalizado",
      tarea: "segmentacion",
      descripcion: "Respaldo antiguo sin objeto de configuración",
      metricas: { dice: 0.88 },
    };

    const json = JSON.stringify([experimentoLegado], null, 2);
    const parsed = JSON.parse(json) as unknown[];
    const importado = validarExperimento(parsed[0]);

    expect(importado.id).toBe("transunet-v1");
    expect(importado.configuracion).toBeUndefined();
    expect(importado.metricas.dice).toBe(0.88);
  });

  it("6. conserva las referencias a evidencias documentales (notebook y PDF)", () => {
    const conEvidencias: ResultadoModelo = {
      ...experimentoCompleto,
      configuracion: {
        ...experimentoCompleto.configuracion,
        archivoNotebook:
          "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb",
        archivoPDF: "analisis_estadistico.pdf",
      },
    };

    const json = serializarExperimentos([conEvidencias]);
    const parsed = JSON.parse(json) as unknown[];
    const importado = validarExperimento(parsed[0]);

    expect(importado.configuracion?.archivoNotebook).toBe(
      "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb"
    );
    expect(importado.configuracion?.archivoPDF).toBe(
      "analisis_estadistico.pdf"
    );
  });

  it("7. preserva todas las propiedades estructurales del experimento", () => {
    const json = serializarExperimentos([experimentoCompleto]);
    const parsed = JSON.parse(json) as unknown[];
    const importado = validarExperimento(parsed[0]);

    expect(importado.id).toBe(experimentoCompleto.id);
    expect(importado.modeloId).toBe(experimentoCompleto.modeloId);
    expect(importado.version).toBe(experimentoCompleto.version);
    expect(importado.fecha).toBe(experimentoCompleto.fecha);
    expect(importado.estado).toBe(experimentoCompleto.estado);
    expect(importado.tarea).toBe(experimentoCompleto.tarea);
    expect(importado.descripcion).toBe(experimentoCompleto.descripcion);
    expect(importado.metricas).toEqual(experimentoCompleto.metricas);
  });
});

describe("Auditoría de Upsert Seguro: fusión de experimentos existentes (Fase 3.4B)", () => {
  const experimentoPreexistente: ResultadoModelo = {
    id: "unet-v1",
    modeloId: "unet",
    version: "1.0",
    fecha: "2026-11-10",
    estado: "finalizado",
    tarea: "segmentacion",
    descripcion: "Experimento preexistente en localStorage",
    metricas: { dice: 0.89 },
    configuracion: {
      dataset: "LIDC-IDRI",
      versionDataset: "v1.0",
      numeroMuestras: 1018,
      framework: "PyTorch",
      versionFramework: "2.1.2",
      batchSize: 16,
      learningRate: 0.0001,
      semillaAleatoria: 42,
      archivoNotebook:
        "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb",
      archivoPDF: "reporte_unet.pdf",
      estadoVerificacion: "verificado_notebook",
    },
  };

  it("fusionarConfiguracion no elimina campos previos si la nueva configuración es parcial", () => {
    const configEntranteParcial: ConfiguracionEntrenamiento = {
      dataset: "LIDC-IDRI Extendido",
      epocasPlanificadas: 120,
    };

    const fusionada = fusionarConfiguracion(
      experimentoPreexistente.configuracion,
      configEntranteParcial
    );

    // Campos actualizados
    expect(fusionada?.dataset).toBe("LIDC-IDRI Extendido");
    expect(fusionada?.epocasPlanificadas).toBe(120);

    // Campos preexistentes que NO deben haberse perdido
    expect(fusionada?.versionDataset).toBe("v1.0");
    expect(fusionada?.numeroMuestras).toBe(1018);
    expect(fusionada?.framework).toBe("PyTorch");
    expect(fusionada?.versionFramework).toBe("2.1.2");
    expect(fusionada?.batchSize).toBe(16);
    expect(fusionada?.learningRate).toBe(0.0001);
    expect(fusionada?.semillaAleatoria).toBe(42);
    expect(fusionada?.archivoNotebook).toBe(
      "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb"
    );
    expect(fusionada?.archivoPDF).toBe("reporte_unet.pdf");
    expect(fusionada?.estadoVerificacion).toBe("verificado_notebook");
  });

  it("fusionarConfiguracion preserva la configuración preexistente si la entrante es undefined", () => {
    const fusionada = fusionarConfiguracion(
      experimentoPreexistente.configuracion,
      undefined
    );

    expect(fusionada).toEqual(experimentoPreexistente.configuracion);
  });

  it("fusionarConfiguracion permite sobrescribir un campo existente con un nuevo valor válido", () => {
    const configEntrante: ConfiguracionEntrenamiento = {
      learningRate: 0.0005,
      semillaAleatoria: 0,
      estadoVerificacion: "verificado_otra_evidencia",
    };

    const fusionada = fusionarConfiguracion(
      experimentoPreexistente.configuracion,
      configEntrante
    );

    expect(fusionada?.learningRate).toBe(0.0005);
    expect(fusionada?.semillaAleatoria).toBe(0);
    expect(fusionada?.estadoVerificacion).toBe("verificado_otra_evidencia");
    // Conserva los demás
    expect(fusionada?.dataset).toBe("LIDC-IDRI");
    expect(fusionada?.numeroMuestras).toBe(1018);
  });

  it("fusionarExperimento no destruye la configuración previa al importar un JSON legado sin configuración", () => {
    const experimentoEntranteSinConfig: ResultadoModelo = {
      id: "unet-v1",
      modeloId: "unet",
      version: "1.0",
      fecha: "2026-11-17",
      estado: "finalizado",
      tarea: "segmentacion",
      descripcion: "Respaldo antiguo sin configuración",
      metricas: { dice: 0.91, iou: 0.83 }, // Métricas actualizadas
    };

    const fusionado = fusionarExperimento(
      experimentoPreexistente,
      experimentoEntranteSinConfig
    );

    // Métricas actualizadas
    expect(fusionado.metricas.dice).toBe(0.91);
    expect(fusionado.metricas.iou).toBe(0.83);

    // Configuración PRESERVADA intacta
    expect(fusionado.configuracion).toBeDefined();
    expect(fusionado.configuracion?.dataset).toBe("LIDC-IDRI");
    expect(fusionado.configuracion?.numeroMuestras).toBe(1018);
    expect(fusionado.configuracion?.semillaAleatoria).toBe(42);
    expect(fusionado.configuracion?.archivoNotebook).toBe(
      "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb"
    );
    expect(fusionado.configuracion?.estadoVerificacion).toBe(
      "verificado_notebook"
    );
  });
});
