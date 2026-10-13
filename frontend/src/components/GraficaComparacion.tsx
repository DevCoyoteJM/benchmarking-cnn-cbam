import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { modelos } from "../data/modelos";
//import { resultados } from "../data/resultados";
//import { historialResultados } from "../data/resultados";
import type { ResultadoModelo } from "../data/resultados";

interface GraficaComparacionProps {
  modelosSeleccionados: string[];
  versionesSeleccionadas: Record<string, string>;
  experimentos: ResultadoModelo[];
}

const metricas = [
  { clave: "accuracy", nombre: "Accuracy" },
  { clave: "precision", nombre: "Precisión" },
  { clave: "recall", nombre: "Recall" },
  { clave: "f1Score", nombre: "F1-score" },
  { clave: "dice", nombre: "Dice" },
] as const;

const colores = [
  "#2563eb",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
];

export default function GraficaComparacion({
  modelosSeleccionados,
  versionesSeleccionadas,
  experimentos,
}: GraficaComparacionProps) {
  const modelosActivos = modelos.filter((modelo) =>
    modelosSeleccionados.includes(modelo.id)
  );

  const datosGrafica = metricas.map((metrica) => {
    const fila: Record<string, string | number> = {
      metrica: metrica.nombre,
    };

    modelosActivos.forEach((modelo) => {
      const versiones = experimentos.filter(
      (item) => item.modeloId === modelo.id
      );

      const idSeleccionado =
        versionesSeleccionadas[modelo.id] ??
        versiones[versiones.length - 1]?.id;

      const resultado = versiones.find(
        (item) => item.id === idSeleccionado
      );

      const valor = resultado?.metricas[metrica.clave];

      if (typeof valor === "number") {
        fila[modelo.id] = valor * 100;
      }
    });

    return fila;
  });

  const hayResultados = datosGrafica.some((fila) =>
    modelosActivos.some(
      (modelo) => typeof fila[modelo.id] === "number"
    )
  );

  return (
    <section className="selector-modelos">
      <h3>Comparación gráfica de métricas</h3>

      <p>
        Visualización de los resultados disponibles
        para las arquitecturas seleccionadas.
      </p>

      {modelosActivos.length === 0 ? (
        <div className="grafica-sin-datos">
          Selecciona al menos un modelo para visualizar
          la comparación.
        </div>
      ) : !hayResultados ? (
        <div className="grafica-sin-datos">
          <strong>Resultados pendientes</strong>
          <p>
            Todavía no se han incorporado métricas
            verificadas de los modelos seleccionados.
          </p>
        </div>
      ) : (
        <div className="grafica-comparacion-contenedor">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={datosGrafica}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="metrica" />

              <YAxis
                domain={[0, 100]}
                tickFormatter={(valor: number) =>
                  `${valor}%`
                }
              />

              <Tooltip
                formatter={(valor, nombre) => [
                  typeof valor === "number"
                    ? `${valor.toFixed(2)}%`
                    : "Sin datos",
                  modelos.find(
                    (modelo) => modelo.id === String(nombre)
                  )?.nombre ?? String(nombre),
                ]}
              />

              <Legend
                formatter={(valor: string) =>
                  modelos.find(
                    (modelo) => modelo.id === valor
                  )?.nombre ?? valor
                }
              />

              {modelosActivos.map((modelo, index) => (
                <Bar
                  key={modelo.id}
                  dataKey={modelo.id}
                  fill={colores[index % colores.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}