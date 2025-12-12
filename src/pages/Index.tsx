import { useState, useRef, useEffect } from "react";
import {
  Code,
  Brain,
  Lightbulb,
  Languages,
  TrendingUp,
  Palette,
  GraduationCap,
  Calculator,
} from "lucide-react";
import HeroSection from "@/components/HeroSection";
import CapabilityCard from "@/components/CapabilityCard";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import BackgroundEffects from "@/components/BackgroundEffects";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

const capabilities = [
  {
    icon: Code,
    title: "Dasturlash",
    description: "Kod yozish, xatolarni tuzatish va dasturiy yechimlar taklif qilish.",
  },
  {
    icon: Brain,
    title: "Chuqur Tahlil",
    description: "Murakkab muammolarni bosqichma-bosqich tahlil qilish va yechish.",
  },
  {
    icon: Lightbulb,
    title: "Ijodiy G'oyalar",
    description: "Innovatsion fikrlar va kreativ yechimlar yaratish.",
  },
  {
    icon: Languages,
    title: "Til O'rgatish",
    description: "Tillarni o'rganishda yordam va tarjima xizmatlari.",
  },
  {
    icon: TrendingUp,
    title: "Biznes Strategiya",
    description: "Marketing, rejalashtirish va biznes maslahatlar.",
  },
  {
    icon: Palette,
    title: "Dizayn",
    description: "UI/UX, grafik dizayn va vizual kontentda yordam.",
  },
  {
    icon: GraduationCap,
    title: "Ta'lim",
    description: "O'rganish va bilim olishda yo'l ko'rsatish.",
  },
  {
    icon: Calculator,
    title: "Matematika",
    description: "Hisob-kitoblar va matematik muammolarni yechish.",
  },
];

const sampleResponses = [
  "Ajoyib savol! Men sizga bu borada yordam berishdan mamnunman. Keling, bu masalani bosqichma-bosqich ko'rib chiqamiz...",
  "Bu juda qiziqarli mavzu. Men sizga bir nechta muhim nuqtalarni tushuntirib beraman...",
  "Albatta! Bu sizning maqsadlaringizga erishishda juda muhim qadam. Mana mening tavsiyalarim...",
  "Yaxshi savol! Bu masalada bir nechta yondashuv mavjud. Eng samarali usulni ko'rib chiqamiz...",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowChat(true);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const randomResponse =
        sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: "assistant",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundEffects />

      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8 md:py-16">
        {!showChat ? (
          <>
            <HeroSection />

            {/* Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {capabilities.map((cap, index) => (
                <CapabilityCard
                  key={cap.title}
                  icon={cap.icon}
                  title={cap.title}
                  description={cap.description}
                  delay={index * 100}
                />
              ))}
            </div>

            {/* Chat Input */}
            <div className="max-w-3xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} />
              <p className="text-center text-muted-foreground text-sm mt-4">
                Savollaringizni yozing va sun'iy intellekt sizga yordam beradi
              </p>
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            {/* Chat Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  setShowChat(false);
                  setMessages([]);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                ← Orqaga
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-lg font-semibold gradient-text">AI Assistant</h2>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  role={message.role}
                />
              ))}
              {isTyping && (
                <ChatMessage content="" role="assistant" isTyping />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
