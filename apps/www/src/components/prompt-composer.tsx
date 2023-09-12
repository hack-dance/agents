import { Forward, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { AnimatedBorderWrapper } from "./animated-border-wrapper"

export interface PromptComposerProps {
  prompt: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onSubmit: (value: string) => void
  loading: boolean
  onCancel?: () => void
  animatedLoading?: boolean
  placeholder?: string
}

/**
 * `PromptComposer` is a component that allows users to input prompts and submit them.
 *
 * @param {PromptComposerProps} props - The properties that define the component's behavior and display.
 *
 * @returns {React.ReactElement} The rendered `PromptComposer` component.
 */
export function PromptComposer({
  prompt = "",
  placeholder,
  onChange,
  onKeyDown,
  onSubmit,
  onCancel,
  loading = false,
  animatedLoading = true
}: PromptComposerProps) {
  return (
    <>
      <AnimatedBorderWrapper enabled={animatedLoading && loading}>
        <div className="flex h-auto flex-row items-center relative">
          <div className="w-full">
            <Input
              disabled={loading}
              autoFocus
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={placeholder ?? "Ask me anything..."}
              value={prompt}
              className="focus:z-100 placeholder:text-foreground-muted relative flex h-11  w-full rounded-md bg-background py-3 pr-[52px] text-sm outline-none disabled:cursor-not-allowed disabled:opacity-[1] disabled:bg-muted disabled:placeholder-text-foreground-muted disabled:text-foreground-muted"
            />
          </div>
          <div className="">
            {loading ? (
              <Loader2 className="ml-[-30px] h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSubmit(prompt)}
                className="ml-[-46px] h-8"
              >
                <Forward className="h-4 w-4 shrink-0 cursor-pointer opacity-50" />
              </Button>
            )}
          </div>
        </div>
        {loading && onCancel && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="absolute right-0 mt-2"
          >
            Stop Generating
          </Button>
        )}
      </AnimatedBorderWrapper>
    </>
  )
}
