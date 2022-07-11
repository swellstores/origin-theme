# Origin - headless storefront theme for [Swell](https://www.swell.is/)

Origin is a universal progressive web app for online stores, using modern JavaScript and front-end tooling. It's intended as a reference example and starter project for building custom storefronts powered by Swell.

> Note: this project is in beta and will have major changes made to support Vue/Nuxt 3.

#### Features

- Built with Nuxt.js (the Vue equivalent of Next.js)
- Uses Tailwind CSS, so it's easy to change the design
- Connects to a hosted git repo for syncing code and settings with your live store
- Supports custom content types and fields that can be edited in Swell's dashboard (with live preview 👀)
- Includes page templates, sections, and components for common use cases

## Documentation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Getting started](#getting-started)
  - [Connecting to Swell](#connecting-to-swell)
  - [Installation](#installation)
  - [Core concepts & tools](#core-concepts--tools)
  - [Resources](#resources)
  - [What's in the box](#whats-in-the-box)
- [Configuration](#configuration)
  - [Editor](#editor)
  - [Settings](#settings)
  - [Navigation menus](#navigation-menus)
  - [Syncing data with your live store](#syncing-data-with-your-live-store)
  - [Styles](#styles)
    - [Defining style properties](#defining-style-properties)
    - [Referencing style properties](#referencing-style-properties)
    - [Style presets](#style-presets)
- [Content](#content)
  - [Types](#types)
    - [`name`](#name)
    - [`description`](#description)
    - [`model`](#model)
    - [`fields`](#fields)
  - [Fields](#fields)
    - [`id`](#id)
    - [`label`](#label)
    - [`type` + `ui`](#type--ui)
  - [Field types](#field-types)
    - [`heading`](#heading)
    - [`short_text`](#short_text)
    - [`long_text`](#long_text)
    - [`number`](#number)
    - [`boolean`](#boolean)
    - [`select`](#select)
    - [`lookup`](#lookup)
    - [`asset`](#asset)
    - [`collection`](#collection)
    - [`date`](#date)
    - [`color`](#color)
    - [`tags`](#tags)
    - [`field_group`](#field_group)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started

Clone this project repository to your local machine and navigate to the project root.

### Connecting to Swell

Add your Swell store ID, public key and url to `.env`.

```
SWELL_STORE_ID=your_store
SWELL_PUBLIC_KEY=GET_YOUR_PK_FROM_THE_ADMIN_DASHBOARD
SWELL_STORE_URL=https://your_store.swell.store
```

### Installation

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

### Core concepts & tools

- **[Nuxt](https://nuxtjs.org/)** is the most popular framework for building isomorphic [Vue](https://vuejs.org/) applications. It offers both server-side rendering (SSR) and static generation modes, allowing it to be deployed on JAMstack hosting providers like [Netlify](https://www.netlify.com/) and [Vercel](https://vercel.com/) if you'd prefer that to Swell's built-in hosting.

- **[Tailwind](https://tailwindcss.com/)** is a utility-first CSS framework for building custom designs. We're using Tailwind because it's _extremely_ efficient once you're familiar with the basic class names, works well for theming, and—thanks to PurgeCSS—results in about 10kb of CSS for the whole site. If you want to change how any component looks, you just edit the utility classes in the template instead of having to dig through unfamiliar CSS files to find where an element's styles are inheriting from, and hoping that you don't break something every time you change some properties.

- **[Swell.js](https://www.npmjs.com/package/swell-js)** wraps Swell's frontend API, providing helper methods for fetching content, managing carts, and handling checkout client-side.

### Resources

If you aren't already familiar with Vue, Nuxt, Tailwind, or Swell, these resources will get you up to speed:

- [Vue guide](https://vuejs.org/v2/guide/index.html)
- [Nuxt guide](https://nuxtjs.org/guide)
- [Tailwind core concepts](https://tailwindcss.com/docs/utility-first)
- [Swell.js readme](https://github.com/swellstores/swell-js#readme)

For more advanced usage and packages you can use in your project:

- [Awesome Vue](https://github.com/vuejs/awesome-vue)
- [Awesome Nuxt](https://github.com/nuxt-community/awesome-nuxt)

### What's in the box

- PWA functionality is provided by the [@nuxtjs/pwa](https://pwa.nuxtjs.org/) module.
- Any components in the `/components` folder are [loaded automatically](https://nuxtjs.org/api/configuration-components), so you don't needed to explicitly import them.
- Common cart methods are implemented as Vuex actions in `/store/index.js`
- Swell.js is initialized and injected into the Nuxt context as `$swell`

For a detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org/guide/directory-structure).

## Configuration

### Default settings

`/config/defaults.json` defines the default settings loaded into your store when installing this theme. Useful when adding new language tokens or settings fields available to the Editor.

### Editor

`/config/editor.json` defines the settings fields available in the 'Design & global settings' and 'Language' sections of the theme editor in the Swell dashboard.

### Navigation menus

The `menus` array in `/config/editor.json` defines locations/slots in the theme that can display a navigation menu, and the shape of each menu tier. This config is used in the dashboard (under storefront > navigation) to show admins a menu editing UI.

### Styles

#### Defining style properties

By default, the contents of the `colors` and `fonts` in your store settings are treated as style properties, with their child keys and values converted to CSS variables at build time in `assets/css/variables.css`. If you have additional fields that you want to generate variables for, add the keys to the module options.

**Example**

If `colors.primary.darkest` in your store settings has a value of `#222222`, because `colors` is configured as a style property, that will generate the CSS variable `--colors-primary-darkest: #222222;`. If you have a field configured in `editor.json` with `id: 'trogdor.the.burninator'`, the following config would convert any properties on the `trogdor` object to variables.

```js
// nuxt.config.js

export default {
  ...
  buildModules: [
    [
      '~/modules/swell-editor',
      {
        cssVariableGroups: ['trogdor']
      }
    ],
   ]
  ...
}
```

#### Referencing style properties

The resulting object is turned into a list of root CSS variables by the `swell-editor` module. You can reference these variables in `tailwind.config.js` or anywhere else you need to change how components are displayed.

In dev mode, these will be injected as an inline stylesheet for rapid prototyping. For production, a stylesheet will be written to `/assets/css/variables.css` during the build process and loaded as a global CSS file.

---

## Content

### Types

The `/config/content` folder stores content type definitions. Each JSON file represents a content type, which can also be referenced in other content types.

If a content type doesn't need to be referenced in multiple types (e.g. a repeatable item in a media slider), you can define the type object in the `item_types` value of a collection field.

#### `name`

Human-friendly label displayed in the dashboard.

#### `description`

Explanation of what the content type is intended for.

#### `model`

If a content type is only used inside another type and doesn't need to be fetched by itself, you can leave this attribute out.

There's two situations you'll need to specify a `model`:

1. **Making a content type queryable**  
   If the content type is standalone and needs to have its own endpoint for fetching data (like pages or blog posts), the `model` value should be `content/{pluralized_type_id}` (e.g. `content/pages`).

   > **Note:** Custom model IDs should use `snake_case` for consistency with system models.

2. **Adding fields to system models**  
   Content types can be used to add fields to system models like `categories` and `products`. Including the `model` attribute with the system model ID as the value will add a `content` object to each instance, with each field of the content type nested inside. This way, custom content fields won't ever conflict with standard fields.

#### `fields`

An array of field definition objects (see below for details).

### Fields

As you'd expect from a CMS, there are many different field types you can use to model and edit your content. Each field on a content type is an object containing the following attributes:

#### `id`

A unique field ID for referencing the field in code. IDs may be specified as an object path, enabling values to be nested together for convenience and clarity.

> **Note:** Custom fields should use `snake_case` for consistency with system fields. Since convention in the Vue ecosystem is to use `camelCase` for variable names, Swell.js will normalize object keys when sending and receiving data.

#### `label`

Human-friendly label displayed in the dashboard.

#### `type` + `ui`

- `type` is the type of field to use for storing the value.
- `ui` (optional) is the interface displayed in the dashboard, allowing for a more appropriate editing experience and specific formatting. If omitted, the default UI for the field type will be used.

### Field types

#### `heading`

For breaking up a set of fields in the dashboard. Not included in API responses.

```js
{
  "label": ...,
  "type": "heading" // (Required)
}
```

#### `short_text`

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

#### `long_text`

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

#### `number`

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

#### `boolean`

For binary values that are true or false.

```js
{
  "id": ...,
  "label": ...,
  "type": "boolean", // (Required)
  "ui": "checkbox|toggle"
}
```

#### `select`

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

#### `lookup`

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

#### `asset`

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

#### `collection`

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

#### `date`

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

#### `color`

For inputting a color using a color picker UI, saved as a hex code.

```js
{
  "id": ...,
  "label": ...,
  "type": "color" // (Required)
}
```

#### `tags`

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

#### `field_group`

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
