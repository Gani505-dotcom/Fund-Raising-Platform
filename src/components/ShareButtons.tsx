import { useState } from "react";
import { MessageCircle, Facebook, Linkedin, Send, Mail, Link2, Check, Share2 } from "lucide-react";
import { copyToClipboard, getShareLink, classNames } from "@/utils";
import { useToast } from "@/context/ToastContext";
import Button from "./ui/Button";

interface ShareButtonsProps {
  url: string;
  title?: string;
  text?: string;
  variant?: "row" | "grid";
  showLabel?: boolean;
}

export default function ShareButtons({
  url,
  title = "Support NayePankh Foundation",
  text = "Help me raise funds for a meaningful cause. Your contribution can make a real difference!",
  variant = "row",
  showLabel = false,
}: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(url);
      setCopied(true);
      toast("Link copied to your clipboard.", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Could not copy link. Please copy it manually.", "error");
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const platforms = [
    { name: "whatsapp", icon: MessageCircle, label: "WhatsApp", color: "hover:bg-[#25D366] hover:text-white", url: getShareLink("whatsapp", url, text) },
    { name: "facebook", icon: Facebook, label: "Facebook", color: "hover:bg-[#1877F2] hover:text-white", url: getShareLink("facebook", url, text) },
    { name: "linkedin", icon: Linkedin, label: "LinkedIn", color: "hover:bg-[#0A66C2] hover:text-white", url: getShareLink("linkedin", url, text) },
    { name: "telegram", icon: Send, label: "Telegram", color: "hover:bg-[#0088cc] hover:text-white", url: getShareLink("telegram", url, text) },
    { name: "email", icon: Mail, label: "Email", color: "hover:bg-gray-600 hover:text-white", url: getShareLink("email", url, text) },
  ];

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 transition-all",
              p.color,
            )}
          >
            <p.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{p.label}</span>
          </a>
        ))}
        <button
          onClick={handleCopy}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
        >
          {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
          <span className="text-xs font-medium">{copied ? "Copied!" : "Copy"}</span>
        </button>
        {typeof navigator !== "undefined" && navigator.share && (
          <button
            onClick={handleWebShare}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-secondary-500 hover:text-white transition-all"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">Share</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {platforms.map((p) => (
        <a
          key={p.name}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className={classNames(
            "p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-all",
            p.color,
          )}
          aria-label={`Share on ${p.label}`}
          title={`Share on ${p.label}`}
        >
          <p.icon className="w-4 h-4" />
        </a>
      ))}
      <Button variant="outline" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}>
        {showLabel && (copied ? "Copied!" : "Copy Link")}
      </Button>
    </div>
  );
}
