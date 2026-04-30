import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FAQAccordionProps {
  items: { id: string; q: string; a: string }[]
  className?: string
}

/**
 * Hairline-separated FAQ list using Radix Accordion in `multiple` mode.
 * Trigger: question in body weight 500, ChevronDown rotates 180deg on open.
 * Content: answer in body. 1px paper-line between items.
 */
export function FAQAccordion({ items, className }: FAQAccordionProps) {
  return (
    <Accordion.Root
      type="multiple"
      className={cn(
        'w-full divide-y divide-[var(--color-paper-3)] border-y border-[var(--color-paper-3)]',
        className,
      )}
    >
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id} className="group">
          <Accordion.Header asChild>
            <h3 className="m-0">
              <Accordion.Trigger
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-body text-base font-medium text-[var(--color-ink)] transition-colors duration-[180ms] hover:text-[var(--color-rust)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]"
                aria-label={item.q}
              >
                <span className="flex-1">{item.q}</span>
                <ChevronDown
                  size={18}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="shrink-0 text-[var(--color-ink-3)] transition-transform duration-[360ms] [transition-timing-function:var(--ease-out)] group-data-[state=open]:rotate-180 group-data-[state=open]:text-[var(--color-rust)]"
                />
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-[var(--color-ink-2)] data-[state=closed]:animate-none">
            <div className="pb-6 pr-10 font-body text-base leading-[1.6] max-w-[62ch]">
              {item.a}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
