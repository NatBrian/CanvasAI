"use client";

import React, { useRef, useEffect } from "react";
import type p5 from "p5";
import { cn } from "@/lib/utils";
import { Code2, Frown, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";

interface P5CanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  onSketchError: (error: Error) => void;
}

export const P5Canvas = ({ code, onSketchError, className, ...props }: P5CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    // Cleanup previous instance
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }

    if (code && canvasRef.current) {
        // Clear the container before mounting new sketch
        canvasRef.current.innerHTML = '';
        import("p5").then(({ default: P5 }) => {
            try {
                const sketch = (p: p5) => {
                    // This function will contain the AI-generated code.
                    const userSketch = new Function("p", code);
                    
                    // Inject the user's p5 functions (draw, keyPressed, etc.) onto the p instance.
                    userSketch(p);

                    // We manage canvas creation and resizing to ensure it's always full-screen.
                    // We keep a reference to the user's original setup function.
                    const originalSetup = p.setup;
                    p.setup = () => {
                      if (canvasRef.current) {
                        const canvas = p.createCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
                        canvas.parent(canvasRef.current!);
                        // Intercept and ignore any subsequent createCanvas calls from the AI code
                        p.createCanvas = (...args: any[]) => {
                            console.warn(
                            'p5.createCanvas() call from generated code was ignored.'
                            );
                            return p.canvas;
                        };
                      }
                      // Run the user's original setup logic, if it exists.
                      if(originalSetup) {
                        originalSetup();
                      }
                    };

                    // Handle window resizing to keep the canvas full-screen.
                    p.windowResized = () => {
                      if (canvasRef.current) {
                        p.resizeCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
                      }
                    };
                };
                const p5Instance = new P5(sketch, canvasRef.current!);
                p5InstanceRef.current = p5Instance;
            } catch (error) {
                if (error instanceof Error) {
                    onSketchError(error);
                }
            }
        });
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [code, onSketchError]);

  return (
    <div className={cn("w-full h-full", className)} {...props}>
      <div ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export const P5ErrorDisplay = ({ error, onFix, isLoading }: { error: string, onFix: () => void, isLoading: boolean }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/90 backdrop-blur-sm z-20 text-destructive-foreground p-6 text-center rounded-lg">
        <Frown size={48} className="mb-4" />
        <h3 className="text-xl font-bold">Something went wrong!</h3>
        <p className="text-base mb-4">There was an error in the generated code.</p>
        <pre className="text-sm bg-destructive-foreground/10 p-3 rounded-md w-full max-w-md overflow-auto mb-6 font-mono text-left">
            <code>{error}</code>
        </pre>
        <Button onClick={onFix} disabled={isLoading} className="text-base py-3 px-6 h-auto bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90">
            {isLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Code2 className="mr-2 h-4 w-4" />
            )}
            Try to fix with AI
        </Button>
    </div>
);
