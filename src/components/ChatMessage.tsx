import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  isTyping?: boolean;
  images?: Array<{ type: string; image_url: { url: string } }>;
}

const ChatMessage = ({ content, role, isTyping, images }: ChatMessageProps) => {
  const isAssistant = role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-4 animate-slide-up",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed",
          isAssistant
            ? "glass text-foreground rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        {isTyping ? (
          <div className="flex gap-1 items-center py-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <>
            {images && images.length > 0 && (
              <div className="mb-3 space-y-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img.image_url.url}
                    alt="Generated image"
                    className="rounded-xl max-w-full border border-border"
                    loading="lazy"
                  />
                ))}
              </div>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-pre:bg-background/50 prose-pre:border prose-pre:border-border prose-code:text-primary prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </>
        )}
      </div>
      {!isAssistant && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <User className="w-5 h-5 text-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
