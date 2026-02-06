import { useState, useRef, useEffect, useCallback } from "react";
import { Code, Brain, Lightbulb, Languages, TrendingUp, Palette, GraduationCap, Calculator, Menu, LogOut, User, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import CapabilityCard from "@/components/CapabilityCard";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import BackgroundEffects from "@/components/BackgroundEffects";
import LanguageSelector, { type Language } from "@/components/LanguageSelector";
import ConversationSidebar from "@/components/ConversationSidebar";
import ProfileDialog from "@/components/ProfileDialog";
import { streamChat } from "@/lib/streamChat";
import { generateImage } from "@/lib/generateImage";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  images?: Array<{ type: string; image_url: { url: string } }>;
}

const capabilities = [
  { icon: Code, title: "Dasturlash", description: "Kod yozish, xatolarni tuzatish va dasturiy yechimlar taklif qilish.", prompt: "Dasturlash bo'yicha menga yordam bering. Qanday dasturlash tillarini bilasiz va qanday loyihalar yaratishim mumkin?" },
  { icon: Brain, title: "Chuqur Tahlil", description: "Murakkab muammolarni bosqichma-bosqich tahlil qilish va yechish.", prompt: "Murakkab muammoni tahlil qilishda menga yordam bering. Chuqur tahlil qanday amalga oshiriladi?" },
  { icon: Lightbulb, title: "Ijodiy G'oyalar", description: "Innovatsion fikrlar va kreativ yechimlar yaratish.", prompt: "Menga ijodiy va innovatsion g'oyalar taklif qiling. Yangi loyiha uchun kreativ fikrlar kerak." },
  { icon: Languages, title: "Til O'rgatish", description: "Tillarni o'rganishda yordam va tarjima xizmatlari.", prompt: "Tillarni o'rganishda menga yordam bering. Qanday usullar bilan tezroq til o'rganish mumkin?" },
  { icon: TrendingUp, title: "Biznes Strategiya", description: "Marketing, rejalashtirish va biznes maslahatlar.", prompt: "Biznes strategiyasi bo'yicha maslahat bering. Marketing va biznes rejalashtirish haqida gaplashamiz." },
  { icon: Palette, title: "Dizayn", description: "UI/UX, grafik dizayn va vizual kontentda yordam.", prompt: "Dizayn bo'yicha yordam kerak. UI/UX va grafik dizayn bo'yicha maslahatlar bering." },
  { icon: GraduationCap, title: "Ta'lim", description: "O'rganish va bilim olishda yo'l ko'rsatish.", prompt: "Ta'lim va o'rganish bo'yicha yordam bering. Qanday effektiv o'rganish usullari bor?" },
  { icon: Calculator, title: "Matematika", description: "Hisob-kitoblar va matematik muammolarni yechish.", prompt: "Matematika bo'yicha yordam kerak. Murakkab matematik masalalarni yechishda yordam bering." },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [language, setLanguage] = useState<Language>("uz");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);

  // Realtime sync
  useRealtimeMessages(currentConversationId, setMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    isUserScrolledUp.current = !isAtBottom;
  }, []);

  useEffect(() => {
    if (!isUserScrolledUp.current) {
      scrollToBottom();
    }
  }, [messages]);

  const createNewConversation = async (): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, language, title: "Yangi suhbat" })
      .select()
      .single();
    if (error) {
      console.error("Error creating conversation:", error);
      toast.error("Suhbat yaratishda xatolik");
      return null;
    }
    return data.id;
  };

  const loadConversation = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      toast.error("Xabarlarni yuklashda xatolik");
      return;
    }

    const loadedMessages: Message[] = data.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role as "user" | "assistant",
    }));
    setMessages(loadedMessages);
    setCurrentConversationId(conversationId);
    setShowChat(true);
  };

  const saveMessage = async (conversationId: string, content: string, role: "user" | "assistant") => {
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, content, role });
    if (error) console.error("Error saving message:", error);
  };

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    await supabase.from("conversations").update({ title }).eq("id", conversationId);
  };

  const isImageRequest = (text: string): boolean => {
    const imageKeywords = [
      "rasm", "surat", "chiz", "tasvirla", "rasmini",
      "draw", "image", "picture", "generate image", "create image",
      "нарисуй", "изображение", "картин", "сгенерируй",
      "ارسم", "صورة"
    ];
    const lower = text.toLowerCase();
    return imageKeywords.some(kw => lower.includes(kw));
  };

  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversationId;

    if (!conversationId && user) {
      conversationId = await createNewConversation();
      if (!conversationId) return;
      setCurrentConversationId(conversationId);
      await updateConversationTitle(conversationId, content);
    }

    const userMessage: Message = { id: Date.now().toString(), content, role: "user" };
    setMessages(prev => [...prev, userMessage]);
    setShowChat(true);
    setIsLoading(true);

    if (conversationId) {
      await saveMessage(conversationId, content, "user");
    }

    // Check if this is an image generation request
    if (isImageRequest(content)) {
      try {
        const result = await generateImage(content);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.text || "Mana sizning rasmingiz! 🎨",
          role: "assistant",
          images: result.images,
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);

        if (conversationId) {
          const savedContent = result.text || "🎨 Rasm yaratildi";
          await saveMessage(conversationId, savedContent, "assistant");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Rasm yaratishda xatolik");
        setIsLoading(false);
      }
      return;
    }

    // Regular chat
    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { id: (Date.now() + 1).toString(), content: assistantContent, role: "assistant" }];
      });
    };

    const allMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));

    await streamChat({
      messages: allMessages,
      language,
      onDelta: updateAssistant,
      onDone: async () => {
        setIsLoading(false);
        if (conversationId && assistantContent) {
          await saveMessage(conversationId, assistantContent, "assistant");
        }
      },
      onError: error => {
        toast.error(error);
        setIsLoading(false);
      },
    });
  };

  const handleCapabilityClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowChat(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setMessages([]);
    setCurrentConversationId(null);
    setShowChat(false);
    toast.success("Chiqib ketdingiz");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundEffects />

      {/* Top Bar */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div>
          {user && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 glass rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector value={language} onChange={setLanguage} />

          {authLoading ? (
            <div className="w-10 h-10 rounded-lg glass animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileOpen(true)}
                className="p-2 glass rounded-lg hover:bg-muted/50 transition-colors"
                title="Profil"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 glass rounded-lg hover:bg-muted/50 transition-colors"
                title="Chiqish"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="outline" size="sm" className="glass">
              <User className="w-4 h-4 mr-2" />
              Kirish
            </Button>
          )}
        </div>
      </div>

      {/* Profile Dialog */}
      {user && (
        <ProfileDialog
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          userId={user.id}
          userEmail={user.email}
        />
      )}

      {/* Conversation Sidebar */}
      {user && (
        <ConversationSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={handleNewConversation}
          userId={user.id}
        />
      )}

      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8 md:py-16">
        {!showChat ? (
          <div className="pt-12">
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
                  onClick={() => handleCapabilityClick(cap.prompt)}
                />
              ))}
            </div>

            {/* Chat Input */}
            <div className="max-w-3xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
              <p className="text-center text-muted-foreground text-sm mt-4">
                {user
                  ? "Savollaringizni yozing va sun'iy intellekt sizga yordam beradi"
                  : "Suhbat tarixini saqlash uchun hisobingizga kiring"}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] pt-12">
            {/* Chat Header */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleNewConversation} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                ← Orqaga
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-lg font-semibold gradient-text">JBN AI</h2>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide"
            >
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  images={message.images}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <ChatMessage content="" role="assistant" isTyping />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
