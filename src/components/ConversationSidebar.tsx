 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { MessageSquare, Plus, Trash2, X } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { toast } from "sonner";
 
 interface Conversation {
   id: string;
   title: string;
   created_at: string;
   updated_at: string;
 }
 
 interface ConversationSidebarProps {
   isOpen: boolean;
   onClose: () => void;
   currentConversationId: string | null;
   onSelectConversation: (id: string) => void;
   onNewConversation: () => void;
   userId: string;
 }
 
 const ConversationSidebar = ({
   isOpen,
   onClose,
   currentConversationId,
   onSelectConversation,
   onNewConversation,
   userId,
 }: ConversationSidebarProps) => {
   const [conversations, setConversations] = useState<Conversation[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     if (userId) {
       fetchConversations();
     }
   }, [userId]);
 
   const fetchConversations = async () => {
     setIsLoading(true);
     const { data, error } = await supabase
       .from("conversations")
       .select("*")
       .eq("user_id", userId)
       .order("updated_at", { ascending: false });
 
     if (error) {
       console.error("Error fetching conversations:", error);
       toast.error("Suhbatlarni yuklashda xatolik");
     } else {
       setConversations(data || []);
     }
     setIsLoading(false);
   };
 
   const deleteConversation = async (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     
     const { error } = await supabase
       .from("conversations")
       .delete()
       .eq("id", id);
 
     if (error) {
       toast.error("Suhbatni o'chirishda xatolik");
       return;
     }
 
     setConversations(prev => prev.filter(c => c.id !== id));
     
     if (currentConversationId === id) {
       onNewConversation();
     }
     
     toast.success("Suhbat o'chirildi");
   };
 
   const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     const now = new Date();
     const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
     
     if (diffDays === 0) return "Bugun";
     if (diffDays === 1) return "Kecha";
     if (diffDays < 7) return `${diffDays} kun oldin`;
     return date.toLocaleDateString("uz-UZ");
   };
 
   return (
     <>
       {/* Overlay */}
       {isOpen && (
         <div
           className="fixed inset-0 bg-black/50 z-40 md:hidden"
           onClick={onClose}
         />
       )}
       
       {/* Sidebar */}
       <div
         className={cn(
           "fixed left-0 top-0 h-full w-72 bg-background/95 backdrop-blur-xl border-r border-border z-50 transform transition-transform duration-300 ease-in-out",
           isOpen ? "translate-x-0" : "-translate-x-full"
         )}
       >
         <div className="flex flex-col h-full p-4">
           {/* Header */}
           <div className="flex items-center justify-between mb-4">
             <h2 className="font-semibold text-lg">Suhbatlar</h2>
             <button
               onClick={onClose}
               className="p-2 hover:bg-muted rounded-lg transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
           </div>
 
           {/* New Conversation Button */}
           <Button
             onClick={() => {
               onNewConversation();
               onClose();
             }}
             className="w-full mb-4"
             variant="outline"
           >
             <Plus className="w-4 h-4 mr-2" />
             Yangi suhbat
           </Button>
 
           {/* Conversations List */}
           <ScrollArea className="flex-1">
             {isLoading ? (
               <div className="flex items-center justify-center py-8">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
               </div>
             ) : conversations.length === 0 ? (
               <div className="text-center text-muted-foreground py-8">
                 <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                 <p>Hali suhbatlar yo'q</p>
               </div>
             ) : (
               <div className="space-y-2">
                 {conversations.map((conversation) => (
                   <div
                     key={conversation.id}
                     onClick={() => {
                       onSelectConversation(conversation.id);
                       onClose();
                     }}
                     className={cn(
                       "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                       currentConversationId === conversation.id
                         ? "bg-primary/20 text-primary"
                         : "hover:bg-muted"
                     )}
                   >
                     <div className="flex-1 min-w-0">
                       <p className="truncate font-medium text-sm">
                         {conversation.title}
                       </p>
                       <p className="text-xs text-muted-foreground">
                         {formatDate(conversation.updated_at)}
                       </p>
                     </div>
                     <button
                       onClick={(e) => deleteConversation(conversation.id, e)}
                       className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 hover:text-destructive rounded transition-all"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </ScrollArea>
         </div>
       </div>
     </>
   );
 };
 
 export default ConversationSidebar;