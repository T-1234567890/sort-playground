declare module "gif.js" {
  type GIFOptions = {
    workers?: number;
    quality?: number;
    workerScript?: string;
    width?: number;
    height?: number;
    background?: string;
  };

  type GIFFrameOptions = {
    delay?: number;
    copy?: boolean;
  };

  export default class GIF {
    constructor(options?: GIFOptions);
    addFrame(element: HTMLCanvasElement | CanvasRenderingContext2D, options?: GIFFrameOptions): void;
    on(event: "finished", callback: (blob: Blob) => void): void;
    on(event: "abort", callback: () => void): void;
    render(): void;
  }
}
