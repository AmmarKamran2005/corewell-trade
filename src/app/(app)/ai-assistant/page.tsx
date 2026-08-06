"use client";

import * as React from "react";
import { Sparkles, SendHorizonal, Plus, MessageCircle, ChevronRight, Star, Flag, User2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "Which product sold most last month?",
  "Show me overdue invoices in Central",
  "Summarise this month's P&L",
  "Who should I call for collections today?",
  "Why did COGS spike in March?",
  "Top 5 customers by revenue this quarter",
  "Compare Central vs Northgate branch performance",
  "What's tying up the most working capital?",
];

const RECENT_CHATS = [
  { id: 1, title: "Sales summary for April",       time: "2 hours ago" },
  { id: 2, title: "Overdue invoice analysis",        time: "Yesterday"   },
  { id: 3, title: "Top suppliers Q1 2026",           time: "2 days ago"  },
  { id: 4, title: "Why VR cables stopped selling",   time: "3 days ago"  },
];

type Msg = { id: number; role: "user" | "assistant"; content: string; pending?: boolean };

// Canned answers keyed by intent — picks the closest match.
function generateAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("sold") || q.includes("top product") || q.includes("best seller")) {
    return "**Top sellers — last 30 days**\n\n1. Nortex Titan T9 Earbuds — 845 units · $8.4K revenue\n2. Nortex VR Type-C Cable 1.5m — 712 units · $3K\n3. Nortex VOLT 65W Charger — 480 units · $4.8K\n4. Nortex PowerX 20K Power Bank — 340 units · $2K\n5. Nortex VSP Bluetooth Speaker — 220 units · $2.1K\n\nTitan T9 is up **+18% MoM** — driven by Central (Riverside Plaza) and Northgate (Market Row) corridors. Recommend re-stocking before next weekend.";
  }
  if (q.includes("overdue") || q.includes("collection")) {
    return "**Top overdue customers (Central region)**\n\n• Riverside Plaza #28 — $2.2K · 45 days overdue\n• Mobile Mart Eastvale — $645 · 32 days overdue\n• Tech Bazaar — $385 · 30 days overdue\n\nCombined exposure: **$3.2K**. I'd recommend a phone call to Riverside Plaza first — they've historically settled within 48 hours of contact. Want me to draft an SMS reminder for the rest?";
  }
  if (q.includes("p&l") || q.includes("pnl") || q.includes("profit")) {
    return "**P&L summary — April 2026 (Apr 1 – Apr 30)**\n\n| Metric | Amount | vs Mar |\n|---|---|---|\n| Revenue | $218K | +12% |\n| COGS | $142K | +9% |\n| **Gross Profit** | **$76K** | **+18%** |\n| Operating Expenses | $34K | +4% |\n| **Net Profit** | **$42K** | **+24%** |\n\nGross margin improved 2.1 pts (34.9% vs 32.8%) — primarily due to better Titan T9 mix and lower freight on Volt charger imports.";
  }
  if (q.includes("cogs") || q.includes("spike")) {
    return "**COGS spike in March — root cause**\n\nMarch COGS was $130K (vs $104K in Feb, +25%). Decomposition:\n\n• **Volume**: +12% (more units sold) — accounts for ~50% of increase\n• **Freight**: $3.8K extra inbound air-freight on Titan T15 Pro launch — accounts for ~30%\n• **FX**: the supplier's currency strengthened ~2% between PO and GRN dates — accounts for ~15%\n• **One-off**: $920 rework cost on damaged Volt 65W batch (CEN-WH-01) — ~5%\n\nThe FX hit is recoverable next quarter as we've locked the rate via forward contract for May–July.";
  }
  if (q.includes("top customer") || q.includes("top 5")) {
    return "**Top 5 customers — Q1 2026 by revenue**\n\n1. Riverside Plaza #28 — $18.5K (8.4% of total)\n2. Meridian Distributors — $14.2K (6.5%)\n3. Mobile Zone Northgate — $11.8K (5.4%)\n4. Tech Bazaar — $9.8K (4.5%)\n5. Fairview Mobile Mart — $8.4K (3.8%)\n\nTop 5 = **28.6% of revenue**. Concentration risk is moderate. Riverside Plaza is your highest-margin account at 38% gross margin (vs 34% portfolio avg).";
  }
  if (q.includes("compare") && (q.includes("branch") || q.includes("karachi") || q.includes("lahore"))) {
    return "**Central vs Northgate — last 30 days**\n\n| KPI | Central | Northgate | Δ |\n|---|---|---|---|\n| Revenue | $124K | $68.5K | CEN +81% |\n| Orders | 742 | 318 | CEN +133% |\n| Avg Order | $167.12 | $215.4 | NGT is **+29% richer** |\n| Gross Margin | 34.2% | 36.8% | NGT +2.6 pts |\n| Returns Rate | 1.8% | 0.9% | NGT cleaner |\n\nNorthgate has lower volume but higher quality revenue. Worth investigating what's driving Central's higher returns rate.";
  }
  if (q.includes("working capital") || q.includes("tied up")) {
    return "**Working capital — what's locked up**\n\n• **AR (Accounts Receivable)**: $84K — DSO 42 days (target 30)\n• **Inventory**: $142K — 187 days of stock (target 90)\n  - Of which slow-moving (>60d): $21K\n  - Of which dead (>180d): $8.4K\n• **AP (Accounts Payable)**: -$46K (negative = source of cash)\n\n**Net WC = $180K tied up.** Quickest win: clear $8.4K of dead stock via clearance. Second: tighten DSO to 35 days to release ~$14K.";
  }
  return `Got it — let me look that up for you.\n\nBased on your data, here's what I found regarding "${question}":\n\nThis is a demo response. In production, the AI would call secure tools to query your real ERP data and return a grounded answer with charts and source links.`;
}

export default function AIAssistantPage() {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [pending, setPending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const idCounter = React.useRef(1);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || pending) return;
    const userId = idCounter.current++;
    const aiId = idCounter.current++;
    setMessages((m) => [...m, { id: userId, role: "user", content: q }, { id: aiId, role: "assistant", content: "", pending: true }]);
    setInput("");
    setPending(true);
    setTimeout(() => {
      setMessages((m) => m.map((msg) => msg.id === aiId ? { ...msg, content: generateAnswer(q), pending: false } : msg));
      setPending(false);
    }, 900);
  }

  function newChat() {
    setMessages([]);
    setInput("");
    toast.success("Started a new chat");
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "AI Assistant" }]}
        title={
          <div className="inline-flex items-center gap-2">
            AI Assistant
            <Badge variant="accent">NEW</Badge>
          </div>
        }
        subtitle="Powered by Gemini · Ask anything about your business in plain English"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat sessions sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Button variant="accent" size="md" className="w-full gap-1.5" onClick={newChat}>
            <Plus />
            New Chat
          </Button>

          <Card>
            <CardBody>
              <h3 className="text-2xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-3">Recent Chats</h3>
              <div className="space-y-1">
                {RECENT_CHATS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { toast.info(`Loading "${c.title}"…`); setMessages([{ id: 1, role: "user", content: c.title }, { id: 2, role: "assistant", content: generateAnswer(c.title) }]); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 text-left transition-colors group"
                  >
                    <MessageCircle className="size-3.5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-navy-900 dark:text-white truncate">{c.title}</div>
                      <div className="text-2xs text-slate-500 dark:text-slate-400">{c.time}</div>
                    </div>
                    <ChevronRight className="size-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="bg-info/5 border-info/20">
            <CardBody>
              <div className="text-xs text-info-dark dark:text-info-light leading-relaxed">
                💡 <strong>How it works:</strong> The AI uses your real data via secure tool calls. It never sees raw data — only aggregated answers. Every query is logged.
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main chat */}
        <div className="lg:col-span-3">
          <Card className="min-h-[60vh] flex flex-col">
            <CardBody className="flex-1 flex flex-col">
              <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
                {messages.length === 0 ? (
                  /* Welcome state */
                  <div className="flex-1 flex flex-col items-center justify-center py-12">
                    <div className="size-20 rounded-3xl bg-brand/10 flex items-center justify-center mb-4">
                      <Sparkles className="size-9 text-brand" />
                    </div>
                    <h2 className="text-2xl font-bold text-navy-900 dark:text-white">How can I help you today?</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md text-center">
                      Ask me anything about your sales, inventory, finances, or operations. I&apos;ll give you data-grounded answers.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-8 w-full max-w-2xl">
                      {SUGGESTED.map((q) => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          className="text-left p-3 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-navy-800 hover:bg-brand/10 dark:hover:bg-brand/10 hover:text-navy-900 dark:hover:text-white rounded-lg transition-colors border border-transparent hover:border-brand/30 group"
                        >
                          <div className="flex items-start gap-2">
                            <Star className="size-3.5 text-brand flex-shrink-0 mt-0.5" />
                            <span>{q}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 py-2">
                    {messages.map((m) => (
                      <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}>
                        <div className={cn("size-8 rounded-full flex items-center justify-center flex-shrink-0",
                          m.role === "user" ? "bg-navy-900 text-white dark:bg-navy-700" : "bg-brand/15 text-brand"
                        )}>
                          {m.role === "user" ? <User2 className="size-4" /> : <Sparkles className="size-4" />}
                        </div>
                        <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                          m.role === "user"
                            ? "bg-navy-900 text-white dark:bg-navy-700 rounded-tr-sm"
                            : "bg-slate-50 dark:bg-navy-800 text-navy-900 dark:text-white rounded-tl-sm border border-slate-100 dark:border-navy-700"
                        )}>
                          {m.pending ? (
                            <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Loader2 className="size-4 animate-spin" />
                              Thinking…
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap leading-relaxed prose-sm">{m.content}</div>
                          )}
                          {!m.pending && m.role === "assistant" && (
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-navy-700 text-2xs text-slate-500 dark:text-slate-400">
                              <button className="hover:text-navy-900 dark:hover:text-white" onClick={() => { navigator.clipboard.writeText(m.content); toast.success("Copied to clipboard"); }}>Copy</button>
                              <span>·</span>
                              <button className="hover:text-success" onClick={() => toast.success("Thanks for the feedback!")}>👍 Helpful</button>
                              <button className="hover:text-danger" onClick={() => toast.info("Feedback noted — we'll improve this answer.")}>👎 Not helpful</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="pt-4 border-t border-slate-200 dark:border-navy-700">
                <form onSubmit={(e) => { e.preventDefault(); send(); }}>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Ask the AI assistant…  (e.g. 'show me sales trend by region')"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={pending}
                      className="pr-12 h-11 bg-slate-50 dark:bg-navy-900 focus:bg-white dark:focus:bg-navy-800"
                    />
                    <Button type="submit" size="icon-sm" variant="accent" disabled={pending || !input.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      {pending ? <Loader2 className="animate-spin" /> : <SendHorizonal />}
                    </Button>
                  </div>
                </form>
                <div className="flex items-center justify-between mt-2 text-2xs text-slate-500 dark:text-slate-400">
                  <span>Powered by Gemini 1.5 Pro · responses are grounded in your data</span>
                  <button onClick={() => toast.success("Reported — thanks for flagging.")} className="hover:text-navy-900 dark:hover:text-white inline-flex items-center gap-1">
                    <Flag className="size-3" />
                    Flag wrong answer
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
