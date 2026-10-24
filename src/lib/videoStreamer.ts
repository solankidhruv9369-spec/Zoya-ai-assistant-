export class VideoStreamer {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private intervalId: any = null;

  async startCamera(onFrame: (base64JPEG: string) => void) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      this.videoElement = document.createElement("video");
      this.videoElement.srcObject = this.stream;
      this.videoElement.play();

      this.canvasElement = document.createElement("canvas");
      // Set to downscaled resolution for Gemini Live
      this.canvasElement.width = 320;
      this.canvasElement.height = 240;

      // 1 FPS
      this.intervalId = setInterval(() => {
        if (!this.videoElement || !this.canvasElement) return;
        const ctx = this.canvasElement.getContext("2d");
        if (!ctx) return;

        // Draw current video frame to canvas
        ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Get base64 string
        const dataUrl = this.canvasElement.toDataURL("image/jpeg", 0.7);
        // dataUrl is like "data:image/jpeg;base64,....."
        const base64JPEG = dataUrl.split(",")[1];
        if (base64JPEG) {
          onFrame(base64JPEG);
        }
      }, 1000); // 1 frame per second
    } catch (err) {
      console.warn("Failed to start camera (expected if permission denied or running in sandbox):", err);
      throw err;
    }
  }

  close() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    this.canvasElement = null;
  }
}
