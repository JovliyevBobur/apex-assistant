import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "@/components/CodeBlock";

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
        "flex gap-3 animate-slide-up",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mt-1">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
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
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2.5 prose-headings:text-foreground prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-primary prose-strong:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-hr:border-border">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    const isInline = !match && !codeString.includes("\n");

                    if (isInline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded-md bg-muted text-primary text-xs font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }

                    return (
                      <CodeBlock language={match?.[1]}>
                        {codeString}
                      </CodeBlock>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </>
        )}
      </div>
      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
