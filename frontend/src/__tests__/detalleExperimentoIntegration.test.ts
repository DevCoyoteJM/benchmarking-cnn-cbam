import { describe, it, expect } from "vitest";
import { actualizarConfiguracionExperimento } from "../components/DetalleExperimento";
import type {
  ResultadoModelo,
  ConfiguracionEntrenamiento,
} from "../data/resultados";

describe("Integración de DetalleExperimento y FormularioConfiguracion (Fase 3.4A)", () => {
  const experimentoBase: ResultadoModelo = {
    id: "exp-unet-001",
    modeloId: "unet",
    version: "1.0",
    fecha: "2026-11-15T10:00:00Z",
    estado: "finalizado",
    tarea: "segmentacion",
    descripcion: "Experimento base de segmentación U-Net",
    metricas: {
      dice: 0.8542,
      iou: 0.7456,
    },
    configuracion: {
      dataset: "LIDC-IDRI",
      framework: "PyTorch",
      archivoNotebook: "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb",
      archivoPDF: "reporte_unet.pdf",
      epocas: 50,
    },
  };

  it("actualiza la configuración experimental preservando todos los campos estructurales del experimento", () => {
    const nuevaConfig: ConfiguracionEntrenamiento = {
      dataset: "LIDC-IDRI",
      versionDataset: "v1.0 (1018 scans)",
      numeroMuestras: 1018,
      divisionDatos: "70/15/15",
      preprocesamiento: "Ventana pulmonar (-1000 a 400 HU), resize 256x256",
      framework: "PyTorch",
      versionFramework: "2.1.2+cu121",
      batchSize: 16,
      learningRate: 0.0001,
      optimizador: "AdamW",
      funcionPerdida: "Combined Dice + BCE",
      epocasPlanificadas: 100,
      hardware: "NVIDIA RTX 3080 10GB",
      semillaAleatoria: 42,
      aumentoDatos: "Flips horizontales/verticales, rotación ±15°",
      regularizacion: "Dropout 0.2, Weight Decay 1e-4",
      observaciones: "Entrenamiento inicial sin paradas tempranas",
      estadoVerificacion: "verificado_notebook",
    };

    const actualizado = actualizarConfiguracionExperimento(
      experimentoBase,
      nuevaConfig
    );

    // 1. Preservación absoluta de la estructura del experimento
    expect(actualizado.id).toBe(experimentoBase.id);
    expect(actualizado.modeloId).toBe(experimentoBase.modeloId);
    expect(actualizado.version).toBe(experimentoBase.version);
    expect(actualizado.fecha).toBe(experimentoBase.fecha);
    expect(actualizado.estado).toBe(experimentoBase.estado);
    expect(actualizado.tarea).toBe(experimentoBase.tarea);
    expect(actualizado.descripcion).toBe(experimentoBase.descripcion);
    expect(actualizado.metricas).toEqual(experimentoBase.metricas);

    // 2. Verificación de los nuevos campos de configuración
    expect(actualizado.configuracion?.versionDataset).toBe("v1.0 (1018 scans)");
    expect(actualizado.configuracion?.numeroMuestras).toBe(1018);
    expect(actualizado.configuracion?.divisionDatos).toBe("70/15/15");
    expect(actualizado.configuracion?.preprocesamiento).toBe(
      "Ventana pulmonar (-1000 a 400 HU), resize 256x256"
    );
    expect(actualizado.configuracion?.versionFramework).toBe("2.1.2+cu121");
    expect(actualizado.configuracion?.batchSize).toBe(16);
    expect(actualizado.configuracion?.learningRate).toBe(0.0001);
    expect(actualizado.configuracion?.optimizador).toBe("AdamW");
    expect(actualizado.configuracion?.funcionPerdida).toBe("Combined Dice + BCE");
    expect(actualizado.configuracion?.epocasPlanificadas).toBe(100);
    expect(actualizado.configuracion?.semillaAleatoria).toBe(42);
    expect(actualizado.configuracion?.aumentoDatos).toBe(
      "Flips horizontales/verticales, rotación ±15°"
    );
    expect(actualizado.configuracion?.regularizacion).toBe(
      "Dropout 0.2, Weight Decay 1e-4"
    );
    expect(actualizado.configuracion?.observaciones).toBe(
      "Entrenamiento inicial sin paradas tempranas"
    );
    expect(actualizado.configuracion?.estadoVerificacion).toBe(
      "verificado_notebook"
    );

    // 3. Preservación de evidencias preexistentes si no vinieron en nuevaConfig
    expect(actualizado.configuracion?.archivoNotebook).toBe(
      "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb"
    );
    expect(actualizado.configuracion?.archivoPDF).toBe("reporte_unet.pdf");

    // 4. Sincronización de epocas con epocasPlanificadas
    expect(actualizado.configuracion?.epocas).toBe(100);
  });

  it("mantiene intactos los objetos originales (inmutabilidad)", () => {
    const copiaInicial = JSON.parse(JSON.stringify(experimentoBase));
    const nuevaConfig: ConfiguracionEntrenamiento = {
      dataset: "Nuevo Dataset",
      epocasPlanificadas: 80,
    };

    const actualizado = actualizarConfiguracionExperimento(
      experimentoBase,
      nuevaConfig
    );

    // El objeto original no debe haber sido mutado
    expect(experimentoBase).toEqual(copiaInicial);
    expect(actualizado).not.toBe(experimentoBase);
    expect(actualizado.configuracion).not.toBe(experimentoBase.configuracion);
    expect(actualizado.configuracion?.dataset).toBe("Nuevo Dataset");
    expect(experimentoBase.configuracion?.dataset).toBe("LIDC-IDRI");
  });

  it("conserva campos undefined sin rellenar con valores artificiales o ceros", () => {
    const configMinima: ConfiguracionEntrenamiento = {
      dataset: "LIDC-IDRI",
      framework: "TensorFlow",
    };

    const expSinConfig: ResultadoModelo = {
      id: "exp-vacio-002",
      modeloId: "transunet",
      version: "1.0",
      fecha: "2026-11-15T11:00:00Z",
      estado: "pendiente",
      tarea: "clasificacion",
      descripcion: "Experimento sin configuración previa",
      metricas: {},
    };

    const actualizado = actualizarConfiguracionExperimento(
      expSinConfig,
      configMinima
    );

    expect(actualizado.configuracion?.dataset).toBe("LIDC-IDRI");
    expect(actualizado.configuracion?.framework).toBe("TensorFlow");
    expect(actualizado.configuracion?.numeroMuestras).toBeUndefined();
    expect(actualizado.configuracion?.semillaAleatoria).toBeUndefined();
    expect(actualizado.configuracion?.batchSize).toBeUndefined();
    expect(actualizado.configuracion?.epocasPlanificadas).toBeUndefined();
    expect(actualizado.configuracion?.estadoVerificacion).toBeUndefined();
  });

  it("simula el flujo de useExperimentos.actualizarExperimento actualizando solo el objetivo", () => {
    const listaInicial: ResultadoModelo[] = [
      {
        id: "unet-v1",
        modeloId: "unet",
        version: "1.0",
        fecha: "2026-11-01",
        estado: "finalizado",
        tarea: "segmentacion",
        descripcion: "U-Net",
        metricas: {},
        configuracion: { dataset: "LIDC" },
      },
      {
        id: "modcbam-v1",
        modeloId: "modcbam",
        version: "1.0",
        fecha: "2026-11-01",
        estado: "finalizado",
        tarea: "segmentacion",
        descripcion: "ModCBAM",
        metricas: {},
        configuracion: { dataset: "LIDC" },
      },
    ];

    // Simular actualizar solo unet-v1
    const unetActualizado = actualizarConfiguracionExperimento(listaInicial[0], {
      dataset: "LIDC-IDRI Extendido",
      epocasPlanificadas: 120,
      hardware: "NVIDIA A100",
    });

    const listaActualizada = listaInicial.map((item) =>
      item.id === unetActualizado.id ? unetActualizado : item
    );

    expect(listaActualizada.length).toBe(2);
    expect(listaActualizada[0].id).toBe("unet-v1");
    expect(listaActualizada[0].configuracion?.dataset).toBe(
      "LIDC-IDRI Extendido"
    );
    expect(listaActualizada[0].configuracion?.epocasPlanificadas).toBe(120);
    expect(listaActualizada[0].configuracion?.hardware).toBe("NVIDIA A100");

    // ModCBAM no debe ser tocado en absoluto
    expect(listaActualizada[1]).toBe(listaInicial[1]);
    expect(listaActualizada[1].configuracion?.dataset).toBe("LIDC");
    expect(listaActualizada[1].configuracion?.epocasPlanificadas).toBeUndefined();
  });
});
