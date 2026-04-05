---
name: wp-modify
description: Modificar sitios WordPress via cPanel API + scripts PHP. Usar cuando el usuario pida cambios en WordPress (colores, tipografía, contenido, Elementor, imágenes, plugins, etc.)
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebFetch
argument-hint: [descripción del cambio a realizar]
---

# WordPress Modifier — Aura Digital

Skill para modificar sitios WordPress de clientes a través de cPanel API y scripts PHP ejecutados en servidor.

## Flujo de trabajo

1. **Leer** la configuración del cliente desde `clientes/{nombre}/13-web/config.json`
2. **Generar** el script PHP necesario en `clientes/{nombre}/13-web/scripts/`
3. **Subir** el script al servidor vía cPanel API
4. **Ejecutar** el script via HTTP
5. **Verificar** que funcionó
6. **Limpiar** el script del servidor si fue one-time

## Configuración por cliente

Cada cliente con sitio WordPress tiene un archivo `clientes/{nombre}/13-web/config.json`:

```json
{
  "domain": "www.digitalnextlevel.com",
  "cpanel_user": "digitaln",
  "cpanel_token": "RI45ZY722522O3IROH7S1MFV5BRKUGYJ",
  "cpanel_host": "digitalnextlevel.com",
  "public_html": "/home/digitaln/public_html",
  "wp_home_post_id": 3227,
  "theme": "astra",
  "page_builder": "elementor",
  "cache_plugin": "litespeed",
  "branding": {
    "colors": {
      "espresso": "#2A1F1A",
      "arcilla": "#8A7665",
      "terracota": "#C07A5A",
      "arena": "#EFEBE3",
      "nube": "#F7F3EE"
    },
    "fonts": {
      "headings": "Lora",
      "body": "Josefin Sans"
    }
  }
}
```

## Cómo subir archivos al servidor

### CRÍTICO: Reglas de subida via cPanel API

**Método correcto** — `save_file_content` con `MSYS_NO_PATHCONV=1`:

```bash
cd "ruta/a/scripts" && MSYS_NO_PATHCONV=1 curl -s \
  -H "Authorization: cpanel {USER}:{TOKEN}" \
  -X POST \
  --data-urlencode "dir=/home/{USER}/public_html" \
  --data-urlencode "file=nombre-script.php" \
  --data-urlencode "content@nombre-script.php" \
  "https://{HOST}:2083/execute/Fileman/save_file_content" 2>/dev/null
```

**Por qué `MSYS_NO_PATHCONV=1`**: Git Bash en Windows convierte automáticamente
`/home/digitaln/public_html` → `C:/Program Files/Git/home/digitaln/public_html`.
Esta variable de entorno desactiva esa conversión.

**NO usar** `upload_files` con `-F` porque no sobreescribe archivos existentes de forma fiable.

### Verificar que el archivo se subió correctamente

```bash
curl -s -H "Authorization: cpanel {USER}:{TOKEN}" \
  "https://{HOST}:2083/execute/Fileman/list_files?dir=%2Fhome%2F{USER}%2Fpublic_html&types=file" \
  | python3 -c "import json,sys; [print(f'{f[\"file\"]}: {f[\"size\"]} bytes') for f in json.load(sys.stdin).get('data',[])]"
```

### Subir a subdirectorios (mu-plugins, uploads, etc.)

```bash
MSYS_NO_PATHCONV=1 curl -s \
  -H "Authorization: cpanel {USER}:{TOKEN}" \
  -X POST \
  --data-urlencode "dir=/home/{USER}/public_html/wp-content/mu-plugins" \
  --data-urlencode "file=mi-plugin.php" \
  --data-urlencode "content@mi-plugin.php" \
  "https://{HOST}:2083/execute/Fileman/save_file_content"
```

## Cómo ejecutar scripts PHP en el servidor

```bash
curl -sL "https://{DOMAIN}/nombre-script.php?key={SECRET_KEY}" 2>/dev/null
```

### Gotchas de ejecución

1. **LiteSpeed Cache**: Si un script devolvió error/vacío una vez, LiteSpeed puede cachear
   esa respuesta vacía. Soluciones:
   - Reutilizar un nombre de archivo que ya funcionó antes
   - O incluir `litespeed_purge_all()` en otro script que sí funcione
   - O subir con un nombre totalmente nuevo que nunca se haya accedido

2. **WordPress intercepta PHP nuevos**: Archivos PHP nuevos pueden recibir 404 de WordPress
   porque `.htaccess` redirige a WP. Los archivos que ya existían antes NO tienen este
   problema. Solución: sobreescribir un archivo existente con el nuevo contenido.

3. **Archivos que ya existen y funcionan** en este servidor:
   - `aura-favicon-fix.php` (key: `aura2026fav`) — FUNCIONA
   - `aura-definitivo.php` (key: `aura2026def`) — FUNCIONA, **carrier principal**
   - `aura-brutal-fix.php` (key: `aura2026brutal`) — FUNCIONA
   - `aura-fix-all.php` (key: `aura2026fixall`) — FUNCIONA
   - `aura-final-fix.php` (key: `aura2026final`) — FUNCIONA

   **Carrier principal**: Usar `aura-definitivo.php` para todos los scripts nuevos.
   Sobreescribir su contenido con el nuevo script y ejecutar con `?key=aura2026def`.

4. **Siempre iniciar el script con**:

```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$SECRET_KEY = 'clave_secreta';
if (!isset($_GET['key']) || $_GET['key'] !== $SECRET_KEY) {
    die('Acceso denegado');
}

require_once dirname(__FILE__) . '/wp-load.php';
global $wpdb;
```

5. **NUNCA definir funciones que WordPress ya tiene**: `is_serialized()`, `wp_json_encode()`, etc.
   causan `Cannot redeclare` fatal error.

## Estructura de Elementor

### Dónde está la data

- **Contenido de páginas**: `wp_postmeta` → `meta_key = '_elementor_data'` (JSON)
- **CSS generado**: `wp_postmeta` → `meta_key = '_elementor_css'`
- **Global Kit** (tipografía/colores globales): post tipo `elementor_library` con `_elementor_type = 'kit'`
  - Settings en `_elementor_page_settings`
  - Data en `_elementor_data`
- **CSS files**: `/wp-content/uploads/elementor/css/`

### JSON de Elementor — Estructura

```json
[
  {
    "id": "abc123",
    "elType": "section",
    "settings": { "background_color": "#2A1F1A" },
    "elements": [
      {
        "id": "def456",
        "elType": "column",
        "settings": { "_column_size": 100 },
        "elements": [
          {
            "id": "ghi789",
            "elType": "widget",
            "widgetType": "heading",
            "settings": {
              "title": "Mi título",
              "typography_typography": "custom",
              "typography_font_family": "Lora",
              "typography_font_size": { "size": 28, "unit": "px" },
              "__globals__": { "typography": "globals/typography?id=xxxxx" }
            }
          }
        ]
      }
    ]
  }
]
```

### Widget types comunes

| widgetType | Qué es | Settings clave |
|------------|--------|----------------|
| `heading` | Título | `title`, `header_size`, `typography_font_size`, `__globals__` |
| `text-editor` | Párrafo | `editor` (HTML), `typography_font_size` |
| `image` | Imagen | `image.url`, `image.id`, `width`, `image_size` |
| `image-box` | Imagen + texto | `image.url`, `image_custom_dimension`, `title`, `description` |
| `icon-list` | Lista con iconos | `icon_list[].selected_icon`, `icon_list[].text`, `icon_size` |
| `button` | Botón | `text`, `link`, `typography_font_size` |
| `video` | Video | `youtube_url` o `hosted_url` |
| `divider` | Línea separadora | `style`, `color`, `weight` |

### Viñetas/Bullets — icon-list vs image

Las viñetas pueden ser:
- **icon-list widget**: Cada item tiene `selected_icon` con `library` y `value`. Para SVG:
  ```php
  $item['selected_icon'] = array(
      'value' => array('url' => $svg_url, 'id' => ''),
      'library' => 'svg',
  );
  $el['settings']['icon_size'] = array('size' => 40, 'unit' => 'px');
  ```
- **image widget**: Imagen pequeña usada como bullet decorativo:
  ```php
  $el['settings']['image'] = array('url' => $svg_url, 'id' => '');
  $el['settings']['width'] = array('size' => 55, 'unit' => 'px');
  ```

### `__globals__` — El enemigo

Elementor usa `__globals__` para referenciar presets globales de tipografía/color.
**Estos SOBREESCRIBEN los settings locales del widget**. Si un heading tiene:
```json
"typography_font_size": {"size": 28, "unit": "px"},
"__globals__": {"typography": "globals/typography?id=primary"}
```
El `__globals__` gana y aplica el tamaño del preset global (que puede ser 48px).

**Solución**: Eliminar `__globals__` con regex en el JSON crudo:
```php
$val = preg_replace('/"__globals__"\s*:\s*\{[^}]*?"typography"[^}]*?\}\s*,?\s*/', '', $val);
```

## CSS Override para Elementor

Elementor genera CSS inline con alta especificidad. Para sobreescribir:

### Dónde está el CSS actualmente (Chanel de la Rosa / digitalnextlevel.com)

El CSS de branding se inyecta desde **3 fuentes** (hay que actualizar TODAS para que un cambio sea consistente):

1. **`shfs_insert_header`** (option en `wp_options`) — Plugin "Simple Header Footer Scripts"
   - Option name: `shfs_insert_header`
   - Contiene el CSS completo de branding con `<style id="aura-design-system">`
   - Se inyecta en el `<head>` de todas las páginas
   - **Es la fuente principal del CSS visual** — minificado
   - Incluye: variables CSS, tipografía global, botones, nav, header, blog, FAQ, hover, etc.

2. **Customizer CSS** (post tipo `custom_css`)
   - `wp_posts` → `post_type = 'custom_css'`, `post_status = 'publish'`
   - Contiene el CSS de branding **formateado** (con indentación)
   - Se carga via `wp_head` por WordPress core

3. **mu-plugin** (`aura-fullwidth.php`)
   - Controla layout fullwidth + padding global
   - Resetea `.site-content .ast-container` a padding:0 para fullwidth
   - Aplica padding 40px al header (`#masthead .ast-container`)
   - Aplica padding 40px a secciones Elementor (`.elementor-section > .elementor-container`)
   - Aplica padding 40px al footer
   - Blog single post: max-width 800px centrado
   - Inyecta en `wp_head` Y `wp_footer` prioridad 999999

**IMPORTANTE sobre interacción entre fuentes**:
- SHFS y Customizer tienen reglas duplicadas (una minificada, otra formateada). Al cambiar
  algo, hacer str_replace en AMBOS formatos.
- El mu-plugin se carga DESPUÉS de SHFS/Customizer, así que sus reglas ganan en igualdad
  de especificidad. Si el mu-plugin tiene `padding:0` y SHFS tiene `padding:40px`, gana el 0.
- Astra theme settings (`get_option('astra-settings')`) también define font-weight y font-family
  que pueden competir. Actualizar si se cambia tipografía.

### Cómo actualizar CSS de branding

```php
// 1. Actualizar shfs_insert_header (fuente principal)
$shfs = get_option('shfs_insert_header');
// hacer str_replace o preg_replace
update_option('shfs_insert_header', $nuevo_css);

// 2. Actualizar Customizer CSS
$custom_css = $wpdb->get_row(
    "SELECT ID, post_content FROM {$wpdb->posts}
     WHERE post_type = 'custom_css' AND post_status = 'publish' LIMIT 1"
);
$wpdb->update($wpdb->posts,
    array('post_content' => $nuevo_contenido),
    array('ID' => $custom_css->ID)
);

// 3. mu-plugin solo si el cambio es de tipografía
$mu_file = ABSPATH . 'wp-content/mu-plugins/aura-nuclear-typography.php';
```

### IMPORTANTE: str_replace vs regex

- El CSS en `shfs_insert_header` está **minificado** (sin espacios ni newlines)
- El CSS en Customizer está **formateado** (con espacios e indentación)
- Para cambios simples, usar `str_replace` con ambas versiones (minificada y formateada)
- Para cambios complejos, usar `preg_replace` con `/si` flags

### Estrategia: mu-plugin con CSS en wp_footer

Un archivo en `/wp-content/mu-plugins/` se auto-carga sin activación.
Inyectar CSS en `wp_footer` (prioridad 999999) asegura que carga DESPUÉS de todo el CSS de Elementor.

```php
<?php
// /wp-content/mu-plugins/mi-override.php
add_action('wp_footer', function() {
    echo '<style id="mi-override">
    body .elementor-widget-heading .elementor-heading-title {
        font-size: 28px !important;
        font-family: "Lora", serif !important;
    }
    </style>';
}, 999999);
```

**Especificidad mínima que funciona**: `body .elementor-widget-heading .elementor-heading-title`

**No funciona**: `html body h1` — Elementor inline styles ganan.
**Sí funciona**: CSS en `wp_footer` con `!important` — carga después de los CSS generados.

También inyectar en `wp_head` (prioridad 999999) como pre-load para evitar FOUC.

### Lecciones aprendidas sobre CSS y Elementor

#### 1. mu-plugin CSS vs widget `<style>` embebido

El CSS del mu-plugin se inyecta en `wp_head` y `wp_footer`, pero los **HTML widgets de Elementor**
tienen su propio `<style>` embebido que se carga inline dentro del contenido de la página.
Este CSS embebido **gana la cascada** porque aparece después del mu-plugin CSS en el DOM.

**Solución**: Para cambiar estilos que están dentro de un HTML widget de Elementor, hay dos opciones:
- **Opción A (preferida)**: Modificar directamente el `_elementor_data` con `str_replace` para cambiar
  el valor CSS dentro del widget HTML embebido
- **Opción B**: Usar el mu-plugin con selectores MUY específicos + `!important` — funciona
  solo si el widget no tiene un selector igual o más específico

#### 2. Cuidado con str_replace en JSON de Elementor

El `_elementor_data` es JSON con caracteres escapados. Al hacer `str_replace`:
- Las comillas son `\\\"` no `\"`
- Los acentos son `\\u00e9` (é), `\\u00f3` (ó), `\\u00ed` (í), `\\u00f1` (ñ)
- Los saltos de línea son `\\n`
- Las barras son `\\/`

**CRÍTICO**: Un str_replace mal formado puede corromper el JSON y romper toda la página.
Si el JSON se corrompe, Elementor no puede parsearlo y WordPress muestra el `post_content`
fallback (que puede ser contenido antiguo como "Quienes Somos").

**Verificación obligatoria**: Después de modificar `_elementor_data`:
```php
$test = json_decode($new_value, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die('JSON CORRUPTO: ' . json_last_error_msg());
}
```

**Método seguro para cambios complejos**: En vez de str_replace en el JSON crudo,
decodificar → modificar el array PHP → re-encodear:
```php
$data = json_decode($meta->meta_value, true);
// ... modificar $data ...
$json = wp_json_encode($data);
$wpdb->update(...);
```

#### 3. Backgrounds de página: múltiples capas que compiten

En una página WordPress con Astra + Elementor, el fondo visible es el resultado de:
1. `body` background (Astra theme)
2. `.site-content` / `.ast-container` background
3. Elementor section background (`.elementor-top-section`)
4. Elementor column background
5. Widget inline styles

Para garantizar que un fondo se aplique, hay que sobreescribir **todas las capas**:
```css
body.page-id-XXXX,
.page-id-XXXX .site-content,
.page-id-XXXX .ast-container,
.page-id-XXXX .elementor-section,
.page-id-XXXX .elementor-top-section {
    background: #FFFFFF !important;
}
```

#### 4. Selectores CSS leaking fuera de `<style>`

Al acumular CSS en el mu-plugin con `str_replace('</style>\';', $new_css . '</style>\';', $mu)`,
es posible que CSS quede **fuera** del string del echo si la inserción rompe las comillas.
Esto causa que el CSS aparezca como texto visible en el frontend.

**Prevención**: Siempre verificar que las comillas simples dentro del CSS estén escapadas,
y después de guardar el mu-plugin, verificar que `</style>';` sigue cerrando correctamente.

#### 5. Spacing con header fixed/sticky

Astra con header sticky hace que el contenido quede debajo del header.
`padding-top` en `.site-content` NO siempre funciona porque Astra/Elementor
pueden tener sus propias reglas de spacing.

**Lo que funciona**: `margin-top` directo en el primer widget visible:
```css
.page-id-XXXX .elementor-widget-heading:first-child {
    margin-top: 160px !important;
}
```

## Blog Posts — Estilo y estructura

### Clave: los blogs NO usan Elementor

Los blog posts (`post_type = 'post'`) son HTML puro en `post_content`, **no usan `_elementor_data`**.
Los headings son tags HTML directos (`<h2>`, `<h3>`, etc.) sin atributos ni inline styles.
El CSS del tema Astra controla los tamaños por defecto — los h2 salen muy grandes.

### Cómo modificar headings de blog

Para cambiar el nivel de headings en todos los posts, modificar directamente el `post_content`:

```php
$posts = $wpdb->get_results(
    "SELECT ID, post_content FROM {$wpdb->posts}
     WHERE post_type = 'post' AND post_status = 'publish'"
);

foreach ($posts as $post) {
    $content = $post->post_content;
    // ORDEN IMPORTA: primero los más pequeños para evitar doble-conversión
    // h3 → h4 PRIMERO, luego h2 → h3
    $content = preg_replace('/<h3(\s[^>]*)?>/', '<h4$1>', $content);
    $content = str_replace('</h3>', '</h4>', $content);
    $content = preg_replace('/<h2(\s[^>]*)?>/', '<h3$1>', $content);
    $content = str_replace('</h2>', '</h3>', $content);

    $wpdb->update($wpdb->posts,
        array('post_content' => $content),
        array('ID' => $post->ID)
    );
}
```

### CSS para blog posts

Los blogs usan la clase `body.single-post` (no `.single`). Los selectores CSS deben
usar esta clase para alta especificidad:

```css
/* Headings de sección (h3 después del downgrade) */
body.single-post .entry-content h3 {
  font-family: "Playfair Display", serif !important;
  font-size: 22px !important;
  font-weight: 500 !important;
  margin-top: 32px !important;
  margin-bottom: 16px !important;
}

/* Sub-headings (h4 después del downgrade) */
body.single-post .entry-content h4 {
  font-family: "Playfair Display", serif !important;
  font-size: 19px !important;
  font-weight: 500 !important;
  margin-top: 24px !important;
  margin-bottom: 12px !important;
}

/* Título principal del post */
body.single-post .entry-title {
  font-size: 26px !important;
  font-weight: 500 !important;
}

/* Body text — light weight (Outfit 300) */
body.single-post .entry-content p,
body.single-post .entry-content li {
  font-weight: 300 !important;
  font-size: 17px !important;
  line-height: 1.7 !important;
}

/* Strong/bold — medium, not heavy */
body.single-post .entry-content strong,
body.single-post .entry-content b {
  font-weight: 500 !important;
}

/* Spacing heading → párrafo */
body.single-post .entry-content h3 + p { margin-top: 8px !important; }
body.single-post .entry-content p + h3 { margin-top: 32px !important; }
```

### Lecciones aprendidas sobre blogs

1. **CSS solo NO basta**: Astra tiene estilos de heading con alta especificidad que ganan
   sobre CSS custom. Cambiar el tag HTML (h2→h3) es más efectivo que solo CSS.

2. **Los blogs NO tienen `_elementor_data`**: Buscar en `post_content` directamente,
   no en `wp_postmeta`. Un query con `JOIN ... _elementor_data` devuelve 0 resultados.

3. **Componentes custom en blogs** (`.aura-blog-grid`, `.aura-blog-cta`, `.aura-blog-steps`)
   se definen en el CSS inyectado vía `shfs_insert_header`. Para cambiar layout (ej: grid
   2 columnas → 1 columna), agregar CSS con `body.single-post .aura-blog-grid`.

4. **Orden de conversión de headings**: Siempre convertir de abajo hacia arriba
   (h3→h4 primero, h2→h3 después) para evitar que h2→h3→h4 en doble pasada.

5. **Inline styles > CSS externo para spacing**: Astra sobreescribe margins de headings con
   alta especificidad. Para garantizar spacing, meter `style="margin-top:32px;margin-bottom:16px;"`
   directo en el tag HTML del `post_content`. Inline styles no los puede sobreescribir el tema.

6. **Contraste de colores — NUNCA texto y fondo del mismo tono**:
   - `.aura-blog-cta` (fondo terracota `#C07A5A`): texto `#fff`, botón fondo `#2A1F1A` con texto `#fff`
   - `.aura-blog-highlight` (fondo arena `#EFEBE3`): texto `#2A1F1A`
   - `.aura-blog-tip`: texto `#2A1F1A`
   - `.aura-blog-step-num` (fondo terracota): texto `#fff`
   - Contenido general de blog: texto `#000`, headings h3 `#C07A5A` (terracota), sub-headings h4 `#C07A5A`
   - Al aplicar `color: #000 !important` a `.entry-content`, excluir SIEMPRE los componentes con fondo
     oscuro (`.aura-blog-cta`) usando selectores más específicos que restauren `color: #fff`.

7. **CSS global para header — NUNCA en selectores de blog**:
   El header es renderizado por Astra, no por Elementor ni por el contenido del post.
   Las reglas CSS del header deben ser globales (sin prefijo `body.single-post`).
   Si el header se ve diferente en blogs vs homepage, el problema es CSS conflictivo
   en el Customizer — limpiar reglas duplicadas antes de agregar nuevas.

8. **Múltiples fuentes CSS compiten**: Al cambiar estilos, actualizar SIEMPRE:
   - `shfs_insert_header` (option en wp_options) — fuente principal, minificado
   - Customizer CSS (post_type `custom_css`) — formateado
   - Y remover versiones anteriores del mismo bloque antes de insertar el nuevo
     (usar comentarios `/* === NOMBRE === */` ... `/* === END NOMBRE === */` como delimitadores)

## Limpieza de caché — Siempre al final de cada script

```php
// Elementor CSS meta
$wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key = '_elementor_css'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name = '_elementor_global_css'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_elementor%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_elementor%'");

// Archivos CSS generados
$css_dir = $upload_dir['basedir'] . '/elementor/css/';
if (is_dir($css_dir)) {
    foreach (glob($css_dir . '*') as $f) {
        if (is_file($f)) unlink($f);
    }
}

// LiteSpeed
if (function_exists('litespeed_purge_all')) {
    litespeed_purge_all();
}
```

### Purge automático desde el script (sin entrar a wp-admin)

En lugar de pedirle al usuario que entre a wp-admin, incluir el purge de LiteSpeed
y la regeneración de CSS de Elementor directamente en el script PHP:

```php
// LiteSpeed purge
if (function_exists('litespeed_purge_all')) {
    litespeed_purge_all();
}

// Regenerar CSS de Elementor programáticamente
if (class_exists('\Elementor\Plugin')) {
    \Elementor\Plugin::$instance->files_manager->clear_cache();
}
```

Si `files_manager->clear_cache()` no está disponible en la versión instalada, la limpieza
manual de `_elementor_css` + archivos en `/uploads/elementor/css/` + transients es
equivalente. Elementor regenera los CSS al primer request después de eliminarlos.

**Solo pedir pasos manuales si el script falla o si el caché sigue sirviendo versiones viejas.**
En ese caso, el usuario debe:
1. wp-admin → Elementor → Herramientas → Regenerar CSS
2. LiteSpeed Cache → Purge All (si disponible)
3. Ctrl+Shift+R en el navegador

## Reemplazo masivo de colores

Para reemplazar colores en Elementor data (ej: violeta → tierra):

```php
$color_map = array(
    '#6714cc' => '#C07A5A',
    '#7c23dc' => '#C07A5A',
    '#2D113B' => '#2A1F1A',
    // ... más colores
);

$all_meta = $wpdb->get_results(
    "SELECT post_id, meta_id, meta_value FROM {$wpdb->postmeta}
     WHERE meta_key = '_elementor_data' AND meta_value != '' AND meta_value != '[]'"
);

foreach ($all_meta as $row) {
    $val = $row->meta_value;
    $orig = $val;
    foreach ($color_map as $old => $new) {
        $val = str_ireplace($old, $new, $val);
    }
    if ($val !== $orig) {
        $wpdb->update($wpdb->postmeta,
            array('meta_value' => $val),
            array('meta_id' => $row->meta_id)
        );
    }
}
```

También reemplazar en:
- `wp_options` → `astra-settings` (serialized)
- `wp_options` → `elementor_active_kit`
- `wp_postmeta` → `_elementor_page_settings`

## Modificación de tipografía global (Elementor Kit)

```php
$kit_id = $wpdb->get_var(
    "SELECT p.ID FROM {$wpdb->posts} p
     INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
     WHERE p.post_type = 'elementor_library'
     AND pm.meta_key = '_elementor_type' AND pm.meta_value = 'kit'
     LIMIT 1"
);

$kit_settings = $wpdb->get_row($wpdb->prepare(
    "SELECT meta_id, meta_value FROM {$wpdb->postmeta}
     WHERE post_id = %d AND meta_key = '_elementor_page_settings' LIMIT 1", $kit_id
));

$ks = json_decode($kit_settings->meta_value, true);
$sizes = array('h1' => 28, 'h2' => 24, 'h3' => 22, 'h4' => 20, 'h5' => 18, 'h6' => 16);
foreach ($sizes as $tag => $sz) {
    $ks[$tag . '_typography_typography'] = 'custom';
    $ks[$tag . '_typography_font_family'] = 'Lora';
    $ks[$tag . '_typography_font_size'] = array('size' => $sz, 'unit' => 'px');
}
$wpdb->update($wpdb->postmeta,
    array('meta_value' => wp_json_encode($ks)),
    array('meta_id' => $kit_settings->meta_id)
);
```

## Habilitar SVG uploads

Añadir en mu-plugin:
```php
add_filter('upload_mimes', function($mimes) {
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
});
```

## Subir fotos/imágenes al servidor

Las fotos NO se pueden subir via cPanel API `save_file_content` (solo texto) ni via base64 POST
(corrompe binarios — el tamaño coincide pero la imagen no se renderiza). El único método fiable es
**multipart POST** a un script PHP receptor.

### Método correcto: multipart POST en 3 pasos

**Paso 1 — Comprimir la imagen localmente** (Pillow):

```python
from PIL import Image
img = Image.open('foto-original.jpg')
# Redimensionar a max 800px lado largo
max_dim = 800
ratio = min(max_dim / img.width, max_dim / img.height)
if ratio < 1:
    img = img.resize((int(img.width * ratio), int(img.height * ratio)), Image.LANCZOS)
if img.mode == 'RGBA':
    img = img.convert('RGB')
img.save('foto-web.jpg', 'JPEG', quality=82, optimize=True)
```

**Paso 2 — Escribir script PHP receptor** (usar un carrier existente):

```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
if (!isset($_GET['key']) || $_GET['key'] !== 'SECRET') die('Acceso denegado');

$target_dir = dirname(__FILE__) . '/wp-content/uploads/2026/03/';
if (!is_dir($target_dir)) mkdir($target_dir, 0755, true);

foreach ($_FILES as $key => $file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo "<p style='color:red'>$key: error " . $file['error'] . "</p>";
        continue;
    }
    $dest = $target_dir . $file['name'];
    if (move_uploaded_file($file['tmp_name'], $dest)) {
        echo "<p style='color:green'>" . $file['name'] . " — " . filesize($dest) . " bytes OK</p>";
        // Verificar JPEG válido
        $header = file_get_contents($dest, false, null, 0, 3);
        echo "<p>JPEG: " . (bin2hex($header) === 'ffd8ff' ? 'VALID' : 'INVALID') . "</p>";
    }
}
```

**Paso 3 — Enviar con Windows curl.exe** (NO Git Bash curl):

```bash
/c/Windows/System32/curl.exe -sL \
  -F "photo=@/ruta/local/foto-web.jpg" \
  "https://{DOMAIN}/carrier-script.php?key=SECRET"
```

### Por qué Windows curl.exe y NO Git Bash curl

Git Bash curl falla con **exit code 26** en archivos multipart de más de ~50KB.
Windows curl.exe (`/c/Windows/System32/curl.exe`) maneja multipart correctamente
sin límite práctico de tamaño.

### Métodos que NO funcionan

| Método | Problema |
|--------|----------|
| cPanel API `save_file_content` | Solo acepta texto, no binarios |
| Base64 POST → `base64_decode()` en PHP | El archivo se guarda con el tamaño correcto pero la imagen queda corrupta y no se renderiza |
| Git Bash `curl -F` | Exit code 26 en archivos >50KB |
| cPanel API `upload_files` con `-F` | No sobreescribe archivos existentes de forma fiable |

### Actualizar referencia en Elementor después de subir

Después de subir la foto, actualizar el cache bust en el Elementor data:

```php
$val = preg_replace(
    '/nombre-foto\.jpg\?v=\d+/',
    'nombre-foto.jpg?v=' . time(),
    $val
);
```

## Personalización de plugins — Modificar estilos via DB, no CSS

### Regla general: Plugin settings > CSS overrides

Cuando un plugin de WordPress (Complianz, WPForms, etc.) genera UI con estilos propios,
**modificar sus settings en la base de datos** es siempre mejor que inyectar CSS override.

**Por qué**:
- El plugin genera su propio CSS con selectores específicos, posicionamiento y layout
- Un CSS override con `!important` puede romper el layout (overflow, position, width)
- Cada intento de arreglar un problema CSS crea otro (botones fuera del recuadro, banner cortado, etc.)
- Cambiar los valores en DB hace que el plugin genere CSS correcto desde el inicio

### Complianz (GDPR Cookie Consent)

**Tabla**: `wp_cmplz_cookiebanners` (ID = 1 es el banner por defecto)

**Columnas de color** (actualizables con `$wpdb->update`):

| Columna | Qué controla |
|---------|-------------|
| `popup_background_color` | Fondo del banner |
| `popup_text_color` | Color del texto |
| `button_background_color` | Fondo botón "Denegar" |
| `button_text_color` | Texto botón "Denegar" |
| `accept_all_background_color` | Fondo botón "Aceptar" |
| `accept_all_text_color` | Texto botón "Aceptar" |
| `accept_all_border_color` | Borde botón "Aceptar" |
| `functional_background_color` | Fondo botón "Ver preferencias" |
| `functional_text_color` | Texto botón "Ver preferencias" |
| `functional_border_color` | Borde botón "Ver preferencias" |
| `border_color` | Borde del banner |
| `slider_background_color` | Toggle activo |
| `slider_background_color_inactive` | Toggle inactivo |
| `slider_bullet_color` | Bullet del toggle |

**Columnas serializadas** (colorpalettes):

```php
$wpdb->update($wpdb->prefix . 'cmplz_cookiebanners', array(
    'colorpalette_background' => serialize(array('color' => '#2A1F1A', 'border' => '#2A1F1A')),
    'colorpalette_text' => serialize(array('color' => '#EFEBE3', 'hyperlink' => '#C07A5A')),
    'colorpalette_toggles' => serialize(array('background' => '#C07A5A', 'bullet' => '#FFF', 'inactive' => '#8A7665')),
    'colorpalette_button_accept' => serialize(array('background' => '#C07A5A', 'border' => '#C07A5A', 'text' => '#FFF')),
    'colorpalette_button_deny' => serialize(array('background' => '#FFF', 'border' => '#FFF', 'text' => '#2A1F1A')),
    'colorpalette_button_settings' => serialize(array('background' => '#FFF', 'border' => '#FFF', 'text' => '#2A1F1A')),
    'buttons_border_radius' => serialize(array('top' => 100, 'right' => 100, 'bottom' => 100, 'left' => 100, 'type' => 'px')),
), array('ID' => 1));
```

**Después de actualizar** (los 3 pasos son OBLIGATORIOS, si falta uno los colores no cambian):
```php
// 1. Bumpar versión para forzar re-render
$wpdb->query("UPDATE {$wpdb->prefix}cmplz_cookiebanners SET banner_version = banner_version + 1 WHERE ID = 1");

// 2. Eliminar transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%cmplz%' AND option_name LIKE '%transient%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_cmplz%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_cmplz%'");

// 3. CRÍTICO: Eliminar el archivo CSS cacheado de Complianz
//    Complianz genera un CSS externo en /wp-content/uploads/complianz/css/banner-{id}-{type}.css
//    Si no se elimina este archivo, los colores viejos persisten aunque la DB esté actualizada
$upload_dir = wp_upload_dir();
$cmplz_css_dir = $upload_dir['basedir'] . '/complianz/css/';
if (is_dir($cmplz_css_dir)) {
    foreach (glob($cmplz_css_dir . '*') as $f) {
        if (is_file($f)) unlink($f);
    }
}
```

**IMPORTANTE**: La referencia al CSS está en el JS config de Complianz como
`css_file: ".../complianz/css/banner-{banner_id}-{type}.css?v={version}"`.
Al bumpar la versión Y eliminar el archivo, Complianz lo regenera con los nuevos colores.

**Otras settings útiles**: `banner_width` (int px, solo variable CSS, NO limita ancho real),
`font_size` (int), `position` (bottom/center), `theme` (minimal/classic), `use_box_shadow` (0/1).

**Links legales** — Complianz muestra links según estas columnas:
- `readmore_optin` → "Política de cookies" (la que SÍ se quiere mostrar)
- `readmore_privacy` → "Declaración de privacidad" (vaciar si no aplica)
- `readmore_impressum` → "Impressum" (vaciar — es ley alemana, no aplica en España/LATAM)
- `readmore_optout_dnsmpi` → "Do Not Sell My Personal Information" (vaciar — es ley CCPA de California)
- `legal_documents` → 1 para mostrar links, 0 para ocultarlos todos

Para limpiar links no deseados:
```php
$wpdb->update($wpdb->prefix . 'cmplz_cookiebanners', array(
    'legal_documents' => 1,
    'readmore_optin' => 'Política de cookies',
    'readmore_privacy' => '',
    'readmore_impressum' => '',
    'readmore_optout' => '',
    'readmore_optout_dnsmpi' => '',
), array('ID' => 1));
```

**Custom CSS de Complianz** (se añade al final del CSS generado del banner):
```php
$wpdb->update($wpdb->prefix . 'cmplz_cookiebanners', array(
    'use_custom_cookie_css' => 1,
    'custom_css' => '.cmplz-cookiebanner { max-width: 420px !important; left: 50% !important; transform: translateX(-50%) !important; }',
), array('ID' => 1));
```
Usar `custom_css` es la forma correcta de cambiar layout (centrado, ancho, botones) porque
se incluye dentro del propio CSS generado por Complianz con la especificidad adecuada.

**IMPORTANTE**: `banner_width` solo define una variable CSS (`--cmplz_banner_width`), pero en
desktop (>1024px) Complianz usa `width: calc(100% - 20px)` que la ignora. Para limitar el ancho
real hay que usar `custom_css` con `max-width !important`.

**Diagnóstico**: Para ver los settings actuales:
```php
$banner = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}cmplz_cookiebanners WHERE ID = 1");
print_r($banner);
```

### Lección aprendida: NO usar heredocs en mu-plugins

**NUNCA** usar PHP heredocs (`<<<LABEL ... LABEL;`) dentro de código que se inyecta en mu-plugins.
Los heredocs anidados (heredoc dentro de heredoc) causan errores de sintaxis fatales que
**tumban todo el sitio** porque los mu-plugins se cargan en TODAS las páginas.

**Usar en su lugar**:
```php
echo '<style>';
echo '.selector { color: red; }';
echo '</style>';
```

O concatenación:
```php
$css = '<style>';
$css .= '.selector { color: red; }';
$css .= '</style>';
echo $css;
```

### Lección aprendida: Verificar sintaxis antes de guardar mu-plugins

Siempre verificar sintaxis PHP antes de guardar un mu-plugin modificado:
```php
$tmp = tempnam(sys_get_temp_dir(), 'mu_');
file_put_contents($tmp, $new_content);
$ret = 0;
exec("php -l " . escapeshellarg($tmp) . " 2>&1", $output, $ret);
unlink($tmp);
if ($ret !== 0) {
    die("SYNTAX ERROR — no se guarda el mu-plugin");
}
file_put_contents($mu_path, $new_content);
```

Un mu-plugin con error de sintaxis = **sitio completamente caído** (pantalla blanca / error crítico).

## Arquitectura de estilos en WordPress — Capas y prioridad

WordPress tiene **múltiples fuentes de CSS** que interactúan entre sí. Entender el orden de
cascada y dónde modificar es CRÍTICO para no romper layout ni comportamiento JS.

### Capas de CSS (de menor a mayor prioridad)

```
1. Tema (Astra)         → wp-content/themes/astra/style.css
2. Elementor global     → Kit settings + CSS generado en uploads/elementor/css/
3. Elementor por página → _elementor_data JSON → CSS inline en <style>
4. Plugins CSS externo  → Ej: uploads/complianz/css/banner-1-optin.css?v=XX
5. Plugin custom_css    → Appendeado al final del CSS externo del plugin (#4)
6. mu-plugin wp_head    → add_action('wp_head', fn, 999999)
7. mu-plugin wp_footer  → add_action('wp_footer', fn, 999999) — MÁS prioridad
8. Inline styles (JS)   → element.style.display = 'none' — vía JavaScript
```

**Regla**: Para colores/tipografía de plugins → usar DB settings (#4).
Para layout de plugins → usar custom_css del plugin (#5).
Para overrides de tema/Elementor → usar mu-plugin wp_footer (#7).

### Dónde se almacenan estilos por componente

| Componente | Dónde están los estilos | Cómo modificar |
|-----------|------------------------|---------------|
| **Astra (tema)** | `wp_options` → `astra-settings` (serialized) | `$wpdb->update` en options |
| **Elementor Kit** | `wp_postmeta` → `_elementor_page_settings` del kit | JSON decode → modify → encode |
| **Elementor widgets** | `wp_postmeta` → `_elementor_data` (JSON) | Buscar widget por ID, modificar settings |
| **Elementor CSS** | `uploads/elementor/css/` + `_elementor_css` meta | Borrar archivos + meta para regenerar |
| **Complianz banner** | `wp_cmplz_cookiebanners` (tabla propia) | `$wpdb->update` en columnas de color |
| **Complianz CSS** | `uploads/complianz/css/banner-{id}-{type}.css` | Borrar archivo + bump version + regenerar |
| **Complianz custom CSS** | `wp_cmplz_cookiebanners.custom_css` | Ideal para layout overrides |
| **mu-plugin CSS** | `wp-content/mu-plugins/*.php` → wp_head/wp_footer | echo `<style>` en hooks |
| **mu-plugin JS** | `wp-content/mu-plugins/*.php` → wp_footer | echo `<script>` para fixes de comportamiento |

### CRÍTICO: `display` y `!important` en plugins con JS interactivo

Los plugins como Complianz usan JavaScript para show/hide de elementos. El JS hace:
```js
element.style.display = 'none';  // ocultar (inline style)
element.style.display = '';       // mostrar (quita inline, CSS toma control)
```

**NUNCA usar `display: X !important`** en el contenedor principal de un plugin interactivo.
CSS `!important` > inline styles sin `!important`, por lo que:
- `display: flex !important` en CSS → el JS NO puede ocultar con `style.display = 'none'`
- `display: none !important` en CSS → el JS NO puede mostrar con `style.display = ''`

**Solución**: Usar `display` SIN `!important` en el CSS del plugin. El CSS custom se appenda
al final del archivo generado, así que gana por cascada sobre las reglas del plugin,
pero el JS inline style puede overridearlo:
```css
/* CORRECTO — JS puede override */
.cmplz-cookiebanner { display: flex; flex-direction: column !important; }

/* INCORRECTO — JS no puede ocultar el banner */
.cmplz-cookiebanner { display: flex !important; }
```

**Excepción**: Las reglas de ocultación con clases específicas SÍ pueden usar `!important`
porque tienen mayor especificidad que la regla base:
```css
/* OK — specificity 0,2,0 beats 0,1,0 */
.cmplz-cookiebanner.cmplz-hidden { display: none !important; }
.cmplz-cookiebanner.cmplz-dismissed { display: none !important; }
```

### Complianz: Layout correcto con custom_css

El CSS generado por Complianz usa un grid complejo (2-3 columnas en desktop) que es
imposible de sobreescribir limpiamente con grid overrides. La solución probada:

**Cambiar a flex column** vía custom_css (sin !important en display):
```css
/* Banner: flex column reemplaza grid */
.cmplz-cookiebanner {
    display: flex;                        /* SIN !important */
    flex-direction: column !important;
    max-width: 440px !important;
    width: 92vw !important;
    left: 50% !important;
    right: auto !important;
    bottom: 10px !important;
    top: auto !important;
    transform: translateX(-50%) !important;
}

/* Ocultar elementos internos no necesarios */
.cmplz-cookiebanner .cmplz-header { display: none !important; }
.cmplz-cookiebanner .cmplz-divider { display: none !important; }
.cmplz-cookiebanner .cmplz-links.cmplz-information { display: none !important; }
.cmplz-cookiebanner .cmplz-buttons a.cmplz-btn.tcf { display: none !important; }

/* Body vertical */
.cmplz-cookiebanner .cmplz-body {
    display: flex !important;
    flex-direction: column !important;
    order: 1 !important;
}

/* Botones: fila horizontal, todos iguales */
.cmplz-cookiebanner .cmplz-buttons {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 6px !important;
    order: 2 !important;
}
.cmplz-cookiebanner .cmplz-buttons .cmplz-btn {
    flex: 1 1 0% !important;
    min-width: 0 !important;
    font-size: 12px !important;
    padding: 10px 8px !important;
    height: auto !important;
    white-space: nowrap !important;
}
/* Fix: a.cmplz-btn tiene padding:initial en generado */
.cmplz-cookiebanner .cmplz-buttons a.cmplz-btn {
    padding: 10px 8px !important;
}

/* Links debajo de botones */
.cmplz-cookiebanner .cmplz-links.cmplz-documents {
    justify-content: center !important;
    order: 3 !important;
}
```

### Complianz: Estructura HTML del banner

```
.cmplz-cookiebanner (contenedor — grid por defecto, flex con override)
  ├── .cmplz-header (oculto por defecto en tema minimal)
  ├── .cmplz-divider.cmplz-divider-header
  ├── .cmplz-body
  │     ├── .cmplz-message (texto de consentimiento)
  │     └── .cmplz-categories (ocultas, se muestran con "Ver preferencias")
  │           ├── details.cmplz-category.cmplz-functional
  │           ├── details.cmplz-category.cmplz-preferences
  │           ├── details.cmplz-category.cmplz-statistics
  │           └── details.cmplz-category.cmplz-marketing
  ├── .cmplz-links.cmplz-information (oculto — links de gestión TCF)
  ├── .cmplz-divider.cmplz-footer
  ├── .cmplz-buttons (HIJO DIRECTO del banner, NO dentro de .cmplz-body)
  │     ├── button.cmplz-accept ("Aceptar cookies")
  │     ├── button.cmplz-deny ("Denegar")
  │     ├── button.cmplz-view-preferences ("Ver preferencias")
  │     ├── button.cmplz-save-preferences (oculto inicialmente)
  │     └── a.cmplz-btn.tcf (duplicado TCF — OCULTAR siempre)
  └── .cmplz-links.cmplz-documents (links legales: política cookies, etc.)
```

**IMPORTANTE**: `.cmplz-buttons` y `.cmplz-links` son hijos directos del banner,
NO están dentro de `.cmplz-body`. Esto causa problemas con grid porque el CSS generado
les asigna `grid-column-start: 3` (columna implícita fuera del banner visible).

### Complianz: Comportamiento JS — Reset de estado al reabrir

Complianz no resetea el estado de las categorías cuando el banner se reabre vía
"Administrar consentimiento". Si el usuario desplegó preferencias y guardó, al reabrir
sigue desplegado. Fix con mu-plugin JS separado (`aura-cookie-reset.php`):

```php
<?php
/* mu-plugins/aura-cookie-reset.php */
add_action("wp_footer", function() {
    echo '<script>
document.addEventListener("click", function(e) {
    if (e.target.closest(".cmplz-manage-consent")) {
        var b = document.querySelector(".cmplz-cookiebanner");
        if (!b) return;
        b.classList.remove("cmplz-categories-visible");
        var cats = b.querySelector(".cmplz-categories");
        if (cats) { cats.classList.remove("cmplz-fade-in"); cats.style.display = ""; }
        b.querySelectorAll(".cmplz-btn").forEach(function(btn) {
            if (btn.classList.contains("cmplz-save-preferences")) btn.style.display = "none";
            if (btn.classList.contains("cmplz-accept")) btn.style.display = "";
            if (btn.classList.contains("cmplz-deny")) btn.style.display = "";
            if (btn.classList.contains("cmplz-view-preferences")) btn.style.display = "";
        });
    }
});
</script>';
}, 999999);
```

**SIEMPRE** crear mu-plugins JS como archivos separados (no en el mu-plugin principal de 85KB).
Un error en un mu-plugin de 1KB es más fácil de diagnosticar que en uno de 85KB.

### Lección: Reglas CSS con scope incorrecto pueden destruir la cascada

**Problema real**: Una regla `body { font-weight: 500 !important; }` que estaba pensada para
el contenido de un accordion (`.elementor-widget-toggle .elementor-tab-content`) se escribió
con el selector `body`, aplicándose a TODO el sitio. El `font-weight: 300` en
`.entry-content p` no podía ganarle porque `body` heredaba a todos los hijos.

**Problema real 2**: Una regla `:hover:hover { color: #C07A5A !important; }` (selector universal
de hover) hacía que TODO el texto se pusiera terracota al pasar el mouse. Era un residuo de
una regla de toggle que se copió mal.

**Cómo detectar**:
- Si un cambio CSS "no funciona", buscar reglas con selectores demasiado amplios (`body`, `*`,
  `:hover:hover`, `div`, `p`) que estén aplicando `!important` al mismo property
- Usar `preg_match_all` para encontrar TODAS las reglas con el property en cuestión
- Verificar que no haya selectores huérfanos (reglas fuera de `@media` que deberían estar dentro)

**Prevención**:
- NUNCA usar `body { }` para estilos que solo aplican a un componente
- SIEMPRE scopear: `body .elementor-widget-toggle .elementor-tab-content { }`
- Al agregar `@media` queries en CSS minificado, verificar que los `{ }` están correctamente anidados

### Lección: mu-plugin padding:0 genérico pisa padding específico del header

**Problema real**: El mu-plugin de fullwidth tenía `.ast-container { padding: 0 !important; }` que
aplicaba a TODOS los `.ast-container`, incluyendo el del header. Luego intentaba restaurar
el padding del header con `header .ast-container { padding: 40px !important; }`, pero como
ambos tenían `!important` y la misma especificidad, el que aparecía último ganaba.

**Solución**: Excluir el header del reset general usando selectores específicos:
```css
/* CORRECTO: solo resetear padding del contenido, no del header */
.site-content .ast-container { padding-left: 0 !important; }

/* Header con su propio padding */
#masthead .ast-container,
.main-header-bar > .ast-container { padding-left: 40px !important; }
```

**Regla general**: Al hacer layout fullwidth, NUNCA usar `.ast-container` sin contexto.
Siempre usar `.site-content .ast-container` para el contenido y selectores de header
separados. El padding global para Elementor se aplica en `.elementor-section > .elementor-container`.

### Lección: Google Fonts no carga weights que no se solicitan

**Problema real**: Se cambió `font-weight: 400` a `font-weight: 300` en el CSS, pero la fuente
seguía viéndose igual porque Google Fonts solo cargaba los weights que estaban en el URL del link.
Si el link decía `Outfit:wght@400;500;600`, el weight 300 no existía y el browser usaba el 400.

**Solución**: Agregar explícitamente el weight al Google Fonts URL:
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&display=swap">
```

**También verificar**: Astra theme settings tiene `body-font-weight` y `body-font-variant` en
`get_option('astra-settings')` que pueden overridear el CSS. Actualizar ambos:
```php
$astra = get_option('astra-settings');
$astra['body-font-weight'] = '300';
$astra['body-font-variant'] = '300';
update_option('astra-settings', $astra);
```

### Lección: Diagnosticar ANTES de escribir CSS

Antes de escribir CSS overrides para cualquier plugin:
1. **Inspeccionar HTML** — Obtener la estructura real del HTML del plugin:
   ```php
   $html = file_get_contents('https://dominio.com/');
   // Extraer la sección del plugin del HTML
   ```
2. **Leer CSS generado** — Ver qué reglas aplica el plugin:
   ```php
   $css_dir = $upload_dir['basedir'] . '/complianz/css/';
   foreach (glob($css_dir . '*') as $f) echo file_get_contents($f);
   ```
3. **Identificar las clases JS** — Qué clases añade/quita el JS del plugin
   (cmplz-hidden, cmplz-show, cmplz-dismissed, cmplz-categories-visible, cmplz-fade-in)
4. **Verificar mecanismo show/hide** — ¿Usa clases CSS o inline styles?
   Si usa inline styles, NO se puede usar `!important` en display

## Subdominios en GoHighLevel (no WordPress)

Algunos clientes tienen landing pages en subdominios que NO son WordPress sino **GoHighLevel** (GHL).

### Cómo identificar GoHighLevel
- URL tipo `programa.dominio.com` o `app.dominio.com`
- HTML contiene clases como `section-XXXX`, `heading-XXXX`, `hl_page-creator__body`
- Scripts de `*.gohighlevel.com` o `*.leadconnectorhq.com`
- Videos embebidos via Wistia (`wistia_responsive_padding`)

### No se puede modificar con scripts PHP / cPanel
GHL es una plataforma SaaS separada. Los scripts PHP del flujo `/wp-modify` NO funcionan.
Para modificar una landing GHL se necesita:
1. **Acceso al dashboard GHL** (email/password) para editar visualmente
2. **O inyectar CSS/JS** via Settings → Custom Code → Header Code

### Método: CSS override via Custom Code
Generar un archivo `ghl-landing-style.html` con:
- Google Fonts `<link>` para las fuentes del branding
- `<style>` con variables CSS y overrides globales
- Selectores genéricos (`h1, h2, h3`, `p`, `button`, `section`) ya que GHL usa clases únicas por página
- El usuario copia y pega el código en GHL → Settings → Custom Code

### Archivo de referencia
`clientes/{nombre}/13-web/scripts/ghl-landing-style.html` — template CSS completo
con branding del cliente, listo para pegar en GoHighLevel.

### Lección: verificar plataforma antes de actuar
Siempre verificar si un subdominio es WordPress o GHL antes de generar scripts PHP.
Señales: fetch la URL y buscar `wp-content`, `wp-includes` (WordPress) vs
`gohighlevel`, `leadconnectorhq`, `hl_page-creator` (GHL).

## Imágenes — Media Library y Featured Images

### Subir imagen desde URL y asignar como featured image

El método más limpio para cambiar imágenes de posts/páginas: descargar desde URL,
registrar en la media library, y asignar como thumbnail — todo server-side:

```php
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

$post_id = 2054;
$image_url = 'https://images.unsplash.com/photo-XXXXX?w=1200&h=630&fit=crop';
$filename = 'blog-nombre-descriptivo.jpg';

// Descargar a temp
$tmp = download_url($image_url);
if (is_wp_error($tmp)) die('Download error: ' . $tmp->get_error_message());

// Registrar en media library
$file_array = ['name' => $filename, 'tmp_name' => $tmp];
$attach_id = media_handle_sideload($file_array, $post_id, 'Descripción de la imagen');
if (is_wp_error($attach_id)) { @unlink($tmp); die('Upload error'); }

// Alt text + featured image
update_post_meta($attach_id, '_wp_attachment_image_alt', 'Alt text descriptivo');
set_post_thumbnail($post_id, $attach_id);
```

### Unsplash como fuente de imágenes stock

URLs directas de Unsplash funcionan con `download_url()` y permiten especificar dimensiones:
```
https://images.unsplash.com/photo-{ID}?w=1200&h=630&fit=crop&crop=center
```

**IMPORTANTE**: Verificar visualmente la imagen antes de subirla al servidor. El ID de Unsplash
no siempre corresponde a lo esperado — descargar localmente primero, revisar con `Read` tool,
y solo entonces ejecutar el script de subida.

### Dimensiones consistentes para blog grid

Todas las featured images del blog deben tener **las mismas dimensiones** (ej: 1200x630).
Si una imagen es más pequeña (ej: 900x500), WordPress no genera el tamaño `large` (1024xN)
y el loop grid de Elementor puede no mostrarla correctamente.

**Síntoma**: La imagen existe, el `<img>` HTML se genera bien, pero en el frontend aparece
un espacio en blanco en la card del blog.

**Solución**: Reemplazar la imagen por una de 1200x630 (o mayor) para que WordPress genere
todos los tamaños intermedios incluyendo `large`.

### También reemplazar imagen dentro del post_content

Al cambiar la featured image, verificar si el `post_content` referencia la imagen vieja:
```php
$post = get_post($post_id);
$old_url = 'https://dominio.com/wp-content/uploads/vieja.jpg';
if (strpos($post->post_content, $old_url) !== false) {
    $content = str_replace($old_url, wp_get_attachment_url($new_attach_id), $post->post_content);
    $wpdb->update($wpdb->posts, ['post_content' => $content], ['ID' => $post_id]);
}
```

## Reemplazo masivo de URLs (wa.link → wa.me)

### Datos de WhatsApp en WordPress

Los enlaces de WhatsApp pueden estar en **4 lugares**:

| Ubicación | Cómo buscar | Cómo modificar |
|-----------|-------------|---------------|
| `_elementor_data` (JSON) | `LIKE '%wa.link%'` en `wp_postmeta` | `preg_replace` + validar JSON |
| `post_content` (HTML) | `LIKE '%wa.link%'` en `wp_posts` | `preg_replace` directo |
| Plugin JoinChat | `get_option('joinchat')` | `update_option` |
| HTML widgets de Elementor | Dentro del JSON `_elementor_data`, campo `settings.html` | Decodificar JSON → buscar widget HTML → reemplazar |

### Reemplazo en Elementor JSON — Doble formato

En `_elementor_data`, las URLs pueden estar en **2 formatos**:
- Raw: `https://wa.link/j3qlrx`
- JSON-escaped: `https:\/\/wa.link\/j3qlrx`

Hay que reemplazar ambos:
```php
$data = preg_replace('/https:\/\/wa\.link\/[a-zA-Z0-9]+/', $new_url, $data);
$data = preg_replace('/https:\\\\\/\\\\\/wa\.link\\\\\/[a-zA-Z0-9]+/', str_replace('/', '\\/', $new_url), $data);
```

### Mensajes contextuales por sección

Cada botón de WhatsApp debería pre-rellenar un mensaje relevante a la sección:
```php
function wa_url($phone, $msg) {
    return 'https://wa.me/' . $phone . '?text=' . rawurlencode($msg);
}
```

### Verificación post-reemplazo

Siempre verificar que no quedan URLs viejas en **páginas publicadas**:
```php
// En elementor_data
$still = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->postmeta} pm
    JOIN {$wpdb->posts} p ON pm.post_id = p.ID
    WHERE pm.meta_key='_elementor_data' AND pm.meta_value LIKE '%wa.link%'
    AND p.post_status='publish'");

// En post_content
$still2 = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts}
    WHERE post_content LIKE '%wa.link%' AND post_status='publish'");
```

**Nota**: Los conteos sin filtrar por `post_status` incluyen revisiones y borradores — eso
es normal y no afecta al frontend. Solo importa que `publish` esté limpio.

### Lección: `_elementor_data` vs `post_content`

Algunos posts/páginas tienen la misma URL en AMBOS campos. El primer script puede limpiar
`_elementor_data` exitosamente pero dejar `post_content` con URLs viejas.
**Siempre verificar y limpiar ambos campos** por separado.

## Checklist antes de ejecutar

- [ ] ¿El script tiene `require_once dirname(__FILE__) . '/wp-load.php'`?
- [ ] ¿Tiene protección con `$SECRET_KEY`?
- [ ] ¿Tiene `error_reporting(E_ALL)` y `ini_set('display_errors', 1)`?
- [ ] ¿No redefine funciones de WordPress?
- [ ] ¿Usa `array()` en vez de `[]` para máxima compatibilidad PHP?
- [ ] ¿Limpia caché al final?
- [ ] ¿Se sube con `MSYS_NO_PATHCONV=1`?
- [ ] ¿Se usa un nombre de archivo que ya existía en el servidor? (evita 404 de WP)

## Template de script PHP

Ver `${CLAUDE_SKILL_DIR}/templates/wp-script-template.php` para el template base.
