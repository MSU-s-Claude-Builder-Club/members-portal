import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, X, Play, RotateCcw, Lightbulb } from 'lucide-react';

/* ============================================================================
   InteractiveExercise — a self-checking coding exercise for the lecture pages.

   Three runtimes, one API:
   - runtime="js"     → runs the student's JavaScript in a sandboxed Web Worker,
                        captures console.log output, and compares it to the
                        expected output (real execution — the "compiler").
   - runtime="python" → runs the student's Python via Pyodide (loaded lazily
                        from the CDN on first use), captures stdout, compares.
                        Degrades to a clear message if Pyodide can't load.
   - runtime="check"  → no execution engine exists for the language (bash, C++,
                        SQL, Docker, git, config); the student's answer is
                        normalized and matched against accepted answers /
                        a regex. Still "type it, get told if it's right."

   Correctness is always a comparison of PRODUCED-or-ENTERED text against an
   expected value, so authors never write a test harness — just declare the
   expected output. Design follows DESIGN.md: mono chrome, hairline borders,
   hard extrusion on the run panel, one orange accent, zero radius.
   ========================================================================== */

type Runtime = 'js' | 'python' | 'check';

export interface InteractiveExerciseProps {
  /** Which engine checks the answer. */
  runtime: Runtime;
  /** Short label, shown in the mono eyebrow, e.g. "Exercise 1". */
  title: string;
  /** The task description. */
  prompt: React.ReactNode;
  /** Language label for the editor titlebar, e.g. 'bash', 'python', 'cpp', 'sql', 'javascript'. */
  language?: string;
  /** Prefilled editor contents. */
  starter?: string;
  /**
   * Expected result.
   * - runtime js/python: the exact stdout the student's program must print
   *   (compared after normalization). Use this OR expectedPattern.
   * - runtime check: an accepted answer or list of accepted answers
   *   (compared after normalization).
   */
  expected?: string | string[];
  /** Alternative to `expected`: a JS RegExp source string matched against the
   *  produced/entered text (after trim). Use for answers with flexible parts. */
  expectedPattern?: string;
  /** Normalization before comparison. 'loose' (default) collapses whitespace
   *  and lowercases; 'trim' only trims each line + the whole string. */
  normalize?: 'loose' | 'trim';
  /** Optional hint revealed on demand / after a wrong attempt. */
  hint?: string;
  /** Success message (defaults to "Correct."). */
  successMessage?: string;
}

const EDITOR_MIN_ROWS = 4;

function normalizeText(s: string, mode: 'loose' | 'trim'): string {
  if (mode === 'trim') {
    return s
      .split('\n')
      .map((l) => l.replace(/\s+$/g, '').replace(/^\s+/g, ''))
      .join('\n')
      .trim();
  }
  // loose: collapse all runs of whitespace to a single space, lowercase, trim
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

function matches(
  produced: string,
  { expected, expectedPattern, normalize = 'loose' }: Pick<InteractiveExerciseProps, 'expected' | 'expectedPattern' | 'normalize'>,
): boolean {
  if (expectedPattern) {
    try {
      return new RegExp(expectedPattern).test(produced.trim());
    } catch {
      return false;
    }
  }
  const list = Array.isArray(expected) ? expected : expected != null ? [expected] : [];
  const np = normalizeText(produced, normalize);
  return list.some((e) => normalizeText(e, normalize) === np);
}

/** Runs JS source in a throwaway Web Worker, capturing console.log; 3s timeout. */
function runJsInWorker(source: string): Promise<{ output: string; error?: string }> {
  return new Promise((resolve) => {
    const boot = `
      self.__out = [];
      const log = (...a) => self.__out.push(a.map(x => {
        try { return typeof x === 'string' ? x : JSON.stringify(x); } catch { return String(x); }
      }).join(' '));
      const console = { log, info: log, warn: log, error: log };
      self.onmessage = (e) => {
        try {
          const fn = new Function('console', e.data);
          fn(console);
          self.postMessage({ output: self.__out.join('\\n') });
        } catch (err) {
          self.postMessage({ output: self.__out.join('\\n'), error: String(err && err.message ? err.message : err) });
        }
      };
    `;
    let worker: Worker | null = null;
    let url = '';
    const done = (r: { output: string; error?: string }) => {
      try { worker?.terminate(); } catch { /* noop */ }
      if (url) URL.revokeObjectURL(url);
      resolve(r);
    };
    try {
      url = URL.createObjectURL(new Blob([boot], { type: 'text/javascript' }));
      worker = new Worker(url);
      const timer = setTimeout(() => done({ output: '', error: 'Timed out (possible infinite loop).' }), 3000);
      worker.onmessage = (e) => { clearTimeout(timer); done(e.data); };
      worker.onerror = (e) => { clearTimeout(timer); done({ output: '', error: e.message || 'Worker error' }); };
      worker.postMessage(source);
    } catch (err) {
      done({ output: '', error: err instanceof Error ? err.message : 'Could not start runner' });
    }
  });
}

/* Pyodide is loaded once, lazily, from the CDN and cached on window. */
type PyodideLike = { runPythonAsync: (code: string) => Promise<unknown>; setStdout: (o: { batched: (s: string) => void }) => void; setStderr: (o: { batched: (s: string) => void }) => void };
declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<PyodideLike>;
    __pyodidePromise?: Promise<PyodideLike>;
  }
}
const PYODIDE_VERSION = '0.26.4';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

function loadPyodideOnce(): Promise<PyodideLike> {
  if (window.__pyodidePromise) return window.__pyodidePromise;
  window.__pyodidePromise = new Promise<PyodideLike>((resolve, reject) => {
    const start = () => {
      window
        .loadPyodide?.({ indexURL: PYODIDE_BASE })
        .then(resolve)
        .catch(reject);
    };
    if (window.loadPyodide) return start();
    const s = document.createElement('script');
    s.src = `${PYODIDE_BASE}pyodide.js`;
    s.onload = start;
    s.onerror = () => reject(new Error('Could not load the Python runtime.'));
    document.head.appendChild(s);
  });
  return window.__pyodidePromise;
}

async function runPython(source: string): Promise<{ output: string; error?: string }> {
  try {
    const py = await loadPyodideOnce();
    const buf: string[] = [];
    py.setStdout({ batched: (s: string) => buf.push(s) });
    py.setStderr({ batched: (s: string) => buf.push(s) });
    try {
      await py.runPythonAsync(source);
      return { output: buf.join('\n') };
    } catch (err) {
      return { output: buf.join('\n'), error: err instanceof Error ? err.message : String(err) };
    }
  } catch (err) {
    return { output: '', error: err instanceof Error ? err.message : 'Python runtime unavailable' };
  }
}

type Status = 'idle' | 'running' | 'pass' | 'fail';

export function InteractiveExercise({
  runtime,
  title,
  prompt,
  language,
  starter = '',
  expected,
  expectedPattern,
  normalize = 'loose',
  hint,
  successMessage = 'Correct.',
}: InteractiveExerciseProps) {
  const [code, setCode] = useState(starter);
  const [status, setStatus] = useState<Status>('idle');
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const langLabel = (language || (runtime === 'python' ? 'python' : runtime === 'js' ? 'javascript' : 'answer')).toUpperCase();

  // grow the textarea to fit content
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(ta.scrollHeight, EDITOR_MIN_ROWS * 20)}px`;
  }, [code]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + '  ' + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
  };

  const check = useCallback(async () => {
    setStatus('running');
    setShowHint(false);
    let produced = code;
    let engineError: string | undefined;

    if (runtime === 'js') {
      const r = await runJsInWorker(code);
      produced = r.output;
      engineError = r.error;
      setOutput(r.error ? `${r.output}${r.output ? '\n' : ''}Error: ${r.error}` : r.output || '(no output)');
    } else if (runtime === 'python') {
      const r = await runPython(code);
      produced = r.output;
      engineError = r.error;
      setOutput(r.error ? `${r.output}${r.output ? '\n' : ''}Error: ${r.error}` : r.output || '(no output)');
    } else {
      setOutput('');
    }

    // A hard engine error (syntax/runtime/timeout) is always a fail.
    const ok = !engineError && matches(produced, { expected, expectedPattern, normalize });
    if (ok) {
      setStatus('pass');
      setMessage(successMessage);
    } else {
      setStatus('fail');
      setMessage(engineError ? 'Your code errored — read the output and try again.' : 'Not quite. Check the output and try again.');
    }
  }, [code, runtime, expected, expectedPattern, normalize, successMessage]);

  const reset = () => {
    setCode(starter);
    setStatus('idle');
    setOutput('');
    setMessage('');
    setShowHint(false);
  };

  const runLabel = runtime === 'check' ? 'Check answer' : 'Run & check';

  return (
    <div className="my-8 border border-border bg-page shadow-[8px_8px_0_0_hsl(var(--foreground))]">
      {/* Chrome titlebar */}
      <div className="hatch flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-grey-3" />
            <span className="h-2 w-2 rounded-full bg-grey-3" />
            <span className="h-2 w-2 rounded-full bg-grey-3" />
          </span>
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-grey-3">{langLabel}</span>
      </div>

      {/* Prompt */}
      <div className="border-b border-hairline-faint px-4 py-3 text-sm leading-relaxed text-ink-soft [&_code]:rounded-none [&_code]:border [&_code]:border-hairline-faint [&_code]:bg-tint [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
        {prompt}
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={taRef}
          value={code}
          onChange={(e) => { setCode(e.target.value); if (status !== 'idle') { setStatus('idle'); setMessage(''); } }}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={`${title} — code editor`}
          className="block w-full resize-none border-0 bg-page px-4 py-3 font-mono text-[12.5px] leading-[1.6] text-foreground outline-none placeholder:text-grey-3 focus-visible:outline-none"
          placeholder={runtime === 'check' ? 'Type your answer…' : 'Write your code…'}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 border-t border-hairline-faint px-4 py-2.5">
        <button
          type="button"
          onClick={check}
          disabled={status === 'running'}
          className="inline-flex min-h-[36px] items-center gap-2 border-2 border-border bg-page px-4 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        >
          <Play className="h-3.5 w-3.5" />
          {status === 'running' ? 'Running…' : runLabel}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[36px] items-center gap-2 border border-border bg-page px-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-200 hover:bg-tint hover:text-foreground motion-reduce:transition-none"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        {hint && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="inline-flex min-h-[36px] items-center gap-2 px-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-200 hover:text-primary motion-reduce:transition-none"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {showHint ? 'Hide hint' : 'Hint'}
          </button>
        )}
      </div>

      {/* Hint */}
      {hint && showHint && (
        <div className="border-t border-hairline-faint bg-tint px-4 py-2.5 text-sm text-ink-soft">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hint</span>
          <p className="mt-1">{hint}</p>
        </div>
      )}

      {/* Output (js/python only) */}
      {runtime !== 'check' && output && (
        <div className="border-t border-hairline-faint">
          <div className="border-b border-hairline-faint px-4 py-1.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Output</span>
          </div>
          <pre className="max-h-56 overflow-auto px-4 py-3 font-mono text-[12px] leading-[1.55] text-ink-soft show-scrollbar">{output}</pre>
        </div>
      )}

      {/* Result banner */}
      {(status === 'pass' || status === 'fail') && (
        <div
          className={
            status === 'pass'
              ? 'flex items-center gap-2 border-t-2 border-primary bg-primary px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-primary-foreground'
              : 'flex items-center gap-2 border-t border-border bg-page px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-foreground'
          }
          role="status"
          aria-live="polite"
        >
          {status === 'pass' ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0 text-primary" />}
          {message}
        </div>
      )}
    </div>
  );
}

export default InteractiveExercise;
