/** @deepseek-ai/dsh-tools 与驱动包的轻量类型声明（驱动均有自身 d.ts，此处只为缺类型的依赖提供形状）。 */
declare module '@deepseek-ai/dsh-tools' {
  export function defineTool(options: Record<string, unknown>): unknown
}
