import { useState, useRef, useCallback, KeyboardEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Globe, GraduationCap, ImagePlus, X, Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

interface AttachedFile {
  file: File;
  preview: string;
  type: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, files?: AttachedFile[]) => void;
  disabled?: boolean;
  language?: string;
}

const actionButtons = [
  { icon: Paperclip, label: "Biriktirish", action: "attach" },
  { icon: Globe, label: "Qidirish", action: "search" },
  { icon: GraduationCap, label: "O'rganish", action: "learn" },
  { icon: ImagePlus, label: "Rasm yaratish", action: "image" },
];

const langMap: Record<string, string> = {
  uz: "uz-UZ",
  en: "en-US",
  ru: "ru-RU",
  ar: "ar-SA",
};

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/*", ".pdf", ".txt", ".doc", ".docx", ".csv", ".json"];

const ChatInput = ({ onSendMessage, disabled, language = "uz" }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVoiceResult = useCallback((transcript: string) => {
    setMessage((prev) => (prev ? prev + " " + transcript : transcript));
  }, []);

  const { isListening, transcript, isSupported, toggleListening } =
    useSpeechRecognition({
      language: langMap[language] || "uz-UZ",
      onResult: handleVoiceResult,
    });

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    setAttachedFiles((prev) => {
      let updated = [...prev];
      for (const file of files) {
        if (updated.length >= MAX_FILES) break;
        if (file.size > MAX_SIZE) continue;
        const preview = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "";
        updated.push({ file, preview, type: file.type });
      }
      return updated;
    });
  }, []);

  const handleSend = () => {
    const text = isListening ? (message + " " + transcript).trim() : message.trim();
    if ((text || attachedFiles.length > 0) && !disabled) {
      onSendMessage(text, attachedFiles.length > 0 ? attachedFiles : undefined);
      setMessage("");
      setAttachedFiles([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "attach":
        fileInputRef.current?.click();
        break;
      case "search":
        onSendMessage("Internetdan qidiring: ");
        break;
      case "learn":
        onSendMessage("Menga quyidagi mavzuni o'rgating: ");
        break;
      case "image":
        onSendMessage("Rasm yarating: ");
        break;
    }
  };

  // Drag-and-drop handlers
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the container (not entering a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const displayText = isListening && transcript ? (message ? message + " " + transcript : transcript) : message;

  return (
    <div
      className="space-y-2 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 rounded-2xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Paperclip className="w-8 h-8 animate-bounce" />
            <span className="text-sm font-medium">Fayllarni shu yerga tashlang</span>
          </div>
        </div>
      )}

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap px-2">
          {attachedFiles.map((af, i) => (
            <div
              key={i}
              className="relative group rounded-xl border border-border overflow-hidden bg-muted/30"
            >
              {af.type.startsWith("image/") ? (
                <img src={af.preview} alt={af.file.name} className="w-16 h-16 object-cover" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground truncate max-w-[50px] absolute bottom-1">
                    {af.file.name.split(".").pop()}
                  </span>
                </div>
              )}
              <button
                onClick={() => removeFile(i)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary animate-pulse">
          <div className="flex gap-0.5">
            <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="w-1 h-5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
            <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "250ms" }} />
          </div>
          <span>Tinglayapman...</span>
        </div>
      )}

      <div className="glass rounded-2xl p-2 flex items-end gap-2">
        <textarea
          value={displayText}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Savolingizni yozing..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground focus:outline-none px-4 py-3 text-sm max-h-32 min-h-[48px]"
          style={{ height: "auto" }}
        />

        {/* Mic button */}
        {isSupported && (
          <Button
            onClick={toggleListening}
            disabled={disabled}
            variant="ghost"
            size="icon"
            className={cn(
              "flex-shrink-0 rounded-xl transition-all",
              isListening && "text-primary bg-primary/10 animate-pulse-glow"
            )}
            title={isListening ? "To'xtatish" : "Ovozli xabar"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}

        <Button
          onClick={handleSend}
          disabled={(!displayText.trim() && attachedFiles.length === 0) || disabled}
          variant="glow"
          size="icon"
          className="flex-shrink-0 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,.pdf,.txt,.doc,.docx,.csv,.json"
        className="hidden"
      />

      <div className="flex items-center gap-2 flex-wrap">
        {actionButtons.map((btn) => (
          <button
            key={btn.action}
            onClick={() => handleAction(btn.action)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <btn.icon className="w-3.5 h-3.5" />
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatInput;
