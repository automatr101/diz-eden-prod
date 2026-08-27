import { motion } from "framer-motion";
import { fadeInUp, viewportOnce } from "@/lib/animations";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What are the check-in and check-out times?",
    answer: "Check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in or late check-out can be requested in advance and may incur additional charges.",
  },
  {
    question: "How many guests can each apartment sleep?",
    answer: "The 1-Bedroom Suite sleeps up to 2 guests. The 2-Bedroom Residence sleeps up to 4 guests across two king-sized bedrooms.",
  },
  {
    question: "What's your cancellation policy?",
    answer: "Full refund if cancelled 7+ days before check-in, 50% refund if cancelled 3–6 days before, and no refund inside 3 days. See our full Cancellation Policy for details.",
  },
  {
    question: "Is it safe to pay online?",
    answer: "Yes — all payments are processed securely through Paystack with SSL encryption. We never see or store your card details directly.",
  },
  {
    question: "What's included in the stay?",
    answer: "High-speed Wi-Fi, a Smart TV with Netflix, air conditioning, a fully equipped gourmet kitchen, daily housekeeping, private parking, and 24/7 security are included with every booking.",
  },
  {
    question: "Can I get in touch before booking?",
    answer: "Absolutely — message us on WhatsApp or use the contact form below and our concierge team will respond quickly with anything you need to know.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="bg-eden py-12 px-6 sm:py-20 lg:py-28 lg:px-16 border-t border-white/5">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={viewportOnce}
        className="mx-auto max-w-3xl text-center mb-10 sm:mb-14"
      >
        <span className="text-label-sm uppercase tracking-[0.3em] font-bold text-gold">Good to Know</span>
        <h2 className="mt-4 text-display-md sm:text-display-lg text-white md:text-display-xl leading-tight">
          Frequently Asked <em className="font-light text-gold">Questions</em>
        </h2>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={viewportOnce}
        className="mx-auto max-w-3xl"
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`} className="border-white/10">
              <AccordionTrigger className="text-white text-left text-base sm:text-lg font-medium hover:no-underline hover:text-gold transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-cream/70 text-sm sm:text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
