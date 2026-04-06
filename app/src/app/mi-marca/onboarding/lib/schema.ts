export interface Competitor {
  nombre: string;
  handle: string;
}

export interface OnboardingData {
  // Sección 1: Datos del Negocio
  nombre_negocio: string;
  nicho: string;
  anos_experiencia: number | null;
  presencia_digital_actual: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  sitio_web: string;

  // Sección 2: Voz de Marca
  slider_serio_divertido: number | null;
  slider_formal_casual: number | null;
  slider_respetuoso_atrevido: number | null;
  slider_racional_emocional: number | null;
  tono: string[];

  // Sección 3: Cliente Ideal
  problema_principal: string;
  solucion: string;
  rango_edad: string;
  ubicacion: string;
  genero: string;
  intereses: string[];
  objeciones: string[];
  poder_adquisitivo: number | null;
  nivel_conocimiento: number | null;
  digitalizacion: number | null;
  frustraciones: string[];
  esperanzas_suenos: string;
  miedos: string[];
  preferencias_comunicacion: string[];
  puntos_de_vista: string;

  // Sección 4: Oferta Irresistible
  causa: string;
  enemigo: string;
  problema_oferta: string;
  solucion_oferta: string;
  escenario_ideal: string;
  pasos_metodologia: string[];
  nombre_programa: string;
  duracion: string;
  formato: string;
  diferenciacion: string;
  bonos: string[];
  precio: string;

  // Sección 5: Demostración de Valor
  tipo_lead_magnet: string;
  destino: string;
  descripcion_herramienta: string;

  // Sección 6: Competencia
  competidores: Competitor[];
  ventaja_competitiva: string;
}

export type SectionKey =
  | "datos_del_negocio"
  | "voz_de_marca"
  | "cliente_ideal"
  | "oferta_irresistible"
  | "demostracion_de_valor"
  | "competencia";

export type CompletedSections = Record<SectionKey, boolean>;

export const SECTION_ORDER: SectionKey[] = [
  "datos_del_negocio",
  "voz_de_marca",
  "cliente_ideal",
  "oferta_irresistible",
  "demostracion_de_valor",
  "competencia",
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  datos_del_negocio: "Datos del Negocio",
  voz_de_marca: "Voz de Marca",
  cliente_ideal: "Cliente Ideal",
  oferta_irresistible: "Oferta Irresistible",
  demostracion_de_valor: "Demostraci\u00f3n de Valor",
  competencia: "Competencia",
};

export const EMPTY_DATA: OnboardingData = {
  nombre_negocio: "",
  nicho: "",
  anos_experiencia: null,
  presencia_digital_actual: "",
  instagram: "",
  tiktok: "",
  facebook: "",
  linkedin: "",
  youtube: "",
  sitio_web: "",

  slider_serio_divertido: null,
  slider_formal_casual: null,
  slider_respetuoso_atrevido: null,
  slider_racional_emocional: null,
  tono: [],

  problema_principal: "",
  solucion: "",
  rango_edad: "",
  ubicacion: "",
  genero: "",
  intereses: [],
  objeciones: [],
  poder_adquisitivo: null,
  nivel_conocimiento: null,
  digitalizacion: null,
  frustraciones: [],
  esperanzas_suenos: "",
  miedos: [],
  preferencias_comunicacion: [],
  puntos_de_vista: "",

  causa: "",
  enemigo: "",
  problema_oferta: "",
  solucion_oferta: "",
  escenario_ideal: "",
  pasos_metodologia: [],
  nombre_programa: "",
  duracion: "",
  formato: "",
  diferenciacion: "",
  bonos: [],
  precio: "",

  tipo_lead_magnet: "",
  destino: "",
  descripcion_herramienta: "",

  competidores: [],
  ventaja_competitiva: "",
};

function filled(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return true;
  if (Array.isArray(v)) return v.length > 0;
  return false;
}

export function computeCompletedSections(data: OnboardingData): CompletedSections {
  return {
    datos_del_negocio:
      filled(data.nombre_negocio) &&
      filled(data.nicho) &&
      data.anos_experiencia !== null,

    voz_de_marca:
      data.slider_serio_divertido !== null &&
      data.slider_formal_casual !== null &&
      data.slider_respetuoso_atrevido !== null &&
      data.slider_racional_emocional !== null &&
      (data.tono?.length ?? 0) >= 3,

    cliente_ideal:
      filled(data.problema_principal) &&
      filled(data.solucion) &&
      filled(data.rango_edad) &&
      filled(data.ubicacion) &&
      filled(data.genero) &&
      data.poder_adquisitivo !== null &&
      data.nivel_conocimiento !== null &&
      data.digitalizacion !== null,

    oferta_irresistible:
      filled(data.causa) &&
      filled(data.enemigo) &&
      filled(data.problema_oferta) &&
      filled(data.solucion_oferta) &&
      filled(data.escenario_ideal) &&
      (data.pasos_metodologia?.length ?? 0) > 0 &&
      filled(data.nombre_programa) &&
      filled(data.duracion) &&
      filled(data.formato) &&
      filled(data.diferenciacion),

    demostracion_de_valor:
      filled(data.tipo_lead_magnet) &&
      filled(data.destino),

    competencia:
      (data.competidores?.length ?? 0) > 0 &&
      data.competidores?.some((c) => filled(c.nombre)) &&
      filled(data.ventaja_competitiva),
  };
}

export function isAllComplete(sections: CompletedSections): boolean {
  return SECTION_ORDER.every((k) => sections[k]);
}
