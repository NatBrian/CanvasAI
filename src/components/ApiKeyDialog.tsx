"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";

type ApiKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (apiKey: string) => void;
};

export function ApiKeyDialog({ open, onOpenChange, onSave }: ApiKeyDialogProps) {
  const [key, setKey] = useState("");

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Your Gemini API Key</DialogTitle>
          <DialogDescription>
            You need to provide your own Gemini API key to use CanvasAI. Your key is stored only in your browser's local storage. You can get a key from {" "}
            <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="col-span-3"
              type="password"
              placeholder="Enter your API key"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!key.trim()}>
            <KeyRound className="mr-2 h-4 w-4" /> Save Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
