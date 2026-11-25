import { describe, it, expect } from "vitest";
import {
  resolverTituloSeccion,
  esPestanaValida,
} from "../utils/navigation";

describe("Navegación y Rutas de PulmoVision AI", () => {
  describe("resolverTituloSeccion", () => {
    it("resuelve la ruta raíz '/' como 'Panel principal'", () => {
      expect(resolverTituloSeccion("/")).toBe("Panel principal");
    });

    it("resuelve '/comparacion' como 'Comparación de modelos'", () => {
      expect(resolverTituloSeccion("/comparacion")).toBe("Comparación de modelos");
    });

    it("resuelve subrutas o parámetros de '/comparacion' correctamente", () => {
      expect(resolverTituloSeccion("/comparacion/experimento-1")).toBe("Comparación de modelos");
    });

    it("resuelve '/explorador' como 'Explorador de imágenes'", () => {
      expect(resolverTituloSeccion("/explorador")).toBe("Explorador de imágenes");
    });

    it("resuelve '/cbam' como 'Visualización CBAM'", () => {
      expect(resolverTituloSeccion("/cbam")).toBe("Visualización CBAM");
    });

    it("resuelve '/interpretacion' como 'Interpretación científica'", () => {
      expect(resolverTituloSeccion("/interpretacion")).toBe("Interpretación científica");
    });

    it("resuelve '/informes' como 'Informes'", () => {
      expect(resolverTituloSeccion("/informes")).toBe("Informes");
    });

    it("resuelve rutas inexistentes como 'Página no encontrada'", () => {
      expect(resolverTituloSeccion("/ruta-desconocida")).toBe("Página no encontrada");
      expect(resolverTituloSeccion("/404")).toBe("Página no encontrada");
      expect(resolverTituloSeccion("/admin/secret")).toBe("Página no encontrada");
    });
  });

  describe("esPestanaValida para ComparacionModelos (?tab=...)", () => {
    it("acepta las cuatro pestañas válidas del módulo de comparación", () => {
      expect(esPestanaValida("comparacion")).toBe(true);
      expect(esPestanaValida("experimentos")).toBe(true);
      expect(esPestanaValida("evidencias")).toBe(true);
      expect(esPestanaValida("datos")).toBe(true);
    });

    it("rechaza valores nulos, indefinidos o pestañas no contempladas", () => {
      expect(esPestanaValida(null)).toBe(false);
      expect(esPestanaValida("")).toBe(false);
      expect(esPestanaValida("tab_falsa")).toBe(false);
      expect(esPestanaValida("configuracion")).toBe(false);
    });
  });
});
