#!/usr/bin/env python3
"""Analyze Maria Jose Instagram content themes vs performance."""
import json, sys, io
from collections import defaultdict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

posts = [
    # March 2026
    {"date":"2026-03-26","reach":241,"eng":21,"type":"VIDEO","theme":"CAMBIO/TRANSFORMACION","msg":"Cambio acompanado de aprendizaje + CTA programa"},
    {"date":"2026-03-25","reach":78,"eng":20,"type":"CAROUSEL","theme":"AUTOSANACION","msg":"Auto-sanar el cuerpo soltando y escuchando"},
    {"date":"2026-03-23","reach":264,"eng":26,"type":"VIDEO","theme":"RUPTURA/ELEGIRSE","msg":"Despues de ruptura dolorosa, volver a conectar contigo"},
    {"date":"2026-03-20","reach":236,"eng":145,"type":"VIDEO","theme":"EMPODERAMIENTO","msg":"No trabajo con victimas, ayudo a quienes se eligieron"},
    {"date":"2026-03-17","reach":97,"eng":15,"type":"CAROUSEL","theme":"HERIDAS INFANCIA","msg":"3 patrones en terapia por heridas de infancia"},
    {"date":"2026-03-16","reach":682,"eng":71,"type":"VIDEO","theme":"EMPODERAMIENTO","msg":"Senal de que te estas eligiendo: cortar lazos toxicos"},
    {"date":"2026-03-13","reach":391,"eng":8,"type":"VIDEO","theme":"ABUNDANCIA","msg":"Manifestar abundancia sanando, no afirmaciones"},
    {"date":"2026-03-13","reach":1889,"eng":31,"type":"VIDEO","theme":"ROLES/MATERNIDAD","msg":"Cumplir roles (madre,esposa) pero sentirse vacia"},
    {"date":"2026-03-13","reach":1044,"eng":30,"type":"VIDEO","theme":"ROLES/MATERNIDAD","msg":"Mismo contenido roles/cansancio (repetido)"},
    {"date":"2026-03-12","reach":257,"eng":36,"type":"VIDEO","theme":"HISTORIA PERSONAL","msg":"Algo cambio mi vida, encontre camino en oscuridad"},
    {"date":"2026-03-11","reach":78,"eng":8,"type":"CAROUSEL","theme":"HERIDAS INFANCIA","msg":"Madre siempre disponible marco tu forma de ser"},
    {"date":"2026-03-09","reach":228,"eng":53,"type":"CAROUSEL","theme":"RELACIONES SANAS","msg":"Relacion sana: amor libre, elegirse todos los dias"},
    {"date":"2026-03-07","reach":104,"eng":2,"type":"VIDEO","theme":"PRODUCTO/DIARIO","msg":"Diario de Accion Consciente, dejar piloto automatico"},
    {"date":"2026-03-05","reach":94,"eng":18,"type":"CAROUSEL","theme":"INTUICION","msg":"Por que ignoras tu intuicion"},
    {"date":"2026-03-04","reach":455,"eng":51,"type":"VIDEO","theme":"EVENTO/VENTA","msg":"Evento presencial 20 marzo en Limache"},
    {"date":"2026-03-04","reach":104,"eng":0,"type":"VIDEO","theme":"CTA GENERICO","msg":"Escribe VIDA en comentarios"},
    {"date":"2026-03-04","reach":109,"eng":0,"type":"VIDEO","theme":"HERIDAS INFANCIA","msg":"Romper traumas generacionales, 5 cosas que hago"},
    {"date":"2026-03-04","reach":300,"eng":18,"type":"VIDEO","theme":"HISTORIA PERSONAL","msg":"Lo que nadie dice de sanar"},
    {"date":"2026-03-02","reach":129,"eng":34,"type":"CAROUSEL","theme":"PRODUCTO/PROGRAMA","msg":"Sana y Libera tu Corazon - descripcion programa"},
    {"date":"2026-03-02","reach":116,"eng":4,"type":"VIDEO","theme":"APEGO/DEPENDENCIA","msg":"Confundir intensidad con amor"},
    {"date":"2026-03-02","reach":116,"eng":2,"type":"VIDEO","theme":"APEGO/DEPENDENCIA","msg":"Mismo contenido (duplicado)"},
    # February 2026
    {"date":"2026-02-28","reach":101,"eng":0,"type":"VIDEO","theme":"EMPODERAMIENTO","msg":"3 habitos para mujer empoderada"},
    {"date":"2026-02-28","reach":46,"eng":0,"type":"VIDEO","theme":"AUTOSANACION","msg":"Mi cuerpo expreso lo que no miraba"},
    {"date":"2026-02-27","reach":234,"eng":7,"type":"VIDEO","theme":"AUTOCONOCIMIENTO","msg":"3 preguntas para relacion genuina contigo"},
    {"date":"2026-02-26","reach":104,"eng":0,"type":"VIDEO","theme":"APEGO/DEPENDENCIA","msg":"Dar mucho y no recibir"},
    {"date":"2026-02-26","reach":120,"eng":0,"type":"VIDEO","theme":"HERIDAS INFANCIA","msg":"Cuesta sentir amor despues de poner limites"},
    {"date":"2026-02-25","reach":38,"eng":0,"type":"VIDEO","theme":"HERIDAS INFANCIA","msg":"Traumas inconscientes te estancan"},
    {"date":"2026-02-25","reach":135,"eng":4,"type":"VIDEO","theme":"HERIDAS INFANCIA","msg":"Nina interior y miedo al abandono"},
    {"date":"2026-02-25","reach":12,"eng":0,"type":"VIDEO","theme":"ABUNDANCIA","msg":"Mujer magnetica y abundante"},
    {"date":"2026-02-25","reach":68,"eng":8,"type":"CAROUSEL","theme":"LIMITES","msg":"Poner limites cuesta, alejar personas"},
    {"date":"2026-02-25","reach":2,"eng":2,"type":"VIDEO","theme":"AMOR PROPIO","msg":"Enamorate de ti, abrazate"},
    {"date":"2026-02-24","reach":121,"eng":0,"type":"VIDEO","theme":"BIENESTAR","msg":"Cierre mental antes de dormir"},
    {"date":"2026-02-23","reach":59,"eng":11,"type":"CAROUSEL","theme":"ROLES/MATERNIDAD","msg":"Mujeres no disfrutan tiempo solas por culpa"},
    {"date":"2026-02-21","reach":1069,"eng":9,"type":"VIDEO","theme":"ROLES/MATERNIDAD","msg":"Creemos que lo hacemos diferente pero reaccionamos igual"},
    {"date":"2026-02-21","reach":1314,"eng":17,"type":"VIDEO","theme":"ROLES/MATERNIDAD","msg":"Ser mama no deberia significar desaparecer como mujer"},
    {"date":"2026-02-20","reach":108,"eng":1,"type":"VIDEO","theme":"APEGO/DEPENDENCIA","msg":"Dejar de atraer vinculos toxicos"},
    {"date":"2026-02-20","reach":132,"eng":0,"type":"VIDEO","theme":"DUELO","msg":"Duelo de perder una parte de ti misma"},
    {"date":"2026-02-19","reach":206,"eng":4,"type":"VIDEO","theme":"ROLES/MATERNIDAD","msg":"Amar es postergarse, mujeres desaparecen"},
    {"date":"2026-02-18","reach":127,"eng":18,"type":"VIDEO","theme":"AMOR PROPIO","msg":"Culpa por disfrutar hacer cosas sola"},
    {"date":"2026-02-17","reach":1181,"eng":34,"type":"VIDEO","theme":"EMPODERAMIENTO","msg":"3 cosas mujer que se eligio a si misma"},
    {"date":"2026-02-16","reach":69,"eng":10,"type":"CAROUSEL","theme":"HERIDAS INFANCIA","msg":"Mejor regalo a hijos: trabajar heridas"},
    {"date":"2026-02-14","reach":138,"eng":31,"type":"VIDEO","theme":"AMOR PROPIO","msg":"Dia del amor, te estas eligiendo a ti"},
    {"date":"2026-02-14","reach":103,"eng":5,"type":"VIDEO","theme":"HERIDAS INFANCIA","msg":"No repetir patrones con hijos"},
    {"date":"2026-02-12","reach":76,"eng":12,"type":"CAROUSEL","theme":"HERIDAS INFANCIA","msg":"Habitos que rompen patrones infancia"},
    {"date":"2026-02-09","reach":152,"eng":28,"type":"CAROUSEL","theme":"ROLES/MATERNIDAD","msg":"No eres comprensiva, te postergas"},
    {"date":"2026-02-06","reach":69,"eng":10,"type":"CAROUSEL","theme":"EMPODERAMIENTO","msg":"Volver a ser protagonista de tu vida"},
    {"date":"2026-02-05","reach":222,"eng":12,"type":"VIDEO","theme":"HERIDAS INFANCIA","msg":"Repetir patrones normalizados que perjudican"},
    {"date":"2026-02-03","reach":4443,"eng":106,"type":"VIDEO","theme":"ROLES/MATERNIDAD","msg":"Madre siempre disponible postergandose, te marco"},
    {"date":"2026-02-03","reach":355,"eng":7,"type":"VIDEO","theme":"HERIDAS INFANCIA","msg":"Mujeres caracter fuerte = ninas que crecieron rapido"},
    {"date":"2026-02-03","reach":686,"eng":13,"type":"VIDEO","theme":"ROLES/MATERNIDAD","msg":"Mujeres guardan callan aguantan hasta explotar"},
]

# Theme performance
themes = defaultdict(lambda: {"count":0,"total_reach":0,"total_eng":0})
for p in posts:
    t = p["theme"]
    themes[t]["count"] += 1
    themes[t]["total_reach"] += p["reach"]
    themes[t]["total_eng"] += p["eng"]

print("=== THEME PERFORMANCE ===")
print(f"{'TEMA':<25} {'Posts':>5} {'Reach Total':>12} {'Reach Avg':>10} {'Eng Avg':>8}")
print("-"*65)
for t, d in sorted(themes.items(), key=lambda x: -x[1]["total_reach"]/x[1]["count"]):
    avg_r = d["total_reach"]/d["count"]
    avg_e = d["total_eng"]/d["count"]
    print(f"{t:<25} {d['count']:>5} {d['total_reach']:>12,} {avg_r:>10.0f} {avg_e:>8.1f}")

# Monthly theme distribution
print("\n=== TEMAS POR MES ===")
months_themes = {"2026-02": defaultdict(int), "2026-03": defaultdict(int)}
for p in posts:
    m = p["date"][:7]
    if m in months_themes:
        months_themes[m][p["theme"]] += 1

for m in sorted(months_themes):
    print(f"\n{m}:")
    for t, c in sorted(months_themes[m].items(), key=lambda x: -x[1]):
        print(f"  {t}: {c} posts")

# Posts with 0 engagement
print("\n=== POSTS CON 0 ENGAGEMENT ===")
zero = [p for p in posts if p["eng"] == 0]
print(f"Total: {len(zero)} de {len(posts)} ({len(zero)/len(posts)*100:.0f}%)")
for p in zero:
    print(f"  {p['date']} R={p['reach']} {p['theme']} - {p['msg'][:60]}")

# Duplicates
print("\n=== CONTENIDO DUPLICADO ===")
seen = {}
for p in posts:
    key = p["msg"][:40]
    if key in seen:
        print(f"  DUPLICADO: {p['date']} vs {seen[key]} - {p['msg'][:60]}")
    seen[key] = p["date"]

# JSON output for HTML
print("\n=== JSON_THEMES ===")
theme_data = []
for t, d in sorted(themes.items(), key=lambda x: -x[1]["total_reach"]/x[1]["count"]):
    theme_data.append({
        "theme": t,
        "count": d["count"],
        "avg_reach": round(d["total_reach"]/d["count"]),
        "avg_eng": round(d["total_eng"]/d["count"], 1)
    })
print(json.dumps(theme_data, ensure_ascii=False))
