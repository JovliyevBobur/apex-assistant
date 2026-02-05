import { useState, useRef, useEffect } from "react";
import { Code, Brain, Lightbulb, Languages, TrendingUp, Palette, GraduationCap, Calculator, Menu, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import CapabilityCard from "@/components/CapabilityCard";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import BackgroundEffects from "@/components/BackgroundEffects";
import LanguageSelector, { type Language } from "@/components/LanguageSelector";
import ConversationSidebar from "@/components/ConversationSidebar";
import { streamChat } from "@/lib/streamChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

const capabilities = [{
  icon: Code,
  title: "Dasturlash",
  description: "Kod yozish, xatolarni tuzatish va dasturiy yechimlar taklif qilish."
}, {
  icon: Brain,
  title: "Chuqur Tahlil",
  description: "Murakkab muammolarni bosqichma-bosqich tahlil qilish va yechish."
}, {
  icon: Lightbulb,
  title: "Ijodiy G'oyalar",
  description: "Innovatsion fikrlar va kreativ yechimlar yaratish."
}, {
  icon: Languages,
  title: "Til O'rgatish",
  description: "Tillarni o'rganishda yordam va tarjima xizmatlari."
}, {
  icon: TrendingUp,
  title: "Biznes Strategiya",
  description: "Marketing, rejalashtirish va biznes maslahatlar."
}, {
  icon: Palette,
  title: "Dizayn",
  description: "UI/UX, grafik dizayn va vizual kontentda yordam."
}, {
  icon: GraduationCap,
  title: "Ta'lim",
  description: "O'rganish va bilim olishda yo'l ko'rsatish."
}, {
  icon: Calculator,
  title: "Matematika",
  description: "Hisob-kitoblar va matematik muammolarni yechish."
}];

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [language, setLanguage] = useState<Language>("uz");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewConversation = async (): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        language,
        title: "Yangi suhbat"
      })
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
      role: msg.role as "user" | "assistant"
    }));

    setMessages(loadedMessages);
    setCurrentConversationId(conversationId);
    setShowChat(true);
  };

  const saveMessage = async (conversationId: string, content: string, role: "user" | "assistant") => {
    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        content,
        role
      });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    
    await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId);
  };

  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversationId;

    // Create new conversation if needed (only for logged in users)
    if (!conversationId && user) {
      conversationId = await createNewConversation();
      if (!conversationId) return;
      setCurrentConversationId(conversationId);
      
      // Update title with first message
      await updateConversationTitle(conversationId, content);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user"
    };

    setMessages(prev => [...prev, userMessage]);
    setShowChat(true);
    setIsLoading(true);

    // Save user message to database
    if (conversationId) {
      await saveMessage(conversationId, content, "user");
    }

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? {
            ...m,
            content: assistantContent
          } : m);
        }
        return [...prev, {
          id: (Date.now() + 1).toString(),
          content: assistantContent,
          role: "assistant"
        }];
      });
    };

    const allMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content
    }));

    await streamChat({
      messages: allMessages,
      language,
      onDelta: updateAssistant,
      onDone: async () => {
        setIsLoading(false);
        // Save assistant message to database
        if (conversationId && assistantContent) {
          await saveMessage(conversationId, assistantContent, "assistant");
        }
      },
      onError: error => {
        toast.error(error);
        setIsLoading(false);
      }
    });
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

  return <div className="min-h-screen bg-background relative">
      <BackgroundEffects />
      
      {/* Top Bar */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        {/* Left side - Menu button for logged in users */}
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
        
        {/* Right side - Language selector and auth */}
        <div className="flex items-center gap-2">
          <LanguageSelector value={language} onChange={setLanguage} />
          
          {authLoading ? (
            <div className="w-10 h-10 rounded-lg glass animate-pulse" />
          ) : user ? (
            <button
              onClick={handleSignOut}
              className="p-2 glass rounded-lg hover:bg-muted/50 transition-colors"
              title="Chiqish"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="sm"
              className="glass"
            >
              <User className="w-4 h-4 mr-2" />
              Kirish
            </Button>
          )}
        </div>
      </div>

      {/* Conversation Sidebar - Only for logged in users */}
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
        {!showChat ? <div className="pt-12">
            <HeroSection />

            {/* Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {capabilities.map((cap, index) => <CapabilityCard key={cap.title} icon={cap.icon} title={cap.title} description={cap.description} delay={index * 100} />)}
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
          </div> : <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] pt-12">
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
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map(message => <ChatMessage key={message.id} content={message.content} role={message.role} />)}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && <ChatMessage content="" role="assistant" isTyping />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>}
      </div>
    </div>;
};
export default Index;