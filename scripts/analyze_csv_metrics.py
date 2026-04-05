"""Analyze Meta Business Suite CSV exports and output metrics summary."""

dates = [
    '02-28','03-01','03-02','03-03','03-04','03-05','03-06','03-07',
    '03-08','03-09','03-10','03-11','03-12','03-13','03-14','03-15',
    '03-16','03-17','03-18','03-19','03-20','03-21','03-22','03-23',
    '03-24','03-25','03-26','03-27'
]
days_of_week = ['V','S','D','L','M','X','J','V','S','D','L','M','X','J','V','S','D','L','M','X','J','V','S','D','L','M','X','J']

followers = [0,1,1,3,1,1,0,0,0,0,1,1,1,0,1,1,0,0,2,4,1,1,0,11,0,1,0,2]
interactions = [3,4,4,4,3,2,0,0,0,0,3,5,2,1,0,3,1,1,2,1,0,3,3,6,2,6,2,5]
views = [1898,4853,4863,3479,2570,3094,1025,8,49,129,5545,4741,3438,2859,2636,2550,2623,2383,2584,1983,2014,2281,2295,2575,2532,2364,1933,2667]
spectators = [1630,4111,4167,3076,2123,2575,992,5,5,124,4842,3890,2850,2569,2144,2123,2208,1982,2154,1711,1591,1907,1916,2219,2092,1967,1595,2173]
visits_data = [9,27,12,30,15,10,3,6,3,0,27,16,25,6,23,16,18,9,24,24,43,21,22,9,24,9,11,27]
link_clicks = [10,24,25,21,13,8,4,0,0,0,33,23,20,12,14,17,14,9,9,13,7,12,11,11,23,23,15,21]

n = len(dates)

# Totals
total_followers = sum(followers)
total_interactions = sum(interactions)
total_views = sum(views)
total_spectators = sum(spectators)
total_visits = sum(visits_data)
total_clicks = sum(link_clicks)

# Averages
avg_views = total_views / n
avg_spectators = total_spectators / n
avg_interactions = total_interactions / n
avg_visits = total_visits / n
avg_clicks = total_clicks / n

# Week splits (7 days each)
def week_sum(data, s, e):
    return sum(data[s:e])

weeks = []
for i in range(4):
    s, e = i*7, (i+1)*7
    weeks.append({
        'views': week_sum(views, s, e),
        'spec': week_sum(spectators, s, e),
        'int': week_sum(interactions, s, e),
        'fol': week_sum(followers, s, e),
        'vis': week_sum(visits_data, s, e),
        'cli': week_sum(link_clicks, s, e),
    })

# Peaks
max_views_idx = views.index(max(views))
max_spec_idx = spectators.index(max(spectators))
max_int_idx = interactions.index(max(interactions))
max_fol_idx = followers.index(max(followers))
dead_days = sum(1 for v in views if v < 100)

# Engagement rate
avg_er = total_interactions / total_spectators * 100 if total_spectators > 0 else 0

# Day of week analysis
dow_names = ['L','M','X','J','V','S','D']
dow_views = {d: [] for d in dow_names}
dow_int = {d: [] for d in dow_names}
for i in range(n):
    dow_views[days_of_week[i]].append(views[i])
    dow_int[days_of_week[i]].append(interactions[i])

def var_pct(a, b):
    return ((b - a) / a * 100) if a > 0 else 0

# Demographics
ages = [('18-24',3.9,1.5),('25-34',10.9,4.7),('35-44',22.2,7.2),('45-54',21.7,5.4),('55-64',11.9,3.2),('65+',5.7,1.7)]
total_f = sum(a[1] for a in ages)
total_m = sum(a[2] for a in ages)

countries = [('Argentina',42),('Mexico',27.9),('Venezuela',11.4),('Colombia',10.7),('Paraguay',3.4),('Peru',1.6),('Bolivia',1.4),('Chile',1.1),('Espana',0.5),('EEUU',0.5)]

# OUTPUT
print("=== TOTALES (28 dias: 28 feb - 27 mar 2026) ===")
print(f"Visualizaciones totales: {total_views:,}")
print(f"Espectadores unicos totales: {total_spectators:,}")
print(f"Interacciones totales: {total_interactions}")
print(f"Seguidores nuevos: +{total_followers}")
print(f"Visitas al perfil: {total_visits}")
print(f"Clics en enlace: {total_clicks}")
print()

print("=== PROMEDIOS DIARIOS ===")
print(f"Visualizaciones/dia: {avg_views:,.0f}")
print(f"Espectadores/dia: {avg_spectators:,.0f}")
print(f"Interacciones/dia: {avg_interactions:.1f}")
print(f"Visitas/dia: {avg_visits:.1f}")
print(f"Clics/dia: {avg_clicks:.1f}")
print(f"Seguidores/dia: {total_followers/n:.1f}")
print()

print(f"=== ENGAGEMENT RATE ===")
print(f"ER promedio (interacciones/espectadores): {avg_er:.3f}%")
print()

print("=== POR SEMANA ===")
print(f"{'':>14} {'Views':>7} {'Espect':>7} {'Interac':>7} {'Follow':>7} {'Visitas':>7} {'Clics':>7}")
labels = ['S1(28f-6m)','S2(7-13m)','S3(14-20m)','S4(21-27m)']
for i, w in enumerate(weeks):
    print(f"{labels[i]:>14} {w['views']:>7,} {w['spec']:>7,} {w['int']:>7} {w['fol']:>7} {w['vis']:>7} {w['cli']:>7}")
print()

print("=== TENDENCIA SEMANAL ===")
for i in range(1, 4):
    vv = var_pct(weeks[i-1]['views'], weeks[i]['views'])
    vs = var_pct(weeks[i-1]['spec'], weeks[i]['spec'])
    vi = var_pct(weeks[i-1]['int'], weeks[i]['int'])
    print(f"S{i+1} vs S{i}: Views {vv:+.0f}%  Espect {vs:+.0f}%  Interacc {vi:+.0f}%")
print()

print("=== DIAS PICO ===")
print(f"Max views: {dates[max_views_idx]} ({days_of_week[max_views_idx]}) = {views[max_views_idx]:,}")
print(f"Max espectadores: {dates[max_spec_idx]} ({days_of_week[max_spec_idx]}) = {spectators[max_spec_idx]:,}")
print(f"Max interacciones: {dates[max_int_idx]} ({days_of_week[max_int_idx]}) = {interactions[max_int_idx]}")
print(f"Max seguidores: {dates[max_fol_idx]} ({days_of_week[max_fol_idx]}) = +{followers[max_fol_idx]}")
print(f"Dias muertos (<100 views): {dead_days}")
print()

print("=== POR DIA DE SEMANA (promedio) ===")
for d in dow_names:
    v = dow_views[d]
    i_d = dow_int[d]
    avg_v = sum(v)/len(v) if v else 0
    avg_i = sum(i_d)/len(i_d) if i_d else 0
    bar = "#" * int(avg_v / 100)
    print(f"  {d}: Views {avg_v:>6,.0f} {bar}  | Interacc {avg_i:.1f}")
print()

print("=== EMBUDO DE CONVERSION ===")
print(f"Visualizaciones:    {total_views:>8,}")
print(f"  -> Espectadores:  {total_spectators:>8,}  ({total_spectators/total_views*100:.1f}% de views)")
print(f"  -> Visitas perfil:{total_visits:>8}  ({total_visits/total_spectators*100:.2f}% de espectadores)")
print(f"  -> Clics enlace:  {total_clicks:>8}  ({total_clicks/total_visits*100:.1f}% de visitas)")
print(f"  -> Interacciones: {total_interactions:>8}  ({total_interactions/total_spectators*100:.3f}% de espectadores)")
print(f"  -> Nuevos seguids:{total_followers:>8}  ({total_followers/total_visits*100:.1f}% de visitas)")
print()

print("=== DEMOGRAFIA ===")
print("Edad y sexo:")
print(f"  {'':>5}  {'Mujeres':>8} {'Hombres':>8} {'Total':>8}")
for label, f, m in ages:
    print(f"  {label:>5}:  {f:>6.1f}%  {m:>6.1f}%  {f+m:>6.1f}%")
print(f"  {'Total':>5}:  {total_f:>6.1f}%  {total_m:>6.1f}%  {total_f+total_m:>6.1f}%")
print()

print("Paises:")
for c, p in countries:
    bar = "#" * int(p)
    print(f"  {c:>12}: {bar} {p}%")
print()

print("Ciudades top:")
cities = [('CDMX',4.9),('Tucuman',1.3),('Caracas',1.2),('Bogota',1.1),('Buenos Aires',1.0),('Cordoba',0.8)]
for c, p in cities:
    print(f"  {c}: {p}%")
