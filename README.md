# Origin - headless storefront theme for [Swell ecommerce](https://www.swell.is/)

Origin is a universal progressive web app for online stores, using modern JavaScript and front-end tooling. It's intended as a reference example and starter project for building custom storefronts powered by Swell.

### Features

- Built with Nuxt.js (the Vue equivalent of Next.js)
- Uses Tailwind CSS, so it's easy to change the design
- Connects to a hosted git repo for syncing code and settings with your live store
- Supports custom content types and fields that can be edited in Swell's dashboard (with live preview 👀)
- Includes page templates, sections, and components for common use cases

### Core concepts & tools

- **[Nuxt](https://nuxtjs.org/)** is the most popular framework for building isomorphic [Vue](https://vuejs.org/) applications. It offers both server-side rendering (SSR) and static generation modes, allowing it to be deployed on JAMstack hosting providers like [Netlify](https://www.netlify.com/) and [Vercel](https://vercel.com/) if you'd prefer that to Swell's built-in hosting.

- **[Tailwind](https://tailwindcss.com/)** is a utility-first CSS framework for building custom designs. We're using Tailwind because it's _extremely_ efficient once you're familiar with the basic class names, works well for theming, and—thanks to PurgeCSS—results in about 10kb of CSS for the whole site. If you want to change how any component looks, you just edit the utility classes in the template instead of having to dig through unfamiliar CSS files to find where an element's styles are inheriting from, and hoping that you don't break something every time you change some properties.

- **[Swell.js](https://www.npmjs.com/package/swell-js)** wraps Swell's frontend API, providing helper methods for fetching content, managing carts, and handling checkout client-side.

---

## Getting started

### Install

Clone this project repository to your local machine and navigate to the project root.

```bash
# Install dependencies
$ yarn install

# Serve with hot module reloading at localhost:3000
$ yarn run dev

# Build for production and start local server
$ yarn run build
$ yarn start

# Generate static build for hosting on Netlify/Render/Surge etc.
# For more details about static generation, check the Nuxt docs https://nuxtjs.org/api/configuration-generate/
$ yarn run generate
```

### Resources

If you aren't already familiar with Vue, Nuxt, Tailwind, or Swell, these resources will get you up to speed:

- [Official Vue guide](https://vuejs.org/v2/guide/index.html)
- [Official Nuxt guide](https://nuxtjs.org/guide)
- [Tailwind core concepts](https://tailwindcss.com/docs/utility-first)
- [Swell client SDK readme](https://github.com/swellstores/swell-js#readme)

### What's in the box

- PWA functionality is provided by the [@nuxtjs/pwa](https://pwa.nuxtjs.org/) module.
- Sentry integration for error reporting is provided by the [@nuxtjs/sentry](https://github.com/nuxt-community/sentry-module) module. All you need to do is add your DSN, either as a `SENTRY_DSN` env variable or on the `sentry` object in `nuxt.config.js`.
- Any components in the `/components` folder are [loaded automatically](https://nuxtjs.org/api/configuration-components), so you don't needed to explicitly import them.

TODO: check whether the Nuxt crawler is working for dynamic routes

For a detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

# Configuration

### Editor

`config/editor.json` defines the settings fields available in the 'Design & global settings' section of the theme editor in the Swell dashboard.

### Settings

`config/settings.json` contains the values of those settings fields, plus a read-only `store` object with things like your store name and currency.

### Menus

`config/menus.json` contains all navigation menus that have been set up in the dashboard.

### Syncing data with your live store

Whenever store settings, theme settings, or navigation menus are changed in the dashboard, `settings.json` and `menus.json` will be updated in the remote repo. You can edit this file locally for testing purposes, but keep in mind that pulling from the remote will overwrite your changes.

TODO: explain how local changes are ingested on the remote

---

## Navigation menus

The `menus` array in `config/editor.json` defines locations/slots in the app that can display a navigation menu, and the shape of each menu tier. This config is used in the dashboard (storefront/navigation) to show admins a menu editing UI.

## Theme styles

### Defining style properties

TODO

By default, `colors` and `fonts` are treated as style properties. If you have custom properties that you want to include, add the keys in `nuxt.config`.

```js
export default {
  ...
  swellEditor: {
    cssVariableGroups: ['my-custom-key']
  },
  ...
}
```

### Referencing style properties

The resulting object is turned into a list of root CSS variables by the `swell-editor` module. You can reference these variables in `tailwind.config.js` or anywhere else you need to change how components are displayed.

In dev mode, these will be injected as an inline stylesheet for rapid prototyping. For production, a stylesheet will be written to `assets/css/variables.css` during the build process and loaded as a global CSS file.

### Style presets

If you want admins to be able to choose from several predefined style sets for colors, typography, and other design parameters, you can define them in `config/styles.json`. All properties of the active style set will be merged into `config/settings.json`.

---

# Content

## Types

The `config/content` folder stores content type definitions. Each JSON file represents a content type, which can also be referenced in other content types.

If a content type doesn't need to be referenced in multiple types (e.g. a repeatable item in a media slider), you can define the type object in the `item_types` value of a collection field.

### `name`

Human-friendly label displayed in the dashboard.

### `description`

Explanation of what the content type is intended for.

### `model`

If a content type is only used inside another type and doesn't need to be fetched by itself, you can leave this attribute out.

There's two situations you'll need to specify a `model`:

1. **Making a content type queryable**  
   If the content type is standalone and needs to have its own endpoint for fetching data (like pages or blog posts), the `model` value should be `content/{pluralized_type_id}` (e.g. `content/pages`).

   > **Note:** Custom model IDs should use `snake_case` for consistency with system models.

2. **Adding fields to system models**  
   Content types can be used to add fields to system models like `categories` and `products`. Including the `model` attribute with the system model ID as the value will add a `content` object to each instance, with each field of the content type nested inside. This way, custom content fields won't ever conflict with standard fields.

### `fields`

An array of field definition objects (see below for details).

## Fields

As you'd expect from a CMS, there are many different field types you can use to model and edit your content. Each field on a content type is an object containing the following attributes:

### `id`

A unique field ID for referencing the field in code. IDs may be specified as an object path, enabling values to be nested together for convenience and clarity.

> **Note:** Custom fields should use `snake_case` for consistency with system fields. Since convention in the Vue ecosystem is to use `camelCase` for variable names, Swell.js will normalize object keys when sending and receiving data.

### `label`

Human-friendly label displayed in the dashboard.

### `type` + `ui`

- `type` is the type of field to use for storing the value.
- `ui` (optional) is the interface displayed in the dashboard, allowing for a more appropriate editing experience and specific formatting. If omitted, the default UI for the field type will be used.

## Field types

### Heading

For breaking up a set of fields in the dashboard. Not included in API responses.

```js
{
  "label": ...,
  "type": "heading" // (Required)
}
```

### Short text

For a small amount of plain text that fits on one line.

```js
{
  "id": ...,
  "label": ...,
  "type": "short_text", // (Required)
  "ui": "text|phone|email|url|slug",
  "min": Number, // Minimum character count
  "max": Number // Maximum character count
}
```

### Long text

For a larger amount of text that spans multiple lines and may include special formatting.

```js
{
  "id": ...,
  "label": ...,
  "type": "short_text", // (Required)
  "ui": "textarea|basic_html|rich_html|markdown",
  "min": Number, // Minimum character count
  "max": Number, // Maximum character count
  "html_tags": [String] // Allowed HTML tags (if null, the default tags for the UI will be allowed)
}
```

### Number

For any kind of numerical value.

```js
{
  "id": ...,
  "label": ...,
  "type": "number", // (Required)
  "ui": "number|slider|currency",
  "min": Number, // Minimum value
  "max": Number, // Maximum value
  "increment": Number, // Interval between values
  "decimal_places": Number, // Enforce a specific number of decimal places
  "unit": String // Unit of measurement
}
```

### Boolean

For binary values that are true or false.

```js
{
  "id": ...,
  "label": ...,
  "type": "boolean", // (Required)
  "ui": "checkbox|toggle"
}
```

### Select

For choosing from a list of predefined values.

```js
{
  "id": ...,
  "label": ...,
  "type": "boolean", // (Required)
  "ui": "radio|checkboxes|dropdown|button_group",
  "multi": Boolean, // Whether multiple items can be selected at once
  "options": [String|Number]
}
```

### Lookup

For referencing objects in the system.

TODO

```js
{
  "id": ...,
  "label": ...,
  "type": "lookup", // (Required)
  "model": "",
  "key": "",
  "params": "",
  "query": ""
}
```

### Asset

For uploading files like images and documents.

```js
{
  "id": ...,
  "label": ...,
  "type": "asset", // (Required)
  "asset_types": Array, // What file types are allowed (e.g. image, document, video, <mime_type>)
  "multi": Boolean // Whether multiple assets are allowed
}
```

### Collection

For lists of items that can be manually ordered. Ideal for flexible and repeatable content like landing pages or media sliders.

```js
{
  "id": ...,
  "label": ...,
  "type": "collection", // (Required)
  "item_types": [String], // What content types are allowed (you can also define a content type inline)
  "min": Number, // Minimum number of items
  "max": Number // Maximum number of items
}
```

### Date

For inputting dates and times, saved as an ISO 8601 date string.

```js
{
  "id": ...,
  "label": ...,
  "type": "date", // (Required)
  "ui": "date|time|datetime",
  "min": String, // Earliest date
  "max": String // Latest date
}
```

### Color

For inputting a color using a color picker UI, saved as a hex code.

```js
{
  "id": ...,
  "label": ...,
  "type": "color" // (Required)
}
```

### Tags

For adding one or more text tags, with autocomplete.

```js
{
  "id": ...,
  "label": ...,
  "type": "tags", // (Required)
  "min": Number, // Minimum number of tags
  "max": Number // Maximum number of tags
}
```

### Field group

For grouping fields together to reduce clutter in the dashboard and provide an optimal editing experience.

> **Note:** Fields inside groups are not nested on API responses by default, as groups are only there to improve the editing UX. However, as with any field, you can specify the child field IDs as object paths if you want to nest several fields under one key.

```js
{
  "id": ...,
  "label": ...,
  "type": "field_group", // (Required)
  "fields": [Object] // Fields to show inside the group
}
```

---

# More resources

- https://github.com/nuxt-community/awesome-nuxt
- https://github.com/vuejs/awesome-vue
