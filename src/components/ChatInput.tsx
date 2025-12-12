import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

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

  return (
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
  );
};

export default ChatInput;
