declare module 'esbuild' {
  // Minimal shim to satisfy TypeScript in config files; actual types are not needed for build here
  export interface BuildOptions {
    [key: string]: unknown
  }

  export interface TransformOptions {
    [key: string]: unknown
  }

  export interface BuildResult {
    [key: string]: unknown
  }

  export interface TransformResult {
    code: string
    map?: string | null
    warnings?: unknown[]
    errors?: unknown[]
    [key: string]: unknown
  }

  export function build(options: BuildOptions): Promise<BuildResult>
  export function transform(input: string, options?: TransformOptions): Promise<TransformResult>
  export function transformSync(input: string, options?: TransformOptions): TransformResult
  export function context(options: BuildOptions): Promise<unknown>

  const _default: {
    build: typeof build
    transform: typeof transform
    transformSync: typeof transformSync
    context: typeof context
  }
  export default _default
}
