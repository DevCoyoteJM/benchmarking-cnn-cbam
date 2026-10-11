import {
  BarChart3,
  Brain,
  CheckCircle2,
  CircleHelp,
  Download,
  FlaskConical,
  Info,
  Target,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { modelos } from "../data/modelos";

const metricasDemo = [
  { nombre: "Exactitud", cnn: 91, cbam: 94 },
  { nombre: "Precisión", cnn: 89, cbam: 93 },
  { nombre: "Sensibilidad", cnn: 92, cbam: 95 },
  { nombre: "F1-score", cnn: 90, cbam: 94 },
];

export default function ComparacionModelos() {
  const exportarCSV = () => {
    const filas = [
      ["Métrica", "CNN tradicional (%)", "CNN-CBAM (%)"],
      ...metricasDemo.map((m) => [m.nombre, m.cnn, m.cbam]),
    ];

    const contenido = filas.map((fila) => fila.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + contenido], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "comparacion-demostrativa.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  };

  const [modelosSeleccionados, setModelosSeleccionados] =
    useState<string[]>(["unet", "unet-cbam"]);

  const cambiarSeleccion = (id: string) => {
    setModelosSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((modeloId) => modeloId !== id)
        : [...actuales, id]
    );
  };

  return (
    <div className="comparison-page">
      <div className="comparison-header">
        <div>
          <div className="eyebrow">
            <FlaskConical size={15} />
            EVALUACIÓN EXPERIMENTAL
          </div>
          <h2>Comparación de modelos</h2>
          <p>
            Análisis comparativo del desempeño de una CNN tradicional y una
            arquitectura con mecanismo de atención CBAM.
          </p>
        </div>

        <button className="export-button" onClick={exportarCSV}>
          <Download size={17} />
          Exportar CSV
        </button>
      </div>

      <div className="comparison-notice">
        <Info size={20} />
        <div>
          <strong>Datos de demostración</strong>
          <p>
            Los valores de esta página son ficticios y sirven únicamente
            para probar la interfaz. No representan resultados del
            entrenamiento ni deben utilizarse en las conclusiones académicas.
          </p>
        </div>
      </div>

      <section className="selector-modelos">
        <h3>Seleccionar modelos para comparar</h3>

        <p>
          Selecciona las arquitecturas que deseas incluir
          en la comparación.
        </p>

        <div className="selector-modelos-grid">
          {modelos.map((modelo) => (
            <label
              key={modelo.id}
              className="selector-modelo-item"
            >
              <input
                type="checkbox"
                checked={modelosSeleccionados.includes(modelo.id)}
                onChange={() => cambiarSeleccion(modelo.id)}
              />

              <div>
                <strong>{modelo.nombre}</strong>
                <span>{modelo.descripcion}</span>
              </div>
            </label>
          ))}
        </div>

        <p className="selector-modelos-info">
          {modelosSeleccionados.length} de {modelos.length} modelos
          seleccionados.
        </p>
      </section>

      <div className="comparison-models">
        {modelos.map((modelo) => (
          <article className="model-card" key={modelo.nombre}>
            <div className={`model-symbol ${modelo.color}`}>
              <Brain size={24} />
            </div>
            <div className="model-label">{modelo.subtitulo}</div>
            <h3>{modelo.nombre}</h3>
            <p>{modelo.descripcion}</p>
            <div className="model-status">
              <CircleHelp size={15} />
              Pendiente de conectar resultados reales
            </div>
          </article>
        ))}
      </div>

      <section className="comparison-section">
        <div className="comparison-section-heading">
          <div className="section-icon">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3>Indicadores de desempeño</h3>
            <p>Comparación ilustrativa en una escala porcentual</p>
          </div>
        </div>

        <div className="comparison-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metricasDemo}
              margin={{ top: 12, right: 15, left: 0, bottom: 5 }}
            >
              <CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" />
              <XAxis
                dataKey="nombre"
                tick={{ fill: "#7b8498", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#7b8498", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(valor) => `${valor}%`}
              />
              <Tooltip formatter={(valor) => [`${valor}%`]} />
              <Legend />
              <Bar
                dataKey="cnn"
                name="CNN tradicional"
                fill="#7c69df"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="cbam"
                name="CNN-CBAM"
                fill="#16a58a"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="comparison-section">
        <div className="comparison-section-heading">
          <div className="section-icon">
            <Target size={20} />
          </div>
          <div>
            <h3>Tabla comparativa</h3>
            <p>Valores porcentuales de ejemplo</p>
          </div>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>CNN tradicional</th>
                <th>CNN-CBAM</th>
              </tr>
            </thead>
            <tbody>
              {metricasDemo.map((metrica) => (
                <tr key={metrica.nombre}>
                  <td>{metrica.nombre}</td>
                  <td>{metrica.cnn}%</td>
                  <td>
                    <span className="metric-value">
                      {metrica.cbam}%
                      <CheckCircle2 size={15} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="comparison-footnote">
        <Info size={16} />
        <p>
          La comparación definitiva deberá utilizar el mismo conjunto de
          prueba, las mismas definiciones de métricas y condiciones
          experimentales comparables para ambas arquitecturas.
        </p>
      </div>
    </div>
  );
}