import { useEffect, useState } from "react";
import "./App.css";

type Trabajador = { id: number; nombre: string; dni: string };
type Feriado = { fecha: string; nombre: string };
type Estado = "" | "trabajo" | "descanso";
type Registro = {
  estado: Estado;
  horas: string;
  pagado: boolean;
  observaciones: string;
};

const STORAGE_KEY = "feriados-registros-2027";
const JORNADA_HORAS = 8; // jornada completa; cambia este valor si es otra

const TRABAJADORES: Trabajador[] = [
  { id: 1, nombre: "Alexia Elise Valladares", dni: "73225502" },
  { id: 3, nombre: "Alvaro Huerto", dni: "72879191" },
  { id: 4, nombre: "Brayan Noe Huarcaya", dni: "61375898" },
  { id: 5, nombre: "Brenda Caicedo", dni: "73974564" },
  { id: 6, nombre: "Diana Isabel Tuesta", dni: "61828830" },
  { id: 7, nombre: "Elcira Yonec Bazan", dni: "71239693" },
  { id: 8, nombre: "Elizabeth Cenia Cespedes", dni: "42667043" },
  { id: 9, nombre: "Franco Antonio Lopez", dni: "73690599" },
  { id: 10, nombre: "Jaqueline Kassandra Gomez", dni: "72219321" },
  { id: 11, nombre: "Jassmin Sofia Huaranga", dni: "72230013" },
  { id: 12, nombre: "Jhennyfer Aurora Falcon", dni: "72125372" },
  { id: 13, nombre: "Jose Armando Inga", dni: "61232664" },
  { id: 14, nombre: "Judith Antonia Piñan", dni: "42899739" },
  { id: 15, nombre: "Karina Lazaro", dni: "75554106" },
  { id: 16, nombre: "Lindsay Nicol Cornejo", dni: "75114981" },
  { id: 17, nombre: "Michael Alexis Salazar", dni: "73440272" },
  { id: 18, nombre: "Naomy Brisseth Penadillo", dni: "74202367" },
  { id: 19, nombre: "Pedro Neonel Salazar", dni: "76506596" },
  { id: 20, nombre: "Percy Johan Rojas", dni: "72664303" },
  { id: 21, nombre: "Rubi Esmeralda Coz", dni: "62847687" },
  { id: 23, nombre: "Stephanie Guadalupe Ventura", dni: "61543869" },
  { id: 24, nombre: "Yasumi Nicol Parina", dni: "61103282" },
];

const FERIADOS_2027: Feriado[] = [
  { fecha: "2027-01-01", nombre: "Año Nuevo" },
  { fecha: "2027-03-25", nombre: "Jueves Santo" },
  { fecha: "2027-03-26", nombre: "Viernes Santo" },
  { fecha: "2027-05-01", nombre: "Día del Trabajo" },
  { fecha: "2027-06-07", nombre: "Batalla de Arica y Día de la Bandera" },
  { fecha: "2027-06-29", nombre: "San Pedro y San Pablo" },
  { fecha: "2027-07-23", nombre: "Día de la Fuerza Aérea del Perú" },
  { fecha: "2027-07-28", nombre: "Fiestas Patrias" },
  { fecha: "2027-07-29", nombre: "Fiestas Patrias" },
  { fecha: "2027-08-06", nombre: "Batalla de Junín" },
  { fecha: "2027-08-30", nombre: "Santa Rosa de Lima" },
  { fecha: "2027-10-08", nombre: "Combate de Angamos" },
  { fecha: "2027-11-01", nombre: "Todos los Santos" },
  { fecha: "2027-12-08", nombre: "Inmaculada Concepción" },
  { fecha: "2027-12-09", nombre: "Batalla de Ayacucho" },
  { fecha: "2027-12-25", nombre: "Navidad" },
];

const fechaDe = (iso: string) => new Date(`${iso}T00:00:00`);
const diaSemana = (iso: string) =>
  new Intl.DateTimeFormat("es-PE", { weekday: "long" }).format(fechaDe(iso));
const mesCorto = (iso: string) =>
  new Intl.DateTimeFormat("es-PE", { month: "short" })
    .format(fechaDe(iso))
    .replace(".", "");

const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

const fmtHoras = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} h`;

const clave = (dni: string, fecha: string) => `${dni}|${fecha}`;

const REGISTRO_VACIO: Registro = {
  estado: "",
  horas: "",
  pagado: false,
  observaciones: "",
};

const cargarRegistros = (): Record<string, Registro> => {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);
    return datos ? JSON.parse(datos) : {};
  } catch {
    return {};
  }
};

export default function App() {
  const [trabajadorId, setTrabajadorId] = useState("");
  const [registros, setRegistros] =
    useState<Record<string, Registro>>(cargarRegistros);

  const trabajador = TRABAJADORES.find((t) => t.id === Number(trabajadorId));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    } catch (e) {
      console.error("No se pudo guardar en localStorage", e);
    }
  }, [registros]);

  const obtener = (fecha: string): Registro =>
    trabajador
      ? { ...REGISTRO_VACIO, ...registros[clave(trabajador.dni, fecha)] }
      : REGISTRO_VACIO;

  const actualizar = (fecha: string, cambios: Partial<Registro>) => {
    if (!trabajador) return;
    const k = clave(trabajador.dni, fecha);
    setRegistros((prev) => ({
      ...prev,
      [k]: { ...REGISTRO_VACIO, ...prev[k], ...cambios },
    }));
  };

  const cambiarEstado = (fecha: string, estado: Estado) => {
    actualizar(fecha, estado === "descanso" ? { estado, horas: "" } : { estado });
  };

  const cambiarHoras = (fecha: string, valor: string) => {
    if (valor === "") return actualizar(fecha, { horas: "" });
    const n = Number(valor);
    if (Number.isNaN(n)) return;
    const limitado = Math.min(24, Math.max(0, n));
    actualizar(fecha, { horas: String(limitado), estado: "trabajo" });
  };

  const resumen = FERIADOS_2027.reduce(
    (acc, f) => {
      const r = obtener(f.fecha);
      if (r.estado === "trabajo") acc.trabajados++;
      if (r.estado === "descanso") acc.descansados++;
      if (r.pagado) acc.pagados++;
      if (r.estado === "trabajo" && r.horas !== "") {
        const h = Number(r.horas);
        acc.horas += h;
        if (h < JORNADA_HORAS) acc.menores += JORNADA_HORAS - h;
      }
      return acc;
    },
    { trabajados: 0, descansados: 0, pagados: 0, horas: 0, menores: 0 }
  );

  const stats = [
    { label: "Trabajados", valor: String(resumen.trabajados), clase: "stat-blue" },
    { label: "Descansados", valor: String(resumen.descansados), clase: "stat-slate" },
    { label: "Pagados", valor: `${resumen.pagados}/${FERIADOS_2027.length}`, clase: "stat-emerald" },
    { label: "Horas totales", valor: fmtHoras(resumen.horas), clase: "stat-indigo" },
    { label: "Horas menores", valor: fmtHoras(resumen.menores), clase: "stat-amber" },
  ];

  return (
    <div className="app-container">
      {/* Encabezado */}
      <header className="app-header">
        <div className="header-content">
          <span className="header-badge">Control de personal</span>
          <h1 className="header-title">Feriados 2027</h1>
          <p className="header-subtitle">
            Registra horas trabajadas, descansos y pagos por colaborador.
          </p>
        </div>
      </header>

      <main className="main-content">
        {/* Selector */}
        <div className="card selector-card">
          <label htmlFor="colaborador" className="select-label">
            Colaborador
          </label>
          <select
            id="colaborador"
            value={trabajadorId}
            onChange={(e) => setTrabajadorId(e.target.value)}
            className="select-input"
          >
            <option value="">-- Selecciona un colaborador --</option>
            {TRABAJADORES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} - DNI {t.dni}
              </option>
            ))}
          </select>

          {trabajador && (
            <div className="worker-profile">
              <div className="worker-avatar">{iniciales(trabajador.nombre)}</div>
              <div>
                <p className="worker-name">{trabajador.nombre}</p>
                <span className="worker-dni">DNI {trabajador.dni}</span>
              </div>
            </div>
          )}
        </div>

        {!trabajador && (
          <div className="empty-state">
            <p className="empty-title">Ningún colaborador seleccionado</p>
            <p className="empty-desc">
              Selecciona un colaborador para ver y registrar sus feriados.
            </p>
          </div>
        )}

        {trabajador && (
          <>
            {/* Resumen */}
            <div className="stats-grid">
              {stats.map((s) => (
                <div key={s.label} className="stat-card">
                  <p className="stat-label">{s.label}</p>
                  <p className={`stat-value ${s.clase}`}>{s.valor}</p>
                </div>
              ))}
            </div>

            {/* Lista de feriados */}
            <ul className="holidays-list">
              {FERIADOS_2027.map((f) => {
                const r = obtener(f.fecha);
                const trabajo = r.estado === "trabajo";
                const descanso = r.estado === "descanso";
                const horas = r.horas === "" ? null : Number(r.horas);
                const menor = trabajo && horas !== null && horas < JORNADA_HORAS;
                const extra = trabajo && horas !== null && horas > JORNADA_HORAS;

                return (
                  <li
                    key={f.fecha}
                    className={`holiday-card ${r.pagado ? "is-paid" : ""}`}
                  >
                    <div className="holiday-top">
                      {/* Fecha */}
                      <div className="holiday-date-group">
                        <div className="date-box">
                          <span className="date-day">
                            {fechaDe(f.fecha).getDate()}
                          </span>
                          <span className="date-month">{mesCorto(f.fecha)}</span>
                        </div>
                        <div>
                          <p className="holiday-name">{f.nombre}</p>
                          <p className="holiday-weekday">{diaSemana(f.fecha)}</p>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="holiday-controls">
                        {/* Trabajó / Descansó */}
                        <div className="segmented-control">
                          <button
                            type="button"
                            onClick={() => cambiarEstado(f.fecha, "trabajo")}
                            className={`seg-btn ${trabajo ? "active-work" : ""}`}
                          >
                            Trabajó
                          </button>
                          <button
                            type="button"
                            onClick={() => cambiarEstado(f.fecha, "descanso")}
                            className={`seg-btn ${descanso ? "active-rest" : ""}`}
                          >
                            Descansó
                          </button>
                        </div>

                        {/* Horas */}
                        <div className="hours-group">
                          <input
                            type="number"
                            min={0}
                            max={24}
                            step={0.5}
                            disabled={!trabajo}
                            value={r.horas}
                            onChange={(e) => cambiarHoras(f.fecha, e.target.value)}
                            placeholder="0"
                            aria-label="Horas trabajadas"
                            className="hours-input"
                          />
                          <span className="hours-unit">horas</span>
                        </div>

                        {/* Pagado */}
                        <label
                          className={`paid-checkbox ${r.pagado ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={r.pagado}
                            onChange={(e) =>
                              actualizar(f.fecha, { pagado: e.target.checked })
                            }
                          />
                          Pagado
                        </label>
                      </div>
                    </div>

                    {/* Avisos y observaciones */}
                    <div className="holiday-bottom">
                      {descanso && (
                        <span className="badge badge-slate">Descansó</span>
                      )}
                      {menor && horas !== null && (
                        <span className="badge badge-amber">
                          Menor a la jornada: faltan {fmtHoras(JORNADA_HORAS - horas)}
                        </span>
                      )}
                      {extra && horas !== null && (
                        <span className="badge badge-blue">
                          +{fmtHoras(horas - JORNADA_HORAS)} sobre la jornada
                        </span>
                      )}
                      <input
                        type="text"
                        placeholder="Observaciones..."
                        value={r.observaciones}
                        onChange={(e) =>
                          actualizar(f.fecha, { observaciones: e.target.value })
                        }
                        className="obs-input"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}