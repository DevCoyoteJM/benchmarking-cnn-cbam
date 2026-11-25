import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";

import {
  abrirBaseDatos,
  guardarEvidencia,
  consultarEvidencias,
  borrarEvidencia,
  guardarHistorial,
  consultarHistoriales,
  borrarHistorial,
  STORE_ARCHIVOS,
  STORE_HISTORIALES,
  esNombreNotebookCompartido,
  esEvidenciaAsociada,
  EXPERIMENTOS_CANONICOS,
  asegurarEvidenciasCompartidas,
} from "../services/storage/indexedDBService";
import type { Evidencia } from "../services/storage/storageTypes";
import type { RegistroHistorialEntrenamiento } from "../data/historialEntrenamiento";

describe("Servicio IndexedDB (indexedDBService) con fake-indexeddb", () => {
  beforeEach(async () => {
    // Limpiar base de datos antes de cada prueba
    const dbs = await indexedDB.databases?.();
    if (dbs) {
      for (const dbInfo of dbs) {
        if (dbInfo.name) {
          indexedDB.deleteDatabase(dbInfo.name);
        }
      }
    } else {
      indexedDB.deleteDatabase("pulmovision_evidencias");
    }
  });

  describe("abrirBaseDatos y estructura de esquemas", () => {
    it("crea la base de datos versión 2 con los almacenes 'archivos' e 'historiales_entrenamiento'", async () => {
      const db = await abrirBaseDatos();
      expect(db.name).toBe("pulmovision_evidencias");
      expect(db.version).toBe(2);
      expect(db.objectStoreNames.contains(STORE_ARCHIVOS)).toBe(true);
      expect(db.objectStoreNames.contains(STORE_HISTORIALES)).toBe(true);
      db.close();
    });

    it("el almacén de historiales incluye el índice secundario 'modeloId'", async () => {
      const db = await abrirBaseDatos();
      const tx = db.transaction(STORE_HISTORIALES, "readonly");
      const store = tx.objectStore(STORE_HISTORIALES);
      expect(store.indexNames.contains("modeloId")).toBe(true);
      db.close();
    });
  });

  describe("CRUD de Evidencias (Archivos binarios PDF y Notebooks IPYNB)", () => {
    const evidenciaNotebook: Evidencia = {
      id: "evidencia-nb-1",
      experimentoId: "exp-unet-v1",
      nombre: "entrenamiento_unet.ipynb",
      tipo: "ipynb",
      fecha: new Date().toISOString(),
      archivo: new Blob(['{"cells": [{"cell_type": "code"}]}'], { type: "application/json" }),
    };

    const evidenciaPDF: Evidencia = {
      id: "evidencia-pdf-2",
      experimentoId: "exp-cbam-v1",
      nombre: "reporte_metodologico.pdf",
      tipo: "pdf",
      fecha: new Date().toISOString(),
      archivo: new Blob(["%PDF-1.4 dummy binary content"], { type: "application/pdf" }),
    };

    it("guarda y consulta evidencias conservando metadatos y contenido binario", async () => {
      await guardarEvidencia(evidenciaNotebook);
      await guardarEvidencia(evidenciaPDF);

      const lista = await consultarEvidencias();

      expect(lista).toHaveLength(2);
      const nb = lista.find((e) => e.id === "evidencia-nb-1");
      const pdf = lista.find((e) => e.id === "evidencia-pdf-2");

      expect(nb).toBeDefined();
      expect(nb?.tipo).toBe("ipynb");
      expect(nb?.experimentoId).toBe("exp-unet-v1");

      expect(pdf).toBeDefined();
      expect(pdf?.tipo).toBe("pdf");
      expect(pdf?.nombre).toBe("reporte_metodologico.pdf");

      // Verificar que el Blob conserve su tamaño original
      expect(pdf?.archivo.size).toBeGreaterThan(0);
    });

    it("elimina una evidencia por su ID sin afectar a las demás", async () => {
      await guardarEvidencia(evidenciaNotebook);
      await guardarEvidencia(evidenciaPDF);

      let lista = await consultarEvidencias();
      expect(lista).toHaveLength(2);

      await borrarEvidencia("evidencia-nb-1");
      lista = await consultarEvidencias();

      expect(lista).toHaveLength(1);
      expect(lista[0].id).toBe("evidencia-pdf-2");
    });

    it("retorna lista vacía si no hay evidencias almacenadas", async () => {
      const lista = await consultarEvidencias();
      expect(lista).toEqual([]);
    });

    it("intentar borrar una evidencia inexistente se completa sin lanzar error", async () => {
      await expect(borrarEvidencia("id-inexistente")).resolves.toBeUndefined();
    });
  });

  describe("CRUD de Historiales de Entrenamiento (Métricas por época E1 y E2)", () => {
    const historialUnet: RegistroHistorialEntrenamiento = {
      id: "historial-unet",
      modeloId: "unet",
      nombreArchivo: "UNet_historial.json",
      fechaImportacion: new Date().toISOString(),
      etapas: {
        E1: {
          train_loss: [0.65, 0.45, 0.32],
          val_loss: [0.68, 0.48, 0.35],
          val_dice: [0.72, 0.81, 0.88],
        },
        E2: {
          train_loss: [0.55, 0.38, 0.25],
          val_loss: [0.59, 0.42, 0.29],
          val_mcc: [0.61, 0.74, 0.82],
          val_f1: [0.75, 0.84, 0.89],
        },
      },
    };

    const historialCBAM: RegistroHistorialEntrenamiento = {
      id: "historial-cbam",
      modeloId: "unet-cbam",
      nombreArchivo: "CBAM_historial.json",
      fechaImportacion: new Date().toISOString(),
      etapas: {
        E1: {
          train_loss: [0.60, 0.40],
          val_loss: [0.62, 0.42],
          val_dice: [0.78, 0.89],
        },
      },
    };

    it("permite la coexistencia de historiales de distintas arquitecturas", async () => {
      await guardarHistorial(historialUnet);
      await guardarHistorial(historialCBAM);

      const lista = await consultarHistoriales();

      expect(lista).toHaveLength(2);
      const unet = lista.find((h) => h.modeloId === "unet");
      const cbam = lista.find((h) => h.modeloId === "unet-cbam");

      expect(unet).toBeDefined();
      expect(unet?.etapas.E1?.val_dice).toHaveLength(3);
      expect(unet?.etapas.E2?.val_mcc).toHaveLength(3);

      expect(cbam).toBeDefined();
      expect(cbam?.etapas.E1?.val_dice).toHaveLength(2);
    });

    it("actualiza un historial existente atómicamente cuando coincide el ID", async () => {
      await guardarHistorial(historialUnet);

      const historialModificado: RegistroHistorialEntrenamiento = {
        ...historialUnet,
        nombreArchivo: "UNet_historial_v2.json",
        etapas: {
          ...historialUnet.etapas,
          E1: {
            train_loss: [0.5, 0.2],
            val_loss: [0.6, 0.3],
            val_dice: [0.75, 0.95],
          },
        },
      };

      await guardarHistorial(historialModificado);
      const lista = await consultarHistoriales();

      expect(lista).toHaveLength(1);
      expect(lista[0].nombreArchivo).toBe("UNet_historial_v2.json");
      expect(lista[0].etapas.E1?.val_dice).toEqual([0.75, 0.95]);
    });

    it("elimina un historial de entrenamiento por su ID", async () => {
      await guardarHistorial(historialUnet);
      let lista = await consultarHistoriales();
      expect(lista).toHaveLength(1);

      await borrarHistorial("historial-unet");
      lista = await consultarHistoriales();
      expect(lista).toHaveLength(0);
    });

    it("retorna lista vacía si no hay historiales almacenados", async () => {
      const lista = await consultarHistoriales();
      expect(lista).toEqual([]);
    });

    it("borrar un historial inexistente se completa sin lanzar error", async () => {
      await expect(borrarHistorial("id-inexistente")).resolves.toBeUndefined();
    });
  });

  describe("Coexistencia de almacenes independientes", () => {
    it("operaciones en 'archivos' no alteran el almacén 'historiales_entrenamiento'", async () => {
      const historial: RegistroHistorialEntrenamiento = {
        id: "historial-test",
        modeloId: "modcbam",
        nombreArchivo: "ModCBAM_historial.json",
        fechaImportacion: new Date().toISOString(),
        etapas: { E1: { train_loss: [0.4] } },
      };

      const evidencia: Evidencia = {
        id: "evidencia-test",
        experimentoId: "exp-modcbam",
        nombre: "notebook.ipynb",
        tipo: "ipynb",
        fecha: new Date().toISOString(),
        archivo: new Blob(["{}"], { type: "application/json" }),
      };

      await guardarHistorial(historial);
      await guardarEvidencia(evidencia);

      expect(await consultarHistoriales()).toHaveLength(1);
      expect(await consultarEvidencias()).toHaveLength(1);

      await borrarEvidencia("evidencia-test");

      expect(await consultarEvidencias()).toHaveLength(0);
      expect(await consultarHistoriales()).toHaveLength(1); // El historial permanece intacto
    });
  });

  describe("Evidencias Compartidas y Vinculación Múltiple (Paso 2)", () => {
    it("identifica correctamente el notebook benchmark compartido por su nombre", () => {
      expect(
        esNombreNotebookCompartido(
          "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb"
        )
      ).toBe(true);
      expect(
        esNombreNotebookCompartido(
          "lidc_idrc_modelo_cnn_cbam_transformer_modifiedcbam.ipynb"
        )
      ).toBe(true);
      expect(esNombreNotebookCompartido("entrenamiento_unet.ipynb")).toBe(false);
      expect(esNombreNotebookCompartido("reporte_metodologico.pdf")).toBe(false);
      expect(esNombreNotebookCompartido("")).toBe(false);
    });

    it("esEvidenciaAsociada comprueba asociaciones individuales y múltiples", () => {
      const evidenciaIndividual: Evidencia = {
        id: "ev-indiv",
        experimentoId: "unet-v1",
        nombre: "reporte_unet.pdf",
        tipo: "pdf",
        fecha: new Date().toISOString(),
        archivo: new Blob(["pdf"]),
      };

      expect(esEvidenciaAsociada(evidenciaIndividual, "unet-v1")).toBe(true);
      expect(esEvidenciaAsociada(evidenciaIndividual, "modcbam-v1")).toBe(false);

      const evidenciaCompartida: Evidencia = {
        id: "ev-shared",
        experimentoId: "unet-v1",
        experimentoIds: ["unet-v1", "unet-cbam-v1", "modcbam-v1", "transunet-v1"],
        esCompartida: true,
        nombre: "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb",
        tipo: "ipynb",
        fecha: new Date().toISOString(),
        archivo: new Blob(["notebook content"]),
      };

      expect(esEvidenciaAsociada(evidenciaCompartida, "unet-v1")).toBe(true);
      expect(esEvidenciaAsociada(evidenciaCompartida, "unet-cbam-v1")).toBe(true);
      expect(esEvidenciaAsociada(evidenciaCompartida, "modcbam-v1")).toBe(true);
      expect(esEvidenciaAsociada(evidenciaCompartida, "transunet-v1")).toBe(true);
      expect(esEvidenciaAsociada(evidenciaCompartida, "otro-modelo-v9")).toBe(false);
    });

    it("asegurarEvidenciasCompartidas asocia el notebook a los 4 experimentos sin duplicar el Blob", async () => {
      const evidenciaOriginal: Evidencia = {
        id: "evidencia-notebook-original",
        experimentoId: "unet-v1",
        nombre: "LIDC_IDRC_modelo_CNN_CBAM_Transformer_ModifiedCBAM.ipynb",
        tipo: "ipynb",
        fecha: "2026-11-17T18:00:00.000Z",
        archivo: new Blob(["notebook_bytes_12345"], { type: "application/x-ipynb+json" }),
      };

      await guardarEvidencia(evidenciaOriginal);

      // Verificar que antes de la migración hay 1 solo registro
      let lista = await consultarEvidencias();
      expect(lista).toHaveLength(1);

      // Ejecutar la migración transparente
      await asegurarEvidenciasCompartidas();

      // Verificar que sigue habiendo EXACTAMENTE 1 registro y 1 Blob
      lista = await consultarEvidencias();
      expect(lista).toHaveLength(1);
      expect(lista[0].id).toBe("evidencia-notebook-original");
      expect(lista[0].esCompartida).toBe(true);
      expect(lista[0].experimentoIds).toEqual(EXPERIMENTOS_CANONICOS);

      // Verificar que los 4 modelos resuelven la asociación
      for (const expId of EXPERIMENTOS_CANONICOS) {
        expect(esEvidenciaAsociada(lista[0], expId)).toBe(true);
      }
    });
  });
});
