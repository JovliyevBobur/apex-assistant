import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Globe, GraduationCap, ImagePlus } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const actionButtons = [
  { icon: Paperclip, label: "Biriktirish", action: "attach" },
  { icon: Globe, label: "Qidirish", action: "search" },
  { icon: GraduationCap, label: "O'rganish", action: "learn" },
  { icon: ImagePlus, label: "Rasm yaratish", action: "image" },
];

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "search":
        onSendMessage("Internetdan qidiring: ");
        break;
      case "learn":
        onSendMessage("Menga quyidagi mavzuni o'rgating: ");
        break;
      case "image":
        onSendMessage("Rasm yarating: ");
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-2">
      <div className="glass rounded-2xl p-2 flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Savolingizni yozing..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground focus:outline-none px-4 py-3 text-sm max-h-32 min-h-[48px]"
          style={{ height: "auto" }}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          variant="glow"
          size="icon"
          className="flex-shrink-0 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
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
