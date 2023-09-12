"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"

import { cn } from "@/lib/utils"

const MessageWrapper = ({ children, className = "", message }) => {
  return (
    <div
      className={cn(`mb-2 rounded-xl bg-accent p-4 shadow-xl relative`, className, {
        "bg-mint-8": message.role === "assistant"
      })}
    >
      {children}
    </div>
  )
}

const MdxContent = ({ content, className = "" }) => {
  return (
    <ReactMarkdown
      linkTarget="_blank"
      rehypePlugins={[rehypeHighlight]}
      className={cn("react-markdown-message prose dark:prose-invert", className)}
      components={{
        a: ({ ...props }) => {
          return <a {...props} className="text-sky-8 hover:text-sky-9 underline" />
        },
        img: ({ src }) => {
          return (
            <div className="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/images/fallback?imageUri=${src}`}
                className="max-w-full rounded-lg shadow-md md:max-w-sm"
                alt="message image"
              />
            </div>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export function FloatingChat({ messages }) {
  return (
    <>
      <ul>
        {messages.map((message, i) => {
          return (
            <li key={message?.createdAt ?? i} className={`mb-4`}>
              <MessageWrapper message={message}>
                <MdxContent content={message.content} />
              </MessageWrapper>
            </li>
          )
        })}
      </ul>
    </>
  )
}
