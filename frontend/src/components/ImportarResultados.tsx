import { useState } from "react";
import type { ChangeEvent } from "react";
import { Upload } from "lucide-react";

import { modelos } from "../data/modelos";
import type { ResultadoModelo } from "../data/resultados";

interface ImportarResultadosProps {
  onImportar: (resultados: ResultadoModelo[]) => void;
}

const metricasPermitidas = [
  "accuracy",
  "precision",
  "recall",
  "f1Score",
  "rocAuc",
  "dice",
] as const;

function validarExperimento(datos: unknown): ResultadoModelo {
  if (
    typeof datos !== "object" ||
    datos === null ||
    Array.isArray(datos)
  ) {
    throw new Error("El experimento debe ser un objeto JSON.");
  }

  const resultado = datos as Record<string, unknown>;

  if (
    typeof resultado.id !== "string" ||
    !resultado.id.trim() ||
    typeof resultado.modeloId !== "string" ||
    typeof resultado.version !== "string" ||
    !resultado.version.trim() ||
    typeof resultado.descripcion !== "string" ||
    !(
      resultado.fecha === null ||
      typeof resultado.fecha === "string"
    ) ||
    !["pendiente", "parcial", "finalizado"].includes(
      String(resultado.estado)
    )
  ) {
    throw new Error(
      "El experimento tiene campos obligatorios faltantes o inválidos."
    );
  }

  if (!modelos.some((modelo) => modelo.id === resultado.modeloId)) {
    throw new Error(
      `El modelo ${resultado.modeloId} no está registrado.`
    );
  }

  const metricas = resultado.metricas;

  if (
    typeof metricas !== "object" ||
    metricas === null ||
    Array.isArray(metricas)
  ) {
    throw new Error("El campo metricas debe ser un objeto.");
  }

  for (const [clave, valor] of Object.entries(metricas)) {
    if (
      !metricasPermitidas.some((metrica) => metrica === clave) ||
      typeof valor !== "number" ||
      !Number.isFinite(valor) ||
      valor < 0 ||
      valor > 1
    ) {
      throw new Error(
        `La métrica ${clave} no es válida. Debe estar entre 0 y 1.`
      );
    }
  }

  if (resultado.configuracion !== undefined) {
  const configuracion = resultado.configuracion;

  if (
    typeof configuracion !== "object" ||
    configuracion === null ||
    Array.isArray(configuracion)
  ) {
    throw new Error(
      "El campo configuracion debe ser un objeto."
    );
  }

  const camposTexto = [
    "dataset",
    "framework",
    "optimizador",
    "funcionPerdida",
    "divisionDatos",
    "hardware",
    "archivoNotebook",
    "archivoPDF",
    "observaciones",
  ];

  const camposNumericos = [
    "epocas",
    "batchSize",
    "learningRate",
  ];

  for (const [clave, valor] of Object.entries(configuracion)) {
    if (camposTexto.includes(clave)) {
      if (typeof valor !== "string") {
        throw new Error(
          `El campo ${clave} debe ser texto.`
        );
      }
    } else if (camposNumericos.includes(clave)) {
      if (
        typeof valor !== "number" ||
        !Number.isFinite(valor) ||
        valor <= 0 ||
        ((clave === "epocas" || clave === "batchSize") &&
          !Number.isInteger(valor))
      ) {
        throw new Error(
          `El campo ${clave} debe ser un número positivo válido.`
        );
      }
    } else {
      throw new Error(
        `Campo de configuración no reconocido: ${clave}.`
      );
    }
  }
}

  return resultado as unknown as ResultadoModelo;
}

export default function ImportarResultados({
  onImportar,
}: ImportarResultadosProps) {
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  const manejarArchivo = async (
    evento: ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    try {
      const contenido = await archivo.text();
      const datos: unknown = JSON.parse(contenido);

      const elementos = Array.isArray(datos) ? datos : [datos];

      if (elementos.length === 0) {
        throw new Error(
          "El archivo no contiene experimentos para importar."
        );
      }

      const experimentos = elementos.map((elemento, indice) => {
        try {
          return validarExperimento(elemento);
        } catch (err) {
          const detalle =
            err instanceof Error ? err.message : "Error desconocido";

          throw new Error(
            `Experimento ${indice + 1}: ${detalle}`
          );
        }
      });

      const ids = experimentos.map((experimento) => experimento.id);

      if (new Set(ids).size !== ids.length) {
        throw new Error(
          "El archivo contiene identificadores de experimentos repetidos."
        );
      }

      onImportar(experimentos);

      setError(false);
      setMensaje(
        `${experimentos.length} experimento(s) importado(s) correctamente.`
      );
    } catch (err) {
      setError(true);
      setMensaje(
        err instanceof Error
          ? err.message
          : "No se pudo procesar el archivo."
      );
    } finally {
      evento.target.value = "";
    }
  };

  return (
    <section className="selector-modelos">
      <div className="importar-resultados-header">
        <div>
          <h3>Importar resultados experimentales</h3>

          <p>
            Carga un experimento individual o un respaldo JSON
            con varias versiones de los modelos.
          </p>
        </div>

        <Upload size={24} color="#2563eb" />
      </div>

      <div className="importar-resultados-archivo">
        <label htmlFor="archivo-resultados">
          Seleccionar archivo JSON
        </label>

        <input
          id="archivo-resultados"
          type="file"
          accept=".json,application/json"
          onChange={manejarArchivo}
        />
      </div>

      {mensaje && (
        <p
          role="status"
          style={{
            color: error ? "#dc2626" : "#15803d",
            marginTop: 12,
          }}
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}