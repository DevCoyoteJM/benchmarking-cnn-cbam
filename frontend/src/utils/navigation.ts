export const PESTANAS_VALIDAS_COMPARACION = [
  "comparacion",
  "experimentos",
  "evidencias",
  "datos",
] as const;

export type PestanaComparacion = (typeof PESTANAS_VALIDAS_COMPARACION)[number];

export function esPestanaValida(tab: string | null): tab is PestanaComparacion {
  return tab !== null && (PESTANAS_VALIDAS_COMPARACION as readonly string[]).includes(tab);
}

export function resolverTituloSeccion(pathname: string): string {
  if (pathname === "/") return "Panel principal";
  if (pathname.startsWith("/comparacion")) return "Comparación de modelos";
  if (pathname.startsWith("/explorador")) return "Explorador de imágenes";
  if (pathname.startsWith("/cbam")) return "Visualización CBAM";
  if (pathname.startsWith("/interpretacion")) return "Interpretación científica";
  if (pathname.startsWith("/informes")) return "Informes";
  return "Página no encontrada";
}
