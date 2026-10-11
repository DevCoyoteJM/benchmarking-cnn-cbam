import { useState } from "react";
import {
  Activity,
  Brain,
  ChartNoAxesCombined,
  ChevronRight,
  Database,
  FileText,
  FlaskConical,
  HeartPulse,
  Image,
  LayoutDashboard,
  Menu,
  Microscope,
  Settings,
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
import "./App.css";
import ComparacionModelos from "./pages/ComparacionModelos";

const metricas = [
  { metrica: "Exactitud", cnn: 0.91, cbam: 0.94 },
  { metrica: "Precisión", cnn: 0.89, cbam: 0.93 },
  { metrica: "Sensibilidad", cnn: 0.92, cbam: 0.95 },
  { metrica: "F1-score", cnn: 0.9, cbam: 0.94 },
];

const navegacion = [
  { nombre: "Panel principal", icono: LayoutDashboard },
  { nombre: "Explorador de imágenes", icono: Image },
  { nombre: "Comparación de modelos", icono: ChartNoAxesCombined },
  { nombre: "Visualización CBAM", icono: Microscope },
  { nombre: "Informes", icono: FileText },
];

function App() {
  const [seccion, setSeccion] = useState("Panel principal");
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuAbierto ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={25} />
          </div>
          <div>
            <h1>PulmoVision <span>AI</span></h1>
            <p>PLATAFORMA DE INVESTIGACIÓN</p>
          </div>
        </div>

        <div className="nav-label">ESPACIO DE TRABAJO</div>
        <nav className="navigation">
          {navegacion.map(({ nombre, icono: Icono }) => (
            <button
              key={nombre}
              className={`nav-item ${seccion === nombre ? "active" : ""}`}
              onClick={() => {
                setSeccion(nombre);
                setMenuAbierto(false);
              }}
            >
              <Icono size={19} />
              <span>{nombre}</span>
              {seccion === nombre && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="research-card">
            <div className="research-icon"><ShieldCheck size={20} /></div>
            <strong>Investigación académica</strong>
            <p>Herramienta experimental para comparar arquitecturas de aprendizaje profundo.</p>
          </div>
          <button className="nav-item settings-item">
            <Settings size={19} />
            <span>Configuración</span>
          </button>
          <div className="sidebar-footer">TRABAJO DE GRADO · 2026</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Abrir o cerrar menú"
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            <span>Investigación</span>
            <ChevronRight size={15} />
            <strong>{seccion}</strong>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            Entorno experimental
          </div>
        </header>

        {seccion === "Comparación de modelos" ? (
          <ComparacionModelos />
          ) : seccion === "Panel principal" ? (  
          <div className="dashboard">
            <section className="welcome">
              <div>
                <div className="eyebrow"><FlaskConical size={15} /> INVESTIGACIÓN EN IA MÉDICA</div>
                <h2>Panel de investigación</h2>
                <p>
                  Evaluación comparativa de una CNN tradicional y una arquitectura
                  CNN con mecanismo de atención CBAM para clasificación de imágenes
                  de tomografía computarizada de tórax.
                </p>
              </div>
              <div className="welcome-art">
                <div className="art-ring ring-one" />
                <div className="art-ring ring-two" />
                <div className="art-core"><Brain size={43} /></div>
                <span className="art-node node-one"><Activity size={17} /></span>
                <span className="art-node node-two"><Target size={17} /></span>
              </div>
            </section>

            <div className="notice">
              <ShieldCheck size={20} />
              <div>
                <strong>Entorno de investigación</strong>
                <p>Los indicadores de esta versión son demostrativos. No representan resultados reales ni constituyen una herramienta de diagnóstico clínico.</p>
              </div>
            </div>

            <section className="section-heading">
              <div>
                <h3>Resumen del proyecto</h3>
                <p>Estado general del entorno experimental</p>
              </div>
              <span className="period-label">VISTA GENERAL</span>
            </section>

            <div className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Arquitecturas</span>
                  <div className="stat-icon purple"><Brain size={19} /></div>
                </div>
                <div className="stat-value">02</div>
                <p className="stat-description">CNN tradicional y CNN-CBAM</p>
                <div className="stat-foot"><span className="tiny-dot purple-dot" /> Modelos de estudio</div>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Clases objetivo</span>
                  <div className="stat-icon blue"><Target size={19} /></div>
                </div>
                <div className="stat-value">02</div>
                <p className="stat-description">Clasificación binaria</p>
                <div className="stat-foot"><span className="tiny-dot blue-dot" /> Según el etiquetado definido</div>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Dataset</span>
                  <div className="stat-icon green"><Database size={19} /></div>
                </div>
                <div className="stat-value stat-text">LIDC-IDRI</div>
                <p className="stat-description">Imágenes de TC de tórax</p>
                <div className="stat-foot"><span className="tiny-dot green-dot" /> Fuente de investigación</div>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Resultados</span>
                  <div className="stat-icon orange"><ChartNoAxesCombined size={19} /></div>
                </div>
                <div className="stat-value stat-text">Pendientes</div>
                <p className="stat-description">Integración de métricas reales</p>
                <div className="stat-foot"><span className="tiny-dot orange-dot" /> Datos por conectar</div>
              </article>
            </div>

            <section className="section-heading chart-heading">
              <div>
                <h3>Comparación preliminar</h3>
                <p>Ejemplo visual de métricas para las dos arquitecturas</p>
              </div>
              <button className="text-button" onClick={() => setSeccion("Comparación de modelos")}>
                Ver comparación <ChevronRight size={16} />
              </button>
            </section>

            <section className="chart-card">
              <div className="chart-title">
                <div>
                  <h4>Métricas de evaluación</h4>
                  <p>Valores ilustrativos · Escala de 0 a 1</p>
                </div>
                <div className="chart-legend">
                  <span><i className="legend-dot cnn-dot" /> CNN</span>
                  <span><i className="legend-dot cbam-dot" /> CNN-CBAM</span>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricas} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" />
                    <XAxis dataKey="metrica" tick={{ fill: "#7b8498", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 1]} tick={{ fill: "#7b8498", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cnn" name="CNN" stroke="#7c69df" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="cbam" name="CNN-CBAM" stroke="#16a58a" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-note">
                <Activity size={16} />
                <span>Reemplaza estos valores por los resultados obtenidos durante el entrenamiento y la evaluación.</span>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <h3>Módulos de trabajo</h3>
                <p>Accesos a las herramientas de la investigación</p>
              </div>
            </section>

            <div className="modules-grid">
              {navegacion.slice(1, 4).map(({ nombre, icono: Icono }, index) => (
                <button className="module-card" key={nombre} onClick={() => setSeccion(nombre)}>
                  <div className={`module-icon module-${index}`}><Icono size={22} /></div>
                  <h4>{nombre}</h4>
                  <p>{[
                    "Consulta y visualización del conjunto de imágenes.",
                    "Análisis de métricas y desempeño entre modelos.",
                    "Exploración de mapas de atención del mecanismo CBAM.",
                  ][index]}</p>
                  <span className="module-link">Explorar módulo <ChevronRight size={15} /></span>
                </button>
              ))}
            </div>

            <footer className="page-footer">
              <span>PulmoVision AI · Proyecto de investigación académica</span>
              <span>Versión inicial · 2026</span>
            </footer>
          </div>
        ) : (
          <div className="placeholder-page">
            <div className="placeholder-icon"><Microscope size={30} /></div>
            <span className="eyebrow">MÓDULO DE INVESTIGACIÓN</span>
            <h2>{seccion}</h2>
            <p>Esta sección está preparada para su siguiente fase de desarrollo. Aquí integraremos las imágenes, métricas o visualizaciones generadas por los modelos.</p>
            <button className="primary-button" onClick={() => setSeccion("Panel principal")}>
              <LayoutDashboard size={17} /> Volver al panel principal
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
