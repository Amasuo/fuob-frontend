/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />
/// <reference types="vite-plugin-vue-layouts/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vitejs/plugin-vue' {
  import type { Plugin } from 'vite'
  const vue: () => Plugin
  export default vue
}

declare module 'vite-plugin-vuetify' {
  import type { Plugin } from 'vite'
  interface Options {
    autoImport?: boolean
    styles?: boolean | 'none' | 'exposed' | { configFile: string }
  }
  function vuetify(options?: Options): Plugin
  export default vuetify
}

// Fixed: Explicitly name the internal variable to avoid duplication
declare module 'virtual:generated-layouts' {
  import type { RouteRecordRaw } from 'vue-router'
  export function setupLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[]
}

declare module '~pages' {
  import type { RouteRecordRaw } from 'vue-router'
  const generatedRoutes: RouteRecordRaw[]
  export default generatedRoutes
}
