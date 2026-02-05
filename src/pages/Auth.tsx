 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { toast } from "sonner";
 import { Eye, EyeOff, Brain, ArrowLeft } from "lucide-react";
 import BackgroundEffects from "@/components/BackgroundEffects";
 import { z } from "zod";
 
 const emailSchema = z.string().email("Email manzil noto'g'ri");
 const passwordSchema = z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak");
 
 const Auth = () => {
   const [isLogin, setIsLogin] = useState(true);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [displayName, setDisplayName] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const navigate = useNavigate();
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (session?.user) {
         navigate("/");
       }
     });
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       if (session?.user) {
         navigate("/");
       }
     });
 
     return () => subscription.unsubscribe();
   }, [navigate]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     // Validate inputs
     const emailResult = emailSchema.safeParse(email);
     if (!emailResult.success) {
       toast.error(emailResult.error.errors[0].message);
       return;
     }
 
     const passwordResult = passwordSchema.safeParse(password);
     if (!passwordResult.success) {
       toast.error(passwordResult.error.errors[0].message);
       return;
     }
 
     setIsLoading(true);
 
     try {
       if (isLogin) {
         const { error } = await supabase.auth.signInWithPassword({
           email,
           password,
         });
 
         if (error) {
           if (error.message === "Invalid login credentials") {
             toast.error("Email yoki parol noto'g'ri");
           } else if (error.message === "Email not confirmed") {
             toast.error("Emailingizni tasdiqlang");
           } else {
             toast.error(error.message);
           }
           return;
         }
 
         toast.success("Muvaffaqiyatli kirdingiz!");
       } else {
         const redirectUrl = `${window.location.origin}/`;
         
         const { error } = await supabase.auth.signUp({
           email,
           password,
           options: {
             emailRedirectTo: redirectUrl,
             data: {
               display_name: displayName || email.split("@")[0],
             },
           },
         });
 
         if (error) {
           if (error.message.includes("already registered")) {
             toast.error("Bu email allaqachon ro'yxatdan o'tgan");
           } else {
             toast.error(error.message);
           }
           return;
         }
 
         toast.success("Ro'yxatdan o'tdingiz! Emailingizni tasdiqlang.");
       }
     } catch (error) {
       toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
     } finally {
       setIsLoading(false);
     }
   };
 
   return (
     <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
       <BackgroundEffects />
       
       <div className="relative z-10 w-full max-w-md">
         {/* Back button */}
         <button
           onClick={() => navigate("/")}
           className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
         >
           <ArrowLeft className="w-4 h-4" />
           <span>Orqaga</span>
         </button>
 
         <div className="glass rounded-2xl p-8">
           {/* Logo */}
           <div className="flex items-center justify-center gap-3 mb-8">
             <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow">
               <Brain className="w-6 h-6 text-primary" />
             </div>
             <h1 className="text-2xl font-bold gradient-text">JBN AI</h1>
           </div>
 
           {/* Title */}
           <h2 className="text-xl font-semibold text-center mb-6">
             {isLogin ? "Hisobingizga kiring" : "Yangi hisob yarating"}
           </h2>
 
           <form onSubmit={handleSubmit} className="space-y-4">
             {!isLogin && (
               <div className="space-y-2">
                 <Label htmlFor="displayName">Ism</Label>
                 <Input
                   id="displayName"
                   type="text"
                   placeholder="Ismingiz"
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   className="bg-background/50"
                 />
               </div>
             )}
 
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="email@example.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 className="bg-background/50"
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="password">Parol</Label>
               <div className="relative">
                 <Input
                   id="password"
                   type={showPassword ? "text" : "password"}
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="bg-background/50 pr-10"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                 >
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
             </div>
 
             <Button
               type="submit"
               className="w-full"
               disabled={isLoading}
             >
               {isLoading ? "Kutib turing..." : isLogin ? "Kirish" : "Ro'yxatdan o'tish"}
             </Button>
           </form>
 
           <div className="mt-6 text-center">
             <p className="text-muted-foreground text-sm">
               {isLogin ? "Hisobingiz yo'qmi?" : "Hisobingiz bormi?"}{" "}
               <button
                 onClick={() => setIsLogin(!isLogin)}
                 className="text-primary hover:underline font-medium"
               >
                 {isLogin ? "Ro'yxatdan o'ting" : "Kiring"}
               </button>
             </p>
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 export default Auth;