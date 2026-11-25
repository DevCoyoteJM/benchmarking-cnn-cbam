import { describe, it, expect } from "vitest";
import { generarUUID } from "../utils/uuid";

describe("Generador de Identificadores Seguros (generarUUID)", () => {
  it("genera un string con formato válido de UUID v4 (8-4-4-4-12)", () => {
    const uuid = generarUUID();
    const patronUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(typeof uuid).toBe("string");
    expect(uuid).toMatch(patronUUID);
  });

  it("genera identificadores únicos en múltiples llamadas sucesivas", () => {
    const cantidad = 100;
    const generados = new Set<string>();

    for (let i = 0; i < cantidad; i++) {
      generados.add(generarUUID());
    }

    expect(generados.size).toBe(cantidad);
  });
});
