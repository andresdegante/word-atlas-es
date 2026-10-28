<div align="center">

<img src="docs/assets/cover-v2.jpg" alt="Word Atlas — Ilustraciones originales para aprender vocabulario IELTS" width="100%">

# Word Atlas (Versión en Español & English)

**Convierte cada palabra en una imagen y domina el vocabulario IELTS.**

7,298 palabras clave · Ilustraciones originales · Pronunciación UK / US · Repetición espaciada FSRS

[**English**](README.en.md) · [**中文**](README.zh.md) · [**Descargar datos**](data/)

[![Code: MIT](https://img.shields.io/badge/Code-MIT-17283B?style=flat-square)](LICENSE)
[![Dataset: CC BY 4.0](https://img.shields.io/badge/Dataset-CC_BY_4.0-AD5038?style=flat-square)](CONTENT_LICENSE.md)

</div>

---

**Word Atlas (Edición Multilingüe: Español / English / 中文)** es una adaptación de [Word Atlas](https://github.com/designfuchen/word-atlas) diseñada para hispanohablantes y estudiantes internacionales. Incluye soporte para cambiar entre Español, Inglés y Chino con un solo clic.

- **Español por defecto:** Menús, navegación, panel diario, 19 temas IELTS y explicaciones en español.
- **Definiciones y repasos en inglés:** Al usar el modo en español o inglés, las tarjetas y los cuestionarios interactivos muestran definiciones y ejemplos en inglés sin depender del chino.
- **Selector rápido en la barra superior:** Cambia en cualquier momento entre `ES`, `EN` y `中`.
- **Privacidad local-first:** No requiere registro, cuentas ni servidores externos; tu progreso FSRS se guarda de forma segura en tu navegador.

## Ejecución Local

Requiere **Node.js 20+** y npm:

```bash
git clone https://github.com/andresdegante/word-atlas-es.git
cd word-atlas-es
npm ci
npm run dev
```

Abre en tu navegador: **http://localhost:5188**

```bash
npm test             # Pruebas unitarias
npm run build        # Compilar para producción (dist/)
```

## Créditos y Licencias

- **Proyecto original y arte:** Creado por [@designfuchen](https://github.com/designfuchen).
- **Código de la aplicación:** [MIT](LICENSE)
- **Datos, ilustraciones y audio:** [CC BY 4.0](CONTENT_LICENSE.md), atribución a Word Atlas contributors.
