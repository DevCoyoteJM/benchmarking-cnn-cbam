import { useState, lazy, Suspense, useMemo } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  BookOpen,
  ChartNoAxesCombined,
  ChevronRight,
  FileText,
  HeartPulse,
  Image,
  LayoutDashboard,
  Menu,
  Microscope,
  Settings,
  ShieldCheck,
} from "lucide-react";
import "./App.css";
import CargandoModulo from "./components/CargandoModulo";
import { resolverTituloSeccion } from "./utils/navigation";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ComparacionModelos = lazy(() => import("./pages/ComparacionModelos"));
const VisualizacionCBAM = lazy(() => import("./pages/VisualizacionCBAM"));
const InterpretacionCientifica = lazy(() => import("./pages/InterpretacionCientifica"));
const PlaceholderModulo = lazy(() => import("./pages/PlaceholderModulo"));
const NotFound = lazy(() => import("./pages/NotFound"));

interface ElementoNavegacion {
  nombre: string;
  ruta: string;
  icono: React.ComponentType<{ size?: number }>;
  exact?: boolean;
}

const navegacion: ElementoNavegacion[] = [
  { nombre: "Panel principal", ruta: "/", icono: LayoutDashboard, exact: true },
  { nombre: "Explorador de imágenes", ruta: "/explorador", icono: Image },
  { nombre: "Comparación de modelos", ruta: "/comparacion", icono: ChartNoAxesCombined },
  { nombre: "Visualización CBAM", ruta: "/cbam", icono: Microscope },
  { nombre: "Interpretación científica", ruta: "/interpretacion", icono: BookOpen },
  { nombre: "Informes", ruta: "/informes", icono: FileText },
];

function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  const tituloSeccion = useMemo(
    () => resolverTituloSeccion(location.pathname),
    [location.pathname]
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuAbierto ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={25} />
          </div>
          <div>
            <h1>
              PulmoVision <span>AI</span>
            </h1>
            <p>PLATAFORMA DE INVESTIGACIÓN</p>
          </div>
        </div>

        <div className="nav-label">ESPACIO DE TRABAJO</div>
        <nav className="navigation">
          {navegacion.map(({ nombre, ruta, icono: Icono, exact }) => (
            <NavLink
              key={nombre}
              to={ruta}
              end={exact}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={() => setMenuAbierto(false)}
            >
              {({ isActive }) => (
                <>
                  <Icono size={19} />
                  <span>{nombre}</span>
                  {isActive && <ChevronRight size={16} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="research-card">
            <div className="research-icon">
              <ShieldCheck size={20} />
            </div>
            <strong>Investigación académica</strong>
            <p>
              Herramienta experimental para comparar arquitecturas de aprendizaje
              profundo.
            </p>
          </div>
          <button className="nav-item settings-item" type="button">
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
            type="button"
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            <span>Investigación</span>
            <ChevronRight size={15} />
            <strong>{tituloSeccion}</strong>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            Entorno experimental
          </div>
        </header>

        <Suspense fallback={<CargandoModulo />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/comparacion" element={<ComparacionModelos />} />
            <Route
              path="/explorador"
              element={
                <PlaceholderModulo
                  titulo="Explorador de imágenes"
                  descripcion="Consulta y visualización del conjunto de imágenes de tomografía computarizada de tórax (LIDC-IDRI), con segmentaciones y anotaciones multiexperto."
                  icono={Image}
                />
              }
            />
            <Route path="/cbam" element={<VisualizacionCBAM />} />
            <Route path="/interpretacion" element={<InterpretacionCientifica />} />
            <Route
              path="/informes"
              element={
                <PlaceholderModulo
                  titulo="Informes"
                  descripcion="Generación y consulta de informes comparativos consolidados, tablas resumen para tesis y exportación de evidencias académicas."
                  icono={FileText}
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
