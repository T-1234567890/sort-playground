/// <reference types="vite/client" />

declare module "*.py?raw" {
  const source: string;
  export default source;
}

declare module "*.rs?raw" {
  const source: string;
  export default source;
}

declare module "*.c?raw" {
  const source: string;
  export default source;
}

declare module "*.md?raw" {
  const source: string;
  export default source;
}
