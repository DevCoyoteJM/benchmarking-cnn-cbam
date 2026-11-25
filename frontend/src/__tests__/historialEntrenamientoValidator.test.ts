import { describe, it, expect } from "vitest";
import {
  validarHistorial,
  mapaNombresModelos,
} from "../components/ImportarHistorialEntrenamiento";

describe("Validación de Historiales de Entrenamiento (validarHistorial)", () => {
  it("acepta un historial válido con etapa E1 (segmentación)", () => {
    const historialE1 = {
      E1: {
        train_loss: [0.65, 0.45, 0.32],
        val_loss: [0.68, 0.48, 0.35],
        val_dice: [0.72, 0.81, 0.88],
      },
    };

    expect(validarHistorial(historialE1)).toBe(true);
  });

  it("acepta un historial válido con etapa E2 (clasificación de malignidad)", () => {
    const historialE2 = {
      E2: {
        train_loss: [0.55, 0.38, 0.25],
        val_loss: [0.59, 0.42, 0.29],
        val_mcc: [0.61, 0.74, 0.82],
        val_f1: [0.75, 0.84, 0.89],
      },
    };

    expect(validarHistorial(historialE2)).toBe(true);
  });

  it("acepta un historial que contenga ambas etapas E1 y E2 con diferente número de épocas", () => {
    const historialCompleto = {
      E1: {
        train_loss: [0.7, 0.6, 0.5, 0.4], // 4 épocas
        val_loss: [0.72, 0.62, 0.52, 0.42],
        val_dice: [0.65, 0.72, 0.8, 0.85],
      },
      E2: {
        train_loss: [0.8, 0.6], // 2 épocas
        val_loss: [0.82, 0.63],
        val_mcc: [0.5, 0.7],
        val_f1: [0.6, 0.8],
      },
    };

    expect(validarHistorial(historialCompleto)).toBe(true);
  });

  it("rechaza si no es un objeto o es un arreglo o null", () => {
    expect(validarHistorial(null)).toBe(false);
    expect(validarHistorial("texto")).toBe(false);
    expect(validarHistorial([1, 2, 3])).toBe(false);
    expect(validarHistorial({})).toBe(false); // Objeto sin etapas
  });

  it("rechaza si una etapa no tiene métricas o es un objeto vacío", () => {
    const etapaVacia = {
      E1: {},
    };

    expect(validarHistorial(etapaVacia)).toBe(false);
  });

  it("rechaza si una serie de métricas es un arreglo vacío", () => {
    const serieVacia = {
      E1: {
        train_loss: [],
      },
    };

    expect(validarHistorial(serieVacia)).toBe(false);
  });

  it("rechaza si contiene métricas no permitidas", () => {
    const metricaInvalida = {
      E1: {
        train_loss: [0.5, 0.4],
        accuracy_ficticia: [0.9, 0.95], // Métrica no contemplada
      },
    };

    expect(validarHistorial(metricaInvalida)).toBe(false);
  });

  it("rechaza si los arreglos contienen valores NaN o Infinity", () => {
    const conNaN = {
      E1: {
        train_loss: [0.5, NaN, 0.3],
      },
    };

    expect(validarHistorial(conNaN)).toBe(false);

    const conInfinity = {
      E1: {
        train_loss: [0.5, Infinity, 0.3],
      },
    };

    expect(validarHistorial(conInfinity)).toBe(false);
  });

  it("rechaza si los arreglos contienen cadenas de texto en lugar de números", () => {
    const conStrings = {
      E1: {
        train_loss: [0.5, "0.4", 0.3],
      },
    };

    expect(validarHistorial(conStrings)).toBe(false);
  });
});

describe("Mapeo de Nombres de Archivo a Modelos", () => {
  it("mapea correctamente los archivos oficiales de los 4 modelos", () => {
    expect(mapaNombresModelos["unet"]).toBe("unet");
    expect(mapaNombresModelos["cbam"]).toBe("unet-cbam");
    expect(mapaNombresModelos["modcbam"]).toBe("modcbam");
    expect(mapaNombresModelos["transunet"]).toBe("transunet");
  });

  it("retorna undefined para archivos no reconocidos", () => {
    expect(mapaNombresModelos["resnet"]).toBeUndefined();
    expect(mapaNombresModelos["vgg16"]).toBeUndefined();
  });
});
