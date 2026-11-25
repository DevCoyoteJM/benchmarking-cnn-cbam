# PulmoVision AI — Frontend de Investigación

Frontend analítico desarrollado para el trabajo de grado: **"Evaluación Comparativa: CNN Tradicional vs. CNN con Módulo de Atención CBAM para la Clasificación de Cáncer de Pulmón en Imágenes de TC"**.

---

## 🎯 Propósito del Sistema

PulmoVision AI es una aplicación web fuera de línea orientada a la investigación que permite a los evaluadores e investigadores:
1. **Importar y persistir historiales de entrenamiento:** Lectura de archivos JSON generados por scripts/notebooks en PyTorch (`UNet_historial.json`, `CBAM_historial.json`, etc.).
2. **Visualizar curvas de aprendizaje por época:** Gráficas interactivas con Recharts para las etapas **E1 (Segmentación y detección)** y **E2 (Clasificación de malignidad)**.
3. **Comparar métricas globales:** Tablas y gráficos de barras comparando Exactitud, Precisión, Sensibilidad, F1-score, ROC-AUC, Dice e IoU.
4. **Almacenar y visualizar evidencias:** Soporte para asociar Jupyter Notebooks (`.ipynb`) con visor de celdas/salidas y documentos explicativos (`.pdf`).

> **Nota metodológica:** La aplicación **no ejecuta procesos de entrenamiento** en el navegador ni requiere backend en Python. Los modelos se entrenan externamente en PyTorch y los resultados se incorporan mediante importación estandarizada.

---

## 🧩 Arquitectura Frontend

```
frontend/
├── src/
│   ├── main.tsx                    # Punto de entrada React 19 con BrowserRouter
│   ├── App.tsx                     # Shell, layout general, sidebar NavLink y Suspense
│   ├── App.css                     # Estilos globales, paleta y estados activos
│   ├── data/
│   │   ├── modelos.ts              # Catálogo de arquitecturas (unet, unet-cbam, modcbam, transunet)
│   │   ├── resultados.ts           # Contratos de datos, tipos y experimentos
│   │   └── historialEntrenamiento.ts # Interfaces de etapas E1 y E2
│   ├── hooks/
│   │   ├── useExperimentos.ts      # Gestión reactiva y persistencia de experimentos
│   │   └── useHistorialesEntrenamiento.ts # Gestión y recarga de historiales desde IndexedDB
│   ├── services/
│   │   └── storage/
│   │       ├── storageTypes.ts     # Tipos del subsistema de almacenamiento
│   │       ├── localStorageService.ts # Persistencia segura en localStorage
│   │       └── indexedDBService.ts # Almacenes 'archivos' e 'historiales_entrenamiento'
│   ├── utils/
│   │   ├── uuid.ts                 # Generador seguro de UUID v4 con fallback
│   │   ├── modelSelectors.ts       # Selector centralizado de versión activa
│   │   └── navigation.ts           # Resolutor de títulos de ruta y validador de pestañas
│   ├── pages/
│   │   ├── Dashboard.tsx           # Panel principal con métricas y enlaces modulares
│   │   ├── ComparacionModelos.tsx  # Vista de benchmarking, experimentos (?tab=...) y evidencias
│   │   ├── PlaceholderModulo.tsx   # Contenedor modular para secciones en desarrollo
│   │   └── NotFound.tsx            # Vista 404 para rutas no contempladas
│   ├── components/
│   │   ├── CargandoModulo.tsx      # Fallback de carga con spinner y animación
│   │   ├── GraficaComparacion.tsx  # Curvas por época (LineChart) y métricas globales (BarChart)
│   │   ├── ImportarHistorialEntrenamiento.tsx # Validador e importador de historiales por época
│   │   ├── ImportarResultados.tsx  # Importador de experimentos JSON
│   │   ├── ExportarResultados.tsx  # Exportador de respaldos JSON
│   │   ├── EvidenciasExperimento.tsx # Gestor de archivos binarios (.pdf / .ipynb)
│   │   ├── VisorNotebook.tsx       # Visor modal de Jupyter Notebooks
│   │   ├── DetalleExperimento.tsx  # Ficha técnica de configuración
│   │   ├── HistorialExperimentos.tsx # Registro histórico de versiones
│   │   └── SelectorVersiones.tsx   # Controles de selección de versiones activas
│   └── __tests__/                  # Pruebas unitarias automatizadas con Vitest (44 tests)
```

---

## 🗺️ Mapa de Rutas de la Aplicación

| Ruta | Componente | Descripción | Persistencia / Parámetros |
| :--- | :--- | :--- | :--- |
| `/` | `Dashboard` | Panel principal y métricas demostrativas | Acceso directo y recarga |
| `/comparacion` | `ComparacionModelos` | Benchmarking, experimentos y curvas por época | Soporta `?tab=comparacion`, `?tab=experimentos`, `?tab=evidencias`, `?tab=datos` |
| `/explorador` | `PlaceholderModulo` | Explorador de imágenes de TC LIDC-IDRI | Módulo en preparación |
| `/cbam` | `PlaceholderModulo` | Mapas de atención del mecanismo CBAM | Módulo en preparación |
| `/informes` | `PlaceholderModulo` | Informes consolidados de investigación | Módulo en preparación |
| `*` | `NotFound` | Error 404 con botón para volver al Dashboard | Captura de rutas inválidas |

---

## 🚀 Puesta en Marcha

### Requisitos previos
- Node.js (versión 18 o superior).
- npm o pnpm.

### Instalación de dependencias
```bash
npm install
```

### Ejecución en entorno de desarrollo
```bash
npm run dev
```

### Compilación y empaquetado para producción
```bash
npm run build
```

---

## 📊 Formato de los Historiales de Entrenamiento

Los archivos de historial deben tener nombres con la convención `<Modelo>_historial.json` (ej. `UNet_historial.json`, `CBAM_historial.json`):

```json
{
  "E1": {
    "train_loss": [0.65, 0.45, 0.32],
    "val_loss": [0.68, 0.48, 0.35],
    "val_dice": [0.72, 0.81, 0.88]
  },
  "E2": {
    "train_loss": [0.55, 0.38, 0.25],
    "val_loss": [0.59, 0.42, 0.29],
    "val_mcc": [0.61, 0.74, 0.82],
    "val_f1": [0.75, 0.84, 0.89]
  }
}
```

---

## 🔒 Consideraciones de Seguridad y Resiliencia

- **Almacenamiento híbrido:** Metadatos en `localStorage` con normalización defensiva; archivos pesados y series en `IndexedDB` (`pulmovision_evidencias`).
- **Límite de tamaño:** Carga de evidencias limitada a un máximo de 50 MB por archivo.
- **Contextos no seguros:** Generación de UUIDs con fallback compatible para despliegues locales sobre HTTP.
