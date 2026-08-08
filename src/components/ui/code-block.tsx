import type { CSSProperties } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

/**
 * CodeBlock — unified syntax-highlighted code display for lecture pages.
 *
 * Usage:
 *   <CodeBlock
 *     language="python"
 *     title="database.py — connection setup"
 *     lines={[
 *       'from sqlalchemy import create_engine',
 *       'engine = create_engine(DATABASE_URL)',
 *     ]}
 *   />
 *
 * Supported languages (Prism identifiers):
 *   cpp | python | sql | typescript | tsx | javascript | yaml | markdown | bash | json | ...
 *   Any valid Prism language slug works.
 */

export type CodeLanguage =
    | 'cpp'
    | 'python'
    | 'sql'
    | 'typescript'
    | 'tsx'
    | 'javascript'
    | 'yaml'
    | 'markdown'
    | 'bash'
    | 'json'
    | (string & {});

export interface CodeBlockProps {
    language: CodeLanguage;
    title: string;
    lines: string[];
    copyable?: boolean;
}

/** The one permitted color literal: the system accent (identical in both themes). */
const ACCENT = 'hsl(16 86% 54%)';
/** Comment grey — grey-2, identical in both themes by design. */
const COMMENT = '#8f8f8f';
/** Strings collapse to the secondary-text grey (theme-aware via CSS var). */
const STRING = 'hsl(var(--muted-foreground))';

/**
 * Ink syntax theme — collapsed to the system. Keywords carry the accent at
 * weight 500; strings drop to secondary grey; comments dim + italic; everything
 * else inherits ink, with WEIGHT (700), not hue, marking structure.
 */
const inkSyntaxTheme: Record<string, CSSProperties> = {
    'code[class*="language-"]': {
        color: 'inherit',
        background: 'none',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        direction: 'ltr',
        textAlign: 'left',
        whiteSpace: 'pre',
        wordSpacing: 'normal',
        wordBreak: 'normal',
        tabSize: 4,
        hyphens: 'none',
    },
    'pre[class*="language-"]': {
        color: 'inherit',
        background: 'transparent',
        margin: 0,
    },
    comment: { color: COMMENT, fontStyle: 'italic' },
    prolog: { color: COMMENT, fontStyle: 'italic' },
    doctype: { color: COMMENT, fontStyle: 'italic' },
    cdata: { color: COMMENT, fontStyle: 'italic' },
    keyword: { color: ACCENT, fontWeight: 500 },
    atrule: { color: ACCENT, fontWeight: 500 },
    rule: { color: ACCENT, fontWeight: 500 },
    important: { color: ACCENT, fontWeight: 500 },
    string: { color: STRING },
    char: { color: STRING },
    'attr-value': { color: STRING },
    'template-string': { color: STRING },
    regex: { color: STRING },
    url: { color: STRING },
    function: { color: 'inherit', fontWeight: 700 },
    'function-name': { color: 'inherit', fontWeight: 700 },
    'class-name': { color: 'inherit', fontWeight: 700 },
    selector: { color: 'inherit', fontWeight: 700 },
    tag: { color: 'inherit', fontWeight: 700 },
    punctuation: { color: 'inherit' },
    operator: { color: 'inherit' },
    builtin: { color: 'inherit' },
    boolean: { color: 'inherit' },
    number: { color: 'inherit' },
    constant: { color: 'inherit' },
    symbol: { color: 'inherit' },
    property: { color: 'inherit' },
    variable: { color: 'inherit' },
    'attr-name': { color: 'inherit' },
    entity: { color: 'inherit' },
    namespace: { color: 'inherit' },
    inserted: { color: 'inherit' },
    deleted: { color: 'inherit' },
    bold: { fontWeight: 700 },
    italic: { fontStyle: 'italic' },
};

const highlighterStyle: CSSProperties = {
    margin: 0,
    padding: '1rem 1.25rem',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 1.6,
    overflow: 'visible',
};

export function CodeBlock({ language, title, lines, copyable = false }: CodeBlockProps) {
    const code = lines.join('\n');

    return (
        <div className="my-6 border border-border bg-page font-mono text-[12.5px] text-foreground">
            {/* Title bar */}
            <div className="hatch h-[38px] px-4 flex items-center gap-2 border-b border-border select-none">
                <span className="w-[9px] h-[9px] rounded-full bg-grey-3 shrink-0" />
                <span className="w-[9px] h-[9px] rounded-full bg-grey-3 shrink-0" />
                <span className="w-[9px] h-[9px] rounded-full bg-grey-3 shrink-0" />
                <span className="ml-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground truncate">
                    {title}
                </span>
            </div>
            <div className="overflow-x-auto overscroll-x-contain leading-[1.6]">
                <SyntaxHighlighter
                    language={language}
                    style={inkSyntaxTheme}
                    customStyle={highlighterStyle}
                    codeTagProps={{ style: !copyable && { userSelect: 'none', WebkitUserSelect: 'none' } }}
                    PreTag="div"
                    wrapLongLines={false}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
