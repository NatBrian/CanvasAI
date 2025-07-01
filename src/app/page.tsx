"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { P5Canvas, P5ErrorDisplay } from "@/components/P5Canvas";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LoaderCircle, Wand2, Trash2, Copy, FileText } from "lucide-react";
import { generateInitialGameCode } from "@/ai/flows/generate-game-code";
import { modifyGameCode } from "@/ai/flows/modify-game-code";
import { fixGeneratedGameCodeErrors } from "@/ai/flows/fix-game-code-errors";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { track } from "@vercel/analytics/react";

const GREETING_PROMPT = "";

export default function Home() {
  const [gameCode, setGameCode] = useLocalStorage<string>("game-code", "");
  const [aiThoughts, setAiThoughts] = useLocalStorage<string>("ai-thoughts", "");
  const [prompt, setPrompt] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [sketchError, setSketchError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    const resizeOps = () => {
      document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
    };

    resizeOps();
    window.addEventListener("resize", resizeOps);

    return () => window.removeEventListener("resize", resizeOps);
  }, []);


  const { toast } = useToast();
  
  useEffect(() => {
    if(!gameCode) {
        setPrompt(GREETING_PROMPT)
    }
  }, [gameCode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    track(gameCode ? "Update Game" : "Generate Game", { promptLength: prompt.length });
    setIsLoading(true);
    setSketchError(null);

    try {
      if (gameCode) {
        const result = await modifyGameCode({
          prompt,
          currentCode: gameCode,
        });
        setGameCode(result.modifiedCode);
        setAiThoughts(result.thoughts);
      } else {
        const result = await generateInitialGameCode({ prompt });
        setGameCode(result.code);
        setAiThoughts(result.thoughts);
      }
       if (gameCode) {
        setPrompt("");
      }
    } catch (error) {
      track("AI Generation Failed", { error: (error as Error).message });
      console.error(error);
      toast({
        title: "AI Generation Failed",
        description:
          "An error occurred while generating the game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFixError = async () => {
    if (!sketchError || !gameCode) return;

    track("Fix Error", { errorMessage: sketchError.message });
    setIsLoading(true);
    
    try {
        const result = await fixGeneratedGameCodeErrors({ 
            code: gameCode,
            errorMessage: sketchError.message 
        });
        setGameCode(result.fixedCode);
        setAiThoughts(result.thoughts);
        setSketchError(null); 
    } catch (error) {
        track("AI Fix Failed", { error: (error as Error).message });
        console.error("Failed to fix code with AI:", error);
        toast({
            title: "Failed to Fix Code",
            description: "The AI could not fix the error. You might want to clear the canvas and start over.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if (!gameCode) return;
    track("Copy Code");
    navigator.clipboard.writeText(gameCode);
    toast({
      title: "Code Copied!",
      description: "The p5.js code has been copied to your clipboard.",
    });
  };

  const handleSketchError = useCallback((error: Error) => {
    console.error("Sketch Error:", error);
    setSketchError(error);
  }, []);
  
  const handleClearCode = () => {
    track("Clear Canvas");
    setGameCode("");
    setAiThoughts("");
    setSketchError(null);
    setPrompt(GREETING_PROMPT);
    toast({ title: "Canvas Cleared", description: "The canvas has been cleared." });
  }

  return (
    <div className="flex flex-col h-[calc(var(--vh,1vh)*100)] w-full bg-background font-body text-foreground overflow-hidden">
      <main className="flex-1 relative min-h-0 p-4 md:p-6">
        <div className="w-full h-full relative rounded-lg border border-border bg-card shadow-lg">
          <P5Canvas code={gameCode} onSketchError={handleSketchError} />

          {isClient && sketchError && (
            <P5ErrorDisplay error={sketchError.message} onFix={handleFixError} isLoading={isLoading} />
          )}

          {isClient && !gameCode && !sketchError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10 text-center p-4 pointer-events-none">
              <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
                <Wand2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-headline font-bold text-foreground">CanvasAI</h1>
              <p className="text-xl text-muted-foreground mt-2 max-w-md">
                Describe the game you want to create in the prompt below.
              </p>
            </div>
          )}
        </div>
      </main>

      <div className="shrink-0 p-4 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <Textarea 
              placeholder="A simple breakout-style game."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow text-base resize-none rounded-xl bg-input border-border min-h-[52px] focus-visible:ring-primary/50"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            {isClient && (
              <>
                <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="text-base h-[52px] px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  {isLoading ? (
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-5 w-5" />
                  )}
                  {gameCode ? "Update" : "Generate"}
                </Button>
                {gameCode && (
                  <>
                    <Button variant="ghost" size="icon" className="h-[52px] w-[52px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50" onClick={handleCopyCode} disabled={!gameCode} title="Copy Code">
                      <Copy className="h-5 w-5" />
                      <span className="sr-only">Copy Code</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-[52px] w-[52px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-destructive/80" onClick={handleClearCode} disabled={!gameCode} title="Clear Canvas">
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Clear Canvas</span>
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-[52px] w-[52px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50" disabled={!gameCode} title="View AI Process">
                          <FileText className="h-5 w-5" />
                          <span className="sr-only">View AI Process</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-none bg-card/95 backdrop-blur-lg border-l-border/50 p-0">
                        <ScrollArea className="h-full w-full rounded-md p-6">
                          <SheetHeader className="text-left mb-4">
                            <SheetTitle className="text-2xl font-headline">AI Process</SheetTitle>
                            <SheetDescription>
                              See the AI's thought process and the generated code.
                            </SheetDescription>
                          </SheetHeader>
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold mb-2 font-headline text-primary">Thinking Process</h3>
                              <div className="prose prose-sm prose-invert max-w-none text-muted-foreground bg-input/50 p-4 rounded-lg border border-border/30 overflow-x-auto">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {aiThoughts || "The AI has not provided its thoughts for this generation."}
                                  </ReactMarkdown>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-2 font-headline text-primary">Generated Code</h3>
                              <div className="prose prose-sm prose-invert max-w-none bg-input/50 p-4 rounded-lg border border-border/30 overflow-x-auto">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {"```javascript\n" + (gameCode || "No code generated yet.") + "\n```"}
                                  </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
