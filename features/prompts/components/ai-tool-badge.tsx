import { Badge } from '@/components/prompthub/ui/badge';
import type { AiTool } from '@/types/prompthub';

/** 対応AIごとに色を変えず、記号的な文字で識別する（原色の多用を避けるため） */
const SHORT_LABEL: Record<AiTool, string> = {
  ChatGPT: 'GPT',
  Claude: 'CL',
  Gemini: 'GE',
  Copilot: 'CP',
  その他: '他',
};

export function AiToolBadge({ tool, compact = false }: { tool: AiTool; compact?: boolean }) {
  return (
    <Badge tone="outline" title={`対応AI: ${tool}`}>
      <span aria-hidden="true" className="font-mono text-[10px] tracking-tight text-ph-subtle">
        {SHORT_LABEL[tool]}
      </span>
      <span className={compact ? 'sr-only' : ''}>{tool}</span>
    </Badge>
  );
}

export function AiToolBadgeList({ tools, compact }: { tools: AiTool[]; compact?: boolean }) {
  if (tools.length === 0) return null;
  return (
    <span className="flex flex-wrap items-center gap-1">
      {tools.map((tool) => (
        <AiToolBadge key={tool} tool={tool} compact={compact} />
      ))}
    </span>
  );
}
