# Evaluación Comparativa: CNN Tradicional vs. CNN con Módulo de Atención CBAM para la Clasificación de Cáncer de Pulmón en Imágenes de TC

## Introducción

El cáncer de pulmón es una de las causas principales de mortalidad por cáncer a nivel mundial. El diagnóstico temprano es crucial para mejorar las tasas de supervivencia de los pacientes; sin embargo, la detección manual de nódulos pulmonares sospechosos en estudios de **Tomografía Computarizada (TC) de tórax** representa un desafío considerable para los radiólogos debido al alto volumen de cortes por estudio, la variabilidad morfométrica de las lesiones y la presencia de estructuras anatómicas complejas.

En los últimos años, los sistemas de **Diagnóstico Asistido por Computadora (CAD)** basados en **Redes Neuronales Convolucionales (CNN)** han demostrado un rendimiento sobresaliente en el procesamiento de imágenes médicas. No obstante, las arquitecturas convolucionales convencionales suelen tratar las características espaciales y de canales con igual ponderación, lo que puede limitar su capacidad para focalizarse en regiones patológicas sutiles o pequeñas.

Para abordar esta limitación, este proyecto propone una **evaluación comparativa entre una arquitectura CNN tradicional y una arquitectura optimizada con el Módulo de Atención Convolucional de Bloque (CBAM - *Convolutional Block Attention Module*)**. El mecanismo de atención CBAM permite a la red enfatizar de forma adaptativa *qué* características son relevantes (atención de canal) y *dónde* se localizan las regiones de interés anatómico (atención espacial), mejorando la precisión y la capacidad discriminativa en la clasificación de nódulos pulmonares.

---

## 🔬 Metodología Experimental en Dos Etapas

La investigación estructura el análisis comparativo mediante un pipeline experimental articulado en dos etapas complementarias:

### Etapa 1 (E1): Segmentación y detección de nódulos pulmonares
- **Objetivo:** Delimitación anatómica y detección espacial de regiones de interés (nódulos candidatos) sobre cortes axiales de tomografía computarizada.
- **Métricas por época analizadas:**
  - Pérdida de entrenamiento (`train_loss`).
  - Pérdida de validación (`val_loss`).
  - Coeficiente de similitud Dice (`val_dice`).
- **Métricas globales finales:** Coeficiente Dice e Índice de Jaccard / Intersección sobre Unión (`IoU`).

### Etapa 2 (E2): Clasificación de malignidad (Benigno vs. Maligno)
- **Objetivo:** Determinación de la probabilidad de malignidad de las lesiones identificadas mediante clasificación binaria, contrastada contra la concordancia de los radiólogos anotadores.
- **Métricas por época analizadas:**
  - Pérdida de entrenamiento (`train_loss`).
  - Pérdida de validación (`val_loss`).
  - Coeficiente de correlación de Matthews (`val_mcc`), robusto ante desbalances de clase.
  - F1-score de validación (`val_f1`).
- **Métricas globales finales:** Exactitud (`accuracy`), Precisión (`precision`), Sensibilidad / Recall (`recall`), F1-score (`f1Score`) y Área bajo la curva ROC (`rocAuc`).

---

## 🏛️ Catálogo de Arquitecturas en Estudio

El benchmarking evalúa cuatro arquitecturas con identificadores estandarizados en el sistema:

1. **U-Net (`unet`):** Arquitectura convolucional estándar encoder-decoder con conexiones residuales (*skip connections*), ampliamente adoptada en segmentación y análisis de imágenes biomédicas como modelo base de referencia.
2. **U-Net + CBAM (`unet-cbam`):** Modelo central de la investigación; integra el módulo CBAM tanto en el encoder como en el cuello de botella para enfatizar adaptativamente mapas de características espaciales y canales salientes.
3. **ModCBAM (`modcbam`):** Variante experimental que evalúa ajustes en la topología de interconexión y reducción de dimensionalidad del bloque de atención.
4. **TransUNet (`transunet`):** Arquitectura híbrida que incorpora un *Vision Transformer* (ViT) en el encoder para capturar dependencias globales de largo alcance, sirviendo como contraste frente al enfoque convolucional puro con atención.

---

## 💻 Plataforma PulmoVision AI

La carpeta `frontend/` aloja **PulmoVision AI**, la aplicación web interactiva desarrollada para la gestión, comparación y visualización del benchmarking:

- **Propósito:** El frontend no entrena modelos ni ejecuta código Python/PyTorch en el navegador. Su función es actuar como consola analítica fuera de línea para importar historiales JSON de entrenamiento (`UNet_historial.json`, `CBAM_historial.json`), almacenar evidencias documentales (Jupyter Notebooks `.ipynb` y reportes `.pdf`), y graficar curvas de convergencia por época y tablas comparativas.
- **Tecnologías:** React 19, TypeScript, Vite, Recharts, IndexedDB (almacenamiento binario y de series) y localStorage (metadatos de experimentos).

---

## El Conjunto de Datos (Dataset)

El proyecto utiliza el dataset médico de referencia pública **LIDC-IDRI** (*Lung Image Database Consortium and Image Database Resource Initiative*), el cual consiste en exploraciones de **Tomografía Computarizada (TC) de tórax** en formato DICOM para la detección, diagnóstico y clasificación de nódulos pulmonares y cáncer de pulmón.

### 🔗 Origen de los Datos

El conjunto de datos es administrado por *The Cancer Imaging Archive (TCIA)* y se encuentra disponible públicamente para fines de investigación:

**Dataset:** [LIDC-IDRI en The Cancer Imaging Archive (TCIA)](https://doi.org/10.7937/K9/TCIA.2015.LO9QL9SX)

> ⚠️ **Nota:** Debido al gran volumen de datos (imágenes volumétricas en formato DICOM de 1,018 casos), los archivos originales no se alojan en este repositorio. Es necesario descargarlos directamente mediante la herramienta *NBIA Data Retriever* desde TCIA y organizarlos en la estructura de carpetas definida en este proyecto.

### 🔍 Características y Rigor Médico

- **Origen y Cobertura:** Desarrollado por siete instituciones académicas e industrias de imágenes médicas en un esfuerzo conjunto liderado por el *National Cancer Institute (NCI)*.
- **Volumen de Datos:** Contiene **1,018 casos (estudios de TC de tórax)** de pacientes con presencia confirmada o sospecha de nódulos pulmonares.
- **Validación Multiexperto:** Cada estudio fue evaluado en un proceso de dos fases por cuatro radiólogos torácicos experimentados. Los expertos identificaron, localizaron y anotaron detalladamente los nódulos (características morfológicas y nivel de malignidad).
- **Referencia Bibliográfica:**
  > Armato III, S. G., McLennan, G., Bidaut, L., McNitt-Gray, M. F., Meyer, C. R., Reeves, A. P., ... & Clarke, L. P. (2011). *The Lung Image Database Consortium (LIDC) and Image Database Resource Initiative (IDRI): A completed reference database of lung nodules on CT scans.* **Medical Physics**, 38(2), 915-931. https://doi.org/10.1118/1.3528204
