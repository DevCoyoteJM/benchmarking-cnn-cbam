import { Link } from "react-router-dom";
import {
  Activity,
  Brain,
  ChartNoAxesCombined,
  ChevronRight,
  Database,
  FlaskConical,
  Image,
  Microscope,
  ShieldCheck,
  Target,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const metricasDemostrativas = [
  { metrica: "Exactitud", cnn: 0.91, cbam: 0.94 },
  { metrica: "Precisión", cnn: 0.89, cbam: 0.93 },
  { metrica: "Sensibilidad", cnn: 0.92, cbam: 0.95 },
  { metrica: "F1-score", cnn: 0.9, cbam: 0.94 },
];

const modulosTrabajo = [
  {
    nombre: "Explorador de imágenes",
    ruta: "/explorador",
    icono: Image,
    descripcion: "Consulta y visualización del conjunto de imágenes.",
  },
  {
    nombre: "Comparación de modelos",
    ruta: "/comparacion",
    icono: ChartNoAxesCombined,
    descripcion: "Análisis de métricas y desempeño entre modelos.",
  },
  {
    nombre: "Visualización CBAM",
    ruta: "/cbam",
    icono: Microscope,
    descripcion: "Exploración de mapas de atención del mecanismo CBAM.",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <section className="welcome">
        <div>
          <div className="eyebrow">
            <FlaskConical size={15} /> INVESTIGACIÓN EN IA MÉDICA
          </div>
          <h2>Panel de investigación</h2>
          <p>
            Benchmarking de arquitecturas convolucionales y mecanismos de atención CBAM en dos etapas:
            (E1) segmentación y detección de nódulos pulmonares, y (E2) clasificación de malignidad
            (benigno vs. maligno) en imágenes de tomografía computarizada de tórax (dataset LIDC-IDRI).
          </p>
        </div>
        <div className="welcome-art">
          <div className="art-ring ring-one" />
          <div className="art-ring ring-two" />
          <div className="art-core">
            <Brain size={43} />
          </div>
          <span className="art-node node-one">
            <Activity size={17} />
          </span>
          <span className="art-node node-two">
            <Target size={17} />
          </span>
        </div>
      </section>

      <div className="notice">
        <ShieldCheck size={20} />
        <div>
          <strong>Entorno de investigación académica</strong>
          <p>
            Plataforma para el análisis y comparación de modelos entrenados en PyTorch. No constituye una herramienta de diagnóstico clínico en producción.
          </p>
        </div>
      </div>

      <section className="section-heading">
        <div>
          <h3>Resumen del proyecto</h3>
          <p>Estado general del entorno experimental y arquitecturas en evaluación</p>
        </div>
        <span className="period-label">VISTA GENERAL</span>
      </section>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span>Arquitecturas</span>
            <div className="stat-icon purple">
              <Brain size={19} />
            </div>
          </div>
          <div className="stat-value">04</div>
          <p className="stat-description">U-Net, U-Net+CBAM, ModCBAM, TransUNet</p>
          <div className="stat-foot">
            <span className="tiny-dot purple-dot" /> Catálogo en estudio
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Etapas de estudio</span>
            <div className="stat-icon blue">
              <Target size={19} />
            </div>
          </div>
          <div className="stat-value">02</div>
          <p className="stat-description">E1: Segmentación · E2: Malignidad</p>
          <div className="stat-foot">
            <span className="tiny-dot blue-dot" /> Pipeline experimental
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Dataset</span>
            <div className="stat-icon green">
              <Database size={19} />
            </div>
          </div>
          <div className="stat-value stat-text">LIDC-IDRI</div>
          <p className="stat-description">1,018 casos de TC de tórax</p>
          <div className="stat-foot">
            <span className="tiny-dot green-dot" /> Validación multiexperto
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Resultados reales</span>
            <div className="stat-icon orange">
              <ChartNoAxesCombined size={19} />
            </div>
          </div>
          <div className="stat-value stat-text">Por importar</div>
          <p className="stat-description">Archivos JSON de PyTorch</p>
          <div className="stat-foot">
            <span className="tiny-dot orange-dot" /> Curvas por época y métricas
          </div>
        </article>
      </div>

      <section className="section-heading chart-heading">
        <div>
          <h3>Previsualización de métricas (Demostrativa)</h3>
          <p>Ejemplo visual de comparación entre modelos de referencia</p>
        </div>
        <Link to="/comparacion" className="text-button">
          Ver comparación <ChevronRight size={16} />
        </Link>
      </section>

      <section className="chart-card">
        <div className="chart-title">
          <div>
            <h4>Métricas de referencia (Valores ilustrativos)</h4>
            <p>Escala de 0 a 1 · Consulta los resultados reales en el módulo de comparación</p>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot cnn-dot" /> CNN Base (U-Net)
            </span>
            <span>
              <i className="legend-dot cbam-dot" /> CNN + CBAM
            </span>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={metricasDemostrativas}
              margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" />
              <XAxis
                dataKey="metrica"
                tick={{ fill: "#7b8498", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fill: "#7b8498", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cnn"
                name="CNN Base"
                stroke="#7c69df"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="cbam"
                name="CNN + CBAM"
                stroke="#16a58a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-note">
          <Activity size={16} />
          <span>
            Los indicadores de esta gráfica son demostrativos para previsualización. Las curvas reales de pérdida y métricas por época deben importarse en el módulo "Comparación de modelos".
          </span>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h3>Módulos de trabajo</h3>
          <p>Accesos a las herramientas de la investigación</p>
        </div>
      </section>

      <div className="modules-grid">
        {modulosTrabajo.map(({ nombre, ruta, icono: Icono, descripcion }, index) => (
          <Link
            to={ruta}
            className="module-card"
            key={nombre}
          >
            <div className={`module-icon module-${index}`}>
              <Icono size={22} />
            </div>
            <h4>{nombre}</h4>
            <p>{descripcion}</p>
            <span className="module-link">
              Explorar módulo <ChevronRight size={15} />
            </span>
          </Link>
        ))}
      </div>

      <footer className="page-footer">
        <span>PulmoVision AI · Proyecto de investigación académica</span>
        <span>Versión inicial · 2026</span>
      </footer>
    </div>
  );
}
