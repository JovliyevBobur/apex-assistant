import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: string;
  language?: string;
}

const CodeBlock = ({ children, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-border bg-background/80">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border text-xs text-muted-foreground">
        <span>{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent">Nusxalandi</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Nusxalash</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-foreground">{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
