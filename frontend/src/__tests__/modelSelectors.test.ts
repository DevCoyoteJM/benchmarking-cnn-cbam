import { describe, it, expect } from "vitest";
import { obtenerResultadoSeleccionado } from "../utils/modelSelectors";
import type { ResultadoModelo } from "../data/resultados";

describe("Selector de Versiones de Modelos (obtenerResultadoSeleccionado)", () => {
  const listaExperimentos: ResultadoModelo[] = [
    {
      id: "unet-v1",
      modeloId: "unet",
      version: "1.0",
      fecha: "2026-10-01",
      estado: "finalizado",
      tarea: "segmentacion",
      descripcion: "Versión 1",
      metricas: { dice: 0.85 },
    },
    {
      id: "unet-v2",
      modeloId: "unet",
      version: "2.0",
      fecha: "2026-10-15",
      estado: "finalizado",
      tarea: "segmentacion",
      descripcion: "Versión 2 mejorada",
      metricas: { dice: 0.91 },
    },
    {
      id: "cbam-v1",
      modeloId: "unet-cbam",
      version: "1.0",
      fecha: "2026-10-20",
      estado: "finalizado",
      tarea: "clasificacion",
      descripcion: "Versión única CBAM",
      metricas: { accuracy: 0.94 },
    },
  ];

  it("retorna la versión explícitamente solicitada en versionesSeleccionadas", () => {
    const versionesSeleccionadas = {
      unet: "unet-v1",
    };

    const resultado = obtenerResultadoSeleccionado(
      "unet",
      versionesSeleccionadas,
      listaExperimentos
    );

    expect(resultado).toBeDefined();
    expect(resultado?.id).toBe("unet-v1");
    expect(resultado?.version).toBe("1.0");
  });

  it("retorna la última versión registrada si no hay selección explícita", () => {
    const versionesSeleccionadas = {}; // Sin selección previa

    const resultado = obtenerResultadoSeleccionado(
      "unet",
      versionesSeleccionadas,
      listaExperimentos
    );

    expect(resultado).toBeDefined();
    expect(resultado?.id).toBe("unet-v2"); // La última de unet
    expect(resultado?.version).toBe("2.0");
  });

  it("retorna undefined si el modelo no tiene ningún experimento registrado", () => {
    const resultado = obtenerResultadoSeleccionado(
      "transunet", // Sin experimentos en listaExperimentos
      {},
      listaExperimentos
    );

    expect(resultado).toBeUndefined();
  });
});
