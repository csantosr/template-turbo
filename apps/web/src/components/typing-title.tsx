"use client";

import { useEffect, useRef, useState } from "react";

interface TypingTitleProps {
  title: string | null;
  fallback: string;
  className?: string;
}

export function TypingTitle({ title, fallback, className = "" }: TypingTitleProps) {
  const [displayedText, setDisplayedText] = useState(fallback);
  const [isTyping, setIsTyping] = useState(false);
  const prevTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (!title) {
      setDisplayedText(fallback);
      setIsTyping(false);
      prevTitleRef.current = null;
      return;
    }

    if (title === displayedText) {
      return;
    }

    const isNewTitle = prevTitleRef.current === null || prevTitleRef.current === fallback;

    if (isNewTitle) {
      setIsTyping(true);
      setDisplayedText("");

      let index = 0;
      const interval = setInterval(() => {
        if (index < title.length) {
          setDisplayedText(title.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 40);

      return () => clearInterval(interval);
    } else {
      setDisplayedText(title);
    }

    prevTitleRef.current = title;
  }, [title, fallback]);

  useEffect(() => {
    if (title !== null) {
      prevTitleRef.current = title;
    }
  }, [title]);

  return (
    <span className={`inline ${className}`}>
      {displayedText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
}
