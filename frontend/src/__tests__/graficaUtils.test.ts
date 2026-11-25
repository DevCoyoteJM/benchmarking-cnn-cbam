import { describe, it, expect } from "vitest";
import {
  esValorMetricaValido,
  construirDatosEpocas,
  formatearMetrica,
  formatearPerdida,
  obtenerResumenE1,
  obtenerResumenE2,
  obtenerInfoHistorialExperimento,
  formatearFecha,
} from "../utils/graficaUtils";
import type { RegistroHistorialEntrenamiento } from "../data/historialEntrenamiento";
import type { ResultadoModelo } from "../data/resultados";

describe("Utilidades de Gráficas (graficaUtils)", () => {
  describe("esValorMetricaValido", () => {
    it("acepta números finitos en el rango [0, 1]", () => {
      expect(esValorMetricaValido(0)).toBe(true);
      expect(esValorMetricaValido(1)).toBe(true);
      expect(esValorMetricaValido(0.854)).toBe(true);
    });

    it("rechaza números negativos, mayores a 1, NaN o Infinity", () => {
      expect(esValorMetricaValido(-0.01)).toBe(false);
      expect(esValorMetricaValido(1.05)).toBe(false);
      expect(esValorMetricaValido(NaN)).toBe(false);
      expect(esValorMetricaValido(Infinity)).toBe(false);
    });

    it("rechaza tipos no numéricos", () => {
      expect(esValorMetricaValido("0.5")).toBe(false);
      expect(esValorMetricaValido(null)).toBe(false);
      expect(esValorMetricaValido(undefined)).toBe(false);
      expect(esValorMetricaValido({})).toBe(false);
    });
  });

  describe("construirDatosEpocas (Mapeo de series por época)", () => {
    it("retorna arreglo vacío si la lista de historiales está vacía", () => {
      const resultado = construirDatosEpocas([], "E1", ["train_loss"]);
      expect(resultado).toEqual([]);
    });

    it("retorna arreglo vacío si los modelos no tienen la etapa solicitada", () => {
      const historiales: RegistroHistorialEntrenamiento[] = [
        {
          id: "1",
          modeloId: "unet",
          nombreArchivo: "UNet_historial.json",
          fechaImportacion: new Date().toISOString(),
          etapas: {
            E1: { train_loss: [0.5, 0.4] },
          },
        },
      ];

      // Se solicita E2 cuando solo hay E1
      const resultado = construirDatosEpocas(historiales, "E2", ["train_loss"]);
      expect(resultado).toEqual([]);
    });

    it("genera puntos secuenciales de épocas respetando valores de un único modelo", () => {
      const historiales: RegistroHistorialEntrenamiento[] = [
        {
          id: "1",
          modeloId: "unet",
          nombreArchivo: "UNet_historial.json",
          fechaImportacion: new Date().toISOString(),
          etapas: {
            E1: {
              train_loss: [0.65, 0.45, 0.32],
              val_loss: [0.68, 0.48, 0.35],
            },
          },
        },
      ];

      const resultado = construirDatosEpocas(historiales, "E1", [
        "train_loss",
        "val_loss",
      ]);

      expect(resultado).toHaveLength(3);
      expect(resultado[0]).toEqual({
        epoca: 1,
        unet_train_loss: 0.65,
        unet_val_loss: 0.68,
      });
      expect(resultado[1]).toEqual({
        epoca: 2,
        unet_train_loss: 0.45,
        unet_val_loss: 0.48,
      });
      expect(resultado[2]).toEqual({
        epoca: 3,
        unet_train_loss: 0.32,
        unet_val_loss: 0.35,
      });
    });

    it("compara modelos con longitudes de épocas diferentes sin sustituir valores faltantes por cero", () => {
      const historiales: RegistroHistorialEntrenamiento[] = [
        {
          id: "unet-1",
          modeloId: "unet",
          nombreArchivo: "UNet_historial.json",
          fechaImportacion: new Date().toISOString(),
          etapas: {
            E1: {
              val_dice: [0.7, 0.8], // 2 épocas
            },
          },
        },
        {
          id: "cbam-1",
          modeloId: "unet-cbam",
          nombreArchivo: "CBAM_historial.json",
          fechaImportacion: new Date().toISOString(),
          etapas: {
            E1: {
              val_dice: [0.72, 0.82, 0.89, 0.93], // 4 épocas
            },
          },
        },
      ];

      const resultado = construirDatosEpocas(historiales, "E1", ["val_dice"]);

      // Debe calcular la longitud máxima (4 épocas)
      expect(resultado).toHaveLength(4);

      // Épocas 1 y 2 tienen datos para ambos modelos
      expect(resultado[0].unet_val_dice).toBe(0.7);
      expect(resultado[0]["unet-cbam_val_dice"]).toBe(0.72);
      expect(resultado[1].unet_val_dice).toBe(0.8);
      expect(resultado[1]["unet-cbam_val_dice"]).toBe(0.82);

      // Épocas 3 y 4 deben ser null para unet (NUNCA 0)
      expect(resultado[2].unet_val_dice).toBeNull();
      expect(resultado[2]["unet-cbam_val_dice"]).toBe(0.89);

      expect(resultado[3].unet_val_dice).toBeNull();
      expect(resultado[3]["unet-cbam_val_dice"]).toBe(0.93);
    });

    it("funciona con claves en minúsculas ('e1', 'e2') de forma resiliente", () => {
      const historiales = [
        {
          id: "mod-1",
          modeloId: "modcbam",
          nombreArchivo: "ModCBAM_historial.json",
          fechaImportacion: new Date().toISOString(),
          etapas: {
            e2: {
              val_mcc: [0.65],
            },
          },
        },
      ] as unknown as RegistroHistorialEntrenamiento[];

      const resultado = construirDatosEpocas(historiales, "E2", ["val_mcc"]);
      expect(resultado).toHaveLength(1);
      expect(resultado[0].modcbam_val_mcc).toBe(0.65);
    });
  });

  describe("formatearMetrica y formatearPerdida", () => {
    it("formatea números válidos como porcentaje y como decimal", () => {
      expect(formatearMetrica(0.895, { porcentaje: true })).toBe("89.50%");
      expect(formatearMetrica(0.7293, { decimales: 4 })).toBe("0.7293");
    });

    it("retorna 'No disponible' ante valores nulos, indefinidos o NaN", () => {
      expect(formatearMetrica(null)).toBe("No disponible");
      expect(formatearMetrica(undefined)).toBe("No disponible");
      expect(formatearMetrica(NaN)).toBe("No disponible");
    });

    it("formatearPerdida combina Train y Val con precisión de 4 decimales", () => {
      expect(formatearPerdida(0.0465, 0.1766)).toBe("Train: 0.0465 | Val: 0.1766");
      expect(formatearPerdida(null, 0.1766)).toBe("Val: 0.1766");
      expect(formatearPerdida(null, null)).toBe("No disponible");
    });
  });

  describe("obtenerResumenE1 y obtenerResumenE2 (Separación metodológica)", () => {
    const historialPrueba: RegistroHistorialEntrenamiento = {
      id: "h-unet",
      modeloId: "unet",
      nombreArchivo: "UNet_historial.json",
      fechaImportacion: new Date().toISOString(),
      etapas: {
        E1: {
          train_loss: [0.65, 0.45, 0.0465],
          val_loss: [0.68, 0.48, 0.1766],
          val_dice: [0.72, 0.895, 0.8842],
        },
        E2: {
          train_loss: [0.55, 0.38, 0.176],
          val_loss: [0.59, 0.42, 0.36],
          val_mcc: [0.61, 0.7276, 0.7143],
          val_f1: [0.75, 0.8573, 0.8496],
        },
      },
    };

    it("obtenerResumenE1 extrae el mejor Dice, Dice final, épocas reales y pérdida final", () => {
      const resumenE1 = obtenerResumenE1("unet", "U-Net", historialPrueba);
      expect(resumenE1.epocas).toBe(3);
      expect(resumenE1.mejorValDice).toBe(0.895);
      expect(resumenE1.valDiceFinal).toBe(0.8842);
      expect(resumenE1.iou).toBeNull(); // IoU no computado en el JSON -> null
      expect(resumenE1.trainLossFinal).toBe(0.0465);
      expect(resumenE1.valLossFinal).toBe(0.1766);
    });

    it("obtenerResumenE2 extrae mejor MCC, MCC final, mejor F1, F1 final y no inventa Accuracy", () => {
      const resumenE2 = obtenerResumenE2("unet", "U-Net", historialPrueba);
      expect(resumenE2.epocas).toBe(3);
      expect(resumenE2.mejorValMcc).toBe(0.7276);
      expect(resumenE2.valMccFinal).toBe(0.7143);
      expect(resumenE2.mejorValF1).toBe(0.8573);
      expect(resumenE2.valF1Final).toBe(0.8496);
      expect(resumenE2.accuracy).toBeNull(); // Accuracy no está en el historial E2 -> null
      expect(resumenE2.rocAuc).toBeNull(); // ROC-AUC no está en el historial E2 -> null
    });

    it("incorpora IoU o Accuracy si el experimento correspondiente los especifica", () => {
      const expSegmentacion: ResultadoModelo = {
        id: "exp-1",
        modeloId: "unet",
        version: "1.0",
        fecha: null,
        estado: "finalizado",
        tarea: "segmentacion",
        descripcion: "",
        metricas: { iou: 0.812 },
      };

      const resumenE1 = obtenerResumenE1("unet", "U-Net", historialPrueba, expSegmentacion);
      expect(resumenE1.iou).toBe(0.812);

      const expClasificacion: ResultadoModelo = {
        id: "exp-2",
        modeloId: "unet",
        version: "1.0",
        fecha: null,
        estado: "finalizado",
        tarea: "clasificacion",
        descripcion: "",
        metricas: { accuracy: 0.942, rocAuc: 0.965 },
      };

      const resumenE2 = obtenerResumenE2("unet", "U-Net", historialPrueba, expClasificacion);
      expect(resumenE2.accuracy).toBe(0.942);
      expect(resumenE2.rocAuc).toBe(0.965);
    });
  });

  describe("obtenerInfoHistorialExperimento", () => {
    it("retorna estado Pendiente y valores nulos si no hay historial", () => {
      const info = obtenerInfoHistorialExperimento(undefined);
      expect(info.tieneHistorial).toBe(false);
      expect(info.archivoOrigen).toBeNull();
      expect(info.fechaImportacion).toBeNull();
      expect(info.e1Disponible).toBe(false);
      expect(info.epocasE1).toBeNull();
      expect(info.e2Disponible).toBe(false);
      expect(info.epocasE2).toBeNull();
      expect(info.estadoCalculado).toBe("Pendiente");
    });

    it("extrae épocas exactas de E1 (80) y E2 (100) para U-Net", () => {
      const histUNet: RegistroHistorialEntrenamiento = {
        id: "hist-unet",
        modeloId: "unet",
        nombreArchivo: "UNet_historial.json",
        fechaImportacion: "2026-11-17T18:00:00.000Z",
        etapas: {
          E1: {
            train_loss: new Array(80).fill(0.1),
            val_loss: new Array(80).fill(0.2),
            val_dice: new Array(80).fill(0.89),
          },
          E2: {
            train_loss: new Array(100).fill(0.15),
            val_loss: new Array(100).fill(0.25),
            val_mcc: new Array(100).fill(0.72),
            val_f1: new Array(100).fill(0.85),
          },
        },
      };

      const info = obtenerInfoHistorialExperimento(histUNet);
      expect(info.tieneHistorial).toBe(true);
      expect(info.archivoOrigen).toBe("UNet_historial.json");
      expect(info.fechaImportacion).toBe("2026-11-17T18:00:00.000Z");
      expect(info.e1Disponible).toBe(true);
      expect(info.epocasE1).toBe(80);
      expect(info.e2Disponible).toBe(true);
      expect(info.epocasE2).toBe(100);
      expect(info.estadoCalculado).toBe("Con historial");
    });

    it("extrae épocas exactas de E1 (48) y E2 (100) para U-Net + CBAM", () => {
      const histCBAM: RegistroHistorialEntrenamiento = {
        id: "hist-cbam",
        modeloId: "unet-cbam",
        nombreArchivo: "CBAM_historial.json",
        fechaImportacion: "2026-11-17T18:05:00.000Z",
        etapas: {
          E1: {
            train_loss: new Array(48).fill(0.5),
            val_loss: new Array(48).fill(0.52),
            val_dice: new Array(48).fill(0.87),
          },
          E2: {
            train_loss: new Array(100).fill(0.2),
            val_loss: new Array(100).fill(0.31),
            val_mcc: new Array(100).fill(0.729),
            val_f1: new Array(100).fill(0.86),
          },
        },
      };

      const info = obtenerInfoHistorialExperimento(histCBAM);
      expect(info.epocasE1).toBe(48);
      expect(info.epocasE2).toBe(100);
      expect(info.estadoCalculado).toBe("Con historial");
    });

    it("extrae épocas exactas de E1 (75) para ModCBAM y E1 (106) para TransUNet", () => {
      const histModCBAM: RegistroHistorialEntrenamiento = {
        id: "hist-modcbam",
        modeloId: "modcbam",
        nombreArchivo: "ModCBAM_historial.json",
        fechaImportacion: "2026-11-17T18:10:00.000Z",
        etapas: {
          E1: { train_loss: new Array(75).fill(0.04), val_dice: new Array(75).fill(0.89) },
          E2: { val_mcc: new Array(100).fill(0.73) },
        },
      };
      const infoMod = obtenerInfoHistorialExperimento(histModCBAM);
      expect(infoMod.epocasE1).toBe(75);
      expect(infoMod.epocasE2).toBe(100);

      const histTrans: RegistroHistorialEntrenamiento = {
        id: "hist-transunet",
        modeloId: "transunet",
        nombreArchivo: "TransUNet_historial.json",
        fechaImportacion: "2026-11-17T18:15:00.000Z",
        etapas: {
          E1: { train_loss: new Array(106).fill(0.02), val_dice: new Array(106).fill(0.896) },
          E2: { val_mcc: new Array(100).fill(0.68) },
        },
      };
      const infoTrans = obtenerInfoHistorialExperimento(histTrans);
      expect(infoTrans.epocasE1).toBe(106);
      expect(infoTrans.epocasE2).toBe(100);
    });
  });

  describe("formatearFecha", () => {
    it("devuelve 'Sin registrar' para valores nulos o vacíos", () => {
      expect(formatearFecha(null)).toBe("Sin registrar");
      expect(formatearFecha(undefined)).toBe("Sin registrar");
      expect(formatearFecha("")).toBe("Sin registrar");
    });

    it("formatea fechas ISO correctamente", () => {
      const resultado = formatearFecha("2026-11-17T18:30:00.000Z");
      expect(resultado).not.toBe("Sin registrar");
      expect(resultado).toContain("2026");
    });
  });
});
