import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tg } from "@/lib/telegram";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// ─── SECURITY: Basic input sanitization ──────────────────────
function sanitize(str: string): string {
  return str.replace(/[<>"'`;(){}]/g, "").trim();
}

interface Contact2Props {
  title?: string;
  description?: string;
  phone?: string;
  web?: { label: string; url: string };
}

export const Contact2 = ({
  title = "Let's Connect",
  description = "Our concierge team is standing by to ensure your stay at Diz Eden is nothing short of extraordinary.",
  phone = "+233 25 607 1641",
  web = { label: "dizeden.com", url: "https://dizeden.com" },
}: Contact2Props) => {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstName = firstNameRef.current?.value?.trim() || "";
    const lastName = lastNameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || "";
    const subject = subjectRef.current?.value?.trim() || "";
    const message = messageRef.current?.value?.trim() || "";

    if (!firstName || !email || !message) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    // ─── SECURITY: Sanitize all inputs ───
    const cleanFirst = sanitize(firstName);
    const cleanLast = sanitize(lastName);
    const cleanEmail = sanitize(email);
    const cleanSubject = sanitize(subject);
    const cleanMessage = sanitize(message);

    // ─── SECURITY: Basic email format validation ───
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    await tg.newContactForm({
      name: `${cleanFirst} ${cleanLast}`.trim(),
      phone: cleanEmail, // use email as identifier if no phone field
      message: cleanSubject ? `[${cleanSubject}]\n${cleanMessage}` : cleanMessage,
    });

    setLoading(false);
    setSent(true);

    // Reset form
    if (firstNameRef.current) firstNameRef.current.value = "";
    if (lastNameRef.current) lastNameRef.current.value = "";
    if (emailRef.current) emailRef.current.value = "";
    if (subjectRef.current) subjectRef.current.value = "";
    if (messageRef.current) messageRef.current.value = "";
  };

  return (
    <section id="contact" className="py-16 sm:py-32 bg-eden border-t border-white/10 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mx-auto flex max-w-screen-xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto flex max-w-sm flex-col justify-between gap-8 sm:gap-10"
          >
            <div className="text-center lg:text-left">
              <h2 className="mb-2 text-4xl sm:text-5xl font-display font-light text-gold lg:mb-1 lg:text-7xl">
                {title}
              </h2>
              <p className="text-cream mt-4 sm:mt-6 leading-relaxed text-base sm:text-lg">{description}</p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-4 sm:mb-6 text-center text-xl sm:text-2xl font-display text-gold lg:text-left">
                Contact Details
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-cream">
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <span className="font-bold text-white">Phone: </span>
                  <a href="https://wa.link/aboffc" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                    {phone}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <span className="font-bold text-white">Instagram: </span>
                  <a href="https://www.instagram.com/diz.eden/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors underline decoration-gold/30">
                    @diz.eden
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <span className="font-bold text-white">Web: </span>
                  <a href={web.url} target="_blank" className="underline decoration-gold/50 hover:text-gold transition-colors">
                    {web.label}
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-screen-md flex-col gap-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-md"
          >
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-4 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-green-400" />
                </div>
                <h3 className="text-white text-xl sm:text-2xl font-display font-light">Message Sent!</h3>
                <p className="text-cream/60 text-sm sm:text-base">
                  We've received your message and will get back to you on WhatsApp shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-4 text-xs uppercase tracking-widest text-gold border border-gold/30 px-6 py-2 rounded-full hover:bg-gold/10 transition-all"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="firstname" className="text-white font-bold ml-1">First Name *</Label>
                    <Input ref={firstNameRef} type="text" id="firstname" placeholder="First Name" className="bg-eden/40 border-white/10 text-white placeholder:text-white/20 focus:border-gold/50 rounded-full px-6 h-12" />
                  </div>
                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="lastname" className="text-white font-bold ml-1">Last Name</Label>
                    <Input ref={lastNameRef} type="text" id="lastname" placeholder="Last Name" className="bg-eden/40 border-white/10 text-white placeholder:text-white/20 focus:border-gold/50 rounded-full px-6 h-12" />
                  </div>
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="email" className="text-white font-bold ml-1">Email Address *</Label>
                  <Input ref={emailRef} type="email" id="email" placeholder="Email" className="bg-eden/40 border-white/10 text-white placeholder:text-white/20 focus:border-gold/50 rounded-full px-6 h-12" />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="subject" className="text-white font-bold ml-1">Subject</Label>
                  <Input ref={subjectRef} type="text" id="subject" placeholder="What should we discuss?" className="bg-eden/40 border-white/10 text-white placeholder:text-white/20 focus:border-gold/50 rounded-full px-6 h-12" />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="message" className="text-white font-bold ml-1">Your Message *</Label>
                  <Textarea ref={messageRef} placeholder="How can we help you today?" id="message" className="bg-eden/40 border-white/10 text-white placeholder:text-white/20 focus:border-gold/50 rounded-[1.5rem] p-6 min-h-[150px]" />
                </div>
                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold hover:bg-white text-eden font-bold py-6 sm:py-8 rounded-full text-lg sm:text-xl transition-all duration-500 shadow-lg shadow-gold/20 uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <><Loader2 size={20} className="animate-spin" /> Sending...</>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
};
