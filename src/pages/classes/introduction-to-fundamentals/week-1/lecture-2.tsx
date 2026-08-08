import { Terminal } from 'lucide-react';
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureTip,
    LectureSectionHeading,
    LectureSubHeading,
    LectureP,
    LectureTerm,
} from '@/components/ui/lecture-typography';

export default function Week1Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={1}
                session="Lecture 2"
                title="Shell Scripting & Permissions"
                description="Automate repetitive tasks with bash scripts and understand the Unix permission model that controls who can read, write, and execute everything on the system."
                icon={<Terminal className="h-4 w-4" />}
            />

            {/* ── 01 WHY SHELL SCRIPTS ──────────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="Why Shell Scripts?" />

            <LectureP>
                You already run commands one at a time in the terminal. A <LectureTerm>shell script</LectureTerm> is a text file full of those same commands, run in sequence. There is no new syntax to learn: just the commands you already know, saved in a file. Scripts turn one-off tasks into repeatable automation: deploy a server, run tests, back up a folder, or set up a new project.
            </LectureP>
            <LectureP>
                On Linux servers and in CI/CD pipelines, shell scripts are everywhere. They're the glue that ties tools together. Learning to write clear, safe scripts will save you hours and make you at home in any Unix environment.
            </LectureP>

            <LectureCallout type="info">
                On servers, scripts often run without a human at the keyboard, launched via <LectureTip tip="Scheduled tasks. cron runs commands at fixed times (e.g. every night at 2am).">cron</LectureTip>, init systems, or deployment pipelines. That's why making scripts <strong className="text-foreground">fail fast</strong> and use clear paths matters: there's no one there to notice a typo.
            </LectureCallout>

            {/* ── 02 THE SHEBANG AND EXECUTING SCRIPTS ───────────────────────── */}
            <LectureSectionHeading number="02" title="The Shebang and Executing Scripts" />

            <LectureP>
                The first line of a script tells the system which interpreter to use. That line is the <LectureTerm>shebang</LectureTerm> (from "hash" + "bang"): <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">#!</code> followed by the path to the shell.
            </LectureP>

            <CodeBlock
                language="bash"
                title="backup.sh"
                lines={[
                    '#!/bin/bash',
                    '# Backup the project folder',
                    'cp -r ./project ./project-backup-$(date +%Y%m%d)',
                ]}
            />

            <LectureP>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">#!/bin/bash</code> means "run this file with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/bin/bash</code>." On macOS, bash is often at <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/bin/bash</code> or you might use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">#!/usr/bin/env bash</code> so the system finds whatever <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">bash</code> is in your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">PATH</code>.
            </LectureP>

            <TerminalBlock
                lines={[
                    { comment: 'create the script file', cmd: 'touch backup.sh' },
                    { comment: 'open backup.sh in your editor and add the shebang + cp command above', cmd: 'nano backup.sh' },
                    { comment: 'make the script executable', cmd: 'chmod +x backup.sh' },
                    { comment: 'run it from the current directory', cmd: './backup.sh' },
                ]}
            />

            <LectureCallout type="tip">
                <LectureTip code tip="Make a file executable. Required before you can run ./script.sh.">chmod +x</LectureTip> is required before <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">./backup.sh</code> works. Without execute permission, the shell will refuse to run the file. You only need to run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">chmod +x</code> once per script.
            </LectureCallout>

            <LectureP>
                Try it yourself before moving on. You just created a script named <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backup.sh</code>, but running <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">./backup.sh</code> fails with "Permission denied".
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 1: Make it runnable"
                prompt={<>Write the single command that adds execute permission to <code>backup.sh</code> so that <code>./backup.sh</code> works.</>}
                expected={["chmod +x backup.sh", "chmod u+x backup.sh", "chmod a+x backup.sh", "chmod +x ./backup.sh", "chmod u+x ./backup.sh", "chmod 755 backup.sh", "chmod 700 backup.sh"]}
                hint="The command that changes file modes, with the +x flag, then the filename."
            />

            {/* ── 03 VARIABLES AND QUOTING ─────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Variables and Quoting" />

            <LectureP>
                Store values in variables and reuse them. In bash, you <strong className="text-foreground">don't</strong> use spaces around <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">=</code>. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">$VAR</code> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'${VAR}'}</code> to read them.
            </LectureP>

            <CodeBlock
                language="bash"
                title="example.sh"
                lines={[
                    '#!/bin/bash',
                    'NAME="my-project"',
                    'echo "Building $NAME"',
                    'echo "Date: $(date)"',
                ]}
            />

            <LectureP>
                <LectureTip tip="Double quotes allow variable expansion. Single quotes treat everything literally.">Double quotes</LectureTip> let <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">$NAME</code> expand. <LectureTip tip="Command substitution: run the command and use its output as the string.">$(date)</LectureTip> runs the command and inserts its output. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'${VAR}'}</code> when the variable name is followed by letters or digits so the shell knows where the name ends.
            </LectureP>

            <LectureCallout type="warning">
                In scripts, unquoted variables can break on spaces or empty values. Prefer <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'"$VAR"'}</code> (quoted) so a path like <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/home/my project</code> is treated as one argument, not two.
            </LectureCallout>

            <LectureSubHeading title="Script arguments" />
            <LectureP>
                Scripts can accept input from the command line. When you run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">./script.sh Alice Bob</code>, the shell sets special variables: <LectureTip tip="The first argument passed to the script. $2 is the second, and so on.">$1</LectureTip> is <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Alice</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">$2</code> is <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Bob</code>, <LectureTip tip="All arguments as a single string. Useful for passing everything along to another command.">$@</LectureTip> is all arguments, and <LectureTip tip="The number of arguments passed. Useful for validation: check that the user provided enough inputs.">$#</LectureTip> is the count.
            </LectureP>

            <CodeBlock
                language="bash"
                title="greet.sh"
                lines={[
                    '#!/bin/bash',
                    'echo "Hello, $1!"',
                    'echo "You passed $# argument(s): $@"',
                ]}
            />

            <TerminalBlock
                lines={[
                    { comment: 'run with one argument', cmd: './greet.sh Alice' },
                    { comment: 'run with multiple arguments', cmd: './greet.sh Alice Bob Charlie' },
                ]}
            />

            <LectureCallout type="info">
                Always quote <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'"$1"'}</code> in scripts. If the user passes a path with spaces (like <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">./deploy.sh "my project"</code>), unquoted <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">$1</code> splits it into two words. The same quoting rule from variables applies to all arguments.
            </LectureCallout>

            {/* ── 04 CONDITIONALS AND EXIT CODES ─────────────────────────────── */}
            <LectureSectionHeading number="04" title="Conditionals and Exit Codes" />

            <LectureP>
                Every command returns an <LectureTerm>exit code</LectureTerm>: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">0</code> means success, non-zero means failure. Scripts use this to decide what to do next. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">if</code> checks the exit code of the command that follows.
            </LectureP>

            <CodeBlock
                language="bash"
                title="check.sh"
                lines={[
                    '#!/bin/bash',
                    'if grep -q "error" server.log; then',
                    '  echo "Errors found in log"',
                    '  exit 1',
                    'fi',
                ]}
            />

            <LectureP>
                <LectureTip code tip="Quiet mode: no output, only exit code. Perfect for scripts.">grep -q</LectureTip> succeeds (exit 0) if it finds a match and fails otherwise. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">exit 1</code> tells the rest of the system "this script failed."
            </LectureP>

            <LectureCallout type="tip">
                Put <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">set -e</code> at the top of a script to make it exit immediately if any command fails. Without it, the script keeps going after a failure, which can cause dangerous follow-up actions (e.g. deploying broken code). In production scripts, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">set -e</code> is standard.
            </LectureCallout>

            <LectureSubHeading title="else and elif" />
            <LectureP>
                Most real scripts need more than one branch. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">else</code> handles the fallback; <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">elif</code> adds additional conditions without nesting.
            </LectureP>

            <CodeBlock
                language="bash"
                title="check-env.sh"
                lines={[
                    '#!/bin/bash',
                    'if [ "$1" = "prod" ]; then',
                    '  echo "Deploying to PRODUCTION. Are you sure?"',
                    'elif [ "$1" = "staging" ]; then',
                    '  echo "Deploying to staging"',
                    'elif [ "$1" = "dev" ]; then',
                    '  echo "Deploying to dev"',
                    'else',
                    '  echo "Unknown environment: $1"',
                    '  echo "Usage: ./check-env.sh [dev|staging|prod]"',
                    '  exit 1',
                    'fi',
                ]}
            />

            <LectureP>
                Notice: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">elif</code> is just "else if" compressed. You can chain as many as needed. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">else</code> at the bottom catches anything that didn't match, so always include one for unexpected inputs.
            </LectureP>

            <LectureSubHeading title="Test operators" />
            <LectureP>
                The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">[ ]</code> syntax (called <LectureTerm>test</LectureTerm>) is how bash compares values. Spaces around the brackets are required. There are three families of operators:
            </LectureP>

            <CodeBlock
                language="bash"
                title="test-operators.sh · string, number, and file tests"
                lines={[
                    '#!/bin/bash',
                    '',
                    '# String comparisons',
                    'if [ "$NAME" = "admin" ]; then echo "Welcome, admin"; fi',
                    'if [ "$NAME" != "admin" ]; then echo "Access denied"; fi',
                    'if [ -z "$NAME" ]; then echo "NAME is empty"; fi',
                    'if [ -n "$NAME" ]; then echo "NAME is set"; fi',
                    '',
                    '# Numeric comparisons',
                    'if [ "$COUNT" -eq 0 ]; then echo "Zero"; fi',
                    'if [ "$COUNT" -gt 10 ]; then echo "More than 10"; fi',
                    'if [ "$COUNT" -lt 5 ]; then echo "Less than 5"; fi',
                    '',
                    '# File tests',
                    'if [ -f "config.env" ]; then echo "Config exists"; fi',
                    'if [ -d "src" ]; then echo "src/ is a directory"; fi',
                    'if [ ! -f ".env" ]; then echo ".env missing!"; exit 1; fi',
                ]}
            />

            <LectureP>
                <strong className="text-foreground">Strings:</strong> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">=</code> equal, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">!=</code> not equal, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-z</code> empty, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-n</code> not empty.{' '}
                <strong className="text-foreground">Numbers:</strong> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-eq</code> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-ne</code> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-lt</code> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-gt</code> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-le</code> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-ge</code>.{' '}
                <strong className="text-foreground">Files:</strong> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-f</code> exists (file), <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-d</code> exists (directory), <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">!</code> negates any test.
            </LectureP>

            <CodeBlock
                language="bash"
                title="validate.sh · practical argument validation"
                lines={[
                    '#!/bin/bash',
                    'if [ $# -eq 0 ]; then',
                    '  echo "Error: no file provided"',
                    '  echo "Usage: ./validate.sh <filename>"',
                    '  exit 1',
                    'fi',
                    '',
                    'if [ ! -f "$1" ]; then',
                    '  echo "Error: $1 does not exist or is not a file"',
                    '  exit 1',
                    'fi',
                    '',
                    'echo "File $1 is valid: $(wc -l < "$1") lines"',
                ]}
            />

            {/* ── 05 LOOPS ────────────────────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Loops" />

            <LectureP>
                Loop over a list of items or over lines in a file. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">for ... in ...</code> is the most common.
            </LectureP>

            <TerminalBlock
                title="bash · loop over files"
                lines={[
                    { comment: 'run a command once per .txt file', cmd: 'for f in *.txt; do echo "Processing $f"; done' },
                    { comment: 'loop over a list', cmd: 'for env in dev staging prod; do echo "Deploy $env"; done' },
                ]}
            />

            <LectureP>
                You can also loop over the output of a command: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">for f in $(ls *.sh); do ...</code>. Be careful with filenames that contain spaces, because they'll be split. Prefer <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">find</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-exec</code> for complex cases.
            </LectureP>

            <LectureCallout type="info">
                <LectureTip code tip="Find files and run a command on each. -type f = files only; -name '*.sh' = match pattern.">{'find . -name "*.sh" -exec chmod +x {} \\;'}</LectureTip> is a robust way to make all <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.sh</code> files in a tree executable without breaking on spaces in names.
            </LectureCallout>

            <LectureSubHeading title="while loops" />
            <LectureP>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">while</code> repeats as long as a condition is true. Useful for countdowns, retries, and reading input.
            </LectureP>

            <CodeBlock
                language="bash"
                title="countdown.sh"
                lines={[
                    '#!/bin/bash',
                    'count=5',
                    'while [ $count -gt 0 ]; do',
                    '  echo "$count..."',
                    '  count=$((count - 1))',
                    'done',
                    'echo "Go!"',
                ]}
            />

            <LectureSubHeading title="Reading files line by line" />
            <LectureP>
                The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">while read</code> pattern is the standard way to process a file one line at a time. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'< file'}</code> at the end feeds the file's contents into the loop.
            </LectureP>

            <CodeBlock
                language="bash"
                title="process-lines.sh"
                lines={[
                    '#!/bin/bash',
                    '# Process each line of a config file',
                    'while IFS= read -r line; do',
                    '  # Skip empty lines and comments',
                    '  [ -z "$line" ] && continue',
                    '  [[ "$line" == \\#* ]] && continue',
                    '  echo "Processing: $line"',
                    'done < config.txt',
                ]}
            />

            <LectureCallout type="tip">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">IFS=</code> preserves leading whitespace. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-r</code> prevents backslash interpretation. Together they ensure each line is read exactly as it appears in the file. This is the safe way to process files line-by-line.
            </LectureCallout>

            {/* ── 06 FUNCTIONS ─────────────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Functions" />

            <LectureP>
                Functions let you name and reuse blocks of logic inside a script. Instead of copying the same five lines in three places, define a function once and call it by name. This makes scripts readable, testable, and maintainable.
            </LectureP>

            <CodeBlock
                language="bash"
                title="deploy-helpers.sh"
                lines={[
                    '#!/bin/bash',
                    '',
                    'log() {',
                    '  echo "[$(date +%H:%M:%S)] $1"',
                    '}',
                    '',
                    'check_dependency() {',
                    '  if ! which "$1" > /dev/null 2>&1; then',
                    '    log "ERROR: $1 is not installed"',
                    '    return 1',
                    '  fi',
                    '  log "$1 found at $(which "$1")"',
                    '}',
                    '',
                    'check_dependency "node"',
                    'check_dependency "docker"',
                    'log "All checks passed"',
                ]}
            />

            <LectureP>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">return</code> sets the exit code of the function, not the script. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">return 1</code> means the function failed; the script continues unless you check it with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">set -e</code> or an explicit <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">if</code>.
            </LectureP>

            <LectureSubHeading title="Local variables" />
            <LectureP>
                By default, variables inside a function are <strong className="text-foreground">global</strong>, meaning they leak into the rest of the script. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">local</code> to scope a variable to the function.
            </LectureP>

            <CodeBlock
                language="bash"
                title="local variables"
                lines={[
                    'build_path() {',
                    '  local dir="$1"',
                    '  local name="$2"',
                    '  echo "$dir/$name"',
                    '}',
                    '',
                    'result=$(build_path "/home/you" "project")',
                    'echo "$result"  # /home/you/project',
                    '# $dir and $name are not accessible here',
                ]}
            />

            <LectureCallout type="info">
                Functions + arguments + conditionals = scripts that are readable, testable, and reusable. If you find yourself writing the same logic twice, extract it into a function. This is the same principle as functions in any programming language.
            </LectureCallout>

            {/* ── 07 PERMISSIONS IN DEPTH ─────────────────────────────────────── */}
            <LectureSectionHeading number="07" title="Permissions in Depth" />

            <LectureP>
                Recall the permission string from Lecture 1: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-rwxr-xr--</code>. The first character is the type (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-</code> file, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">d</code> directory), then three groups of <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">rwx</code> for <LectureTerm>owner</LectureTerm>, <LectureTerm>group</LectureTerm>, and <LectureTerm>others</LectureTerm>. Here we go deeper: numeric permissions, ownership commands, and the special role of execute on directories.
            </LectureP>

            <LectureSubHeading title="Numeric permissions" />
            <LectureP>
                You'll see permissions as numbers: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">755</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">644</code>. Each digit is the sum of r=4, w=2, x=1. So <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">7</code> = rwx, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">5</code> = r-x, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">0</code> = no access.
            </LectureP>

            <TerminalBlock
                lines={[
                    { comment: 'owner read+write+execute, group and others read+execute (scripts)', cmd: 'chmod 755 deploy.sh' },
                    { comment: 'owner read+write, group and others read-only (config files)', cmd: 'chmod 644 config.env' },
                    { comment: 'owner only: read+execute, no one else (secret script)', cmd: 'chmod 700 secret.sh' },
                ]}
            />

            <LectureCallout type="warning">
                On a shared server, scripts that contain secrets (API keys, passwords) should be <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">chmod 700</code> so only the owner can read or run them. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">chmod 755</code> lets anyone on the system read the file, which is fine for non-sensitive scripts but dangerous for anything that touches credentials.
            </LectureCallout>

            <LectureP>
                Check your understanding of numeric permissions with the digits r=4, w=2, x=1.
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 2: Lock down a secret script"
                prompt={<>Write the command that sets <code>secret.sh</code> so the <strong>owner</strong> has read, write, and execute, and <strong>group and others have no access at all</strong>. Use the numeric (octal) form.</>}
                expectedPattern={"^chmod\\s+0?700\\s+(\\./)?secret\\.sh$"}
                normalize="trim"
                hint="Owner rwx is 4+2+1=7, and no access is 0. So the three digits are 7, 0, 0."
            />


            <LectureSubHeading title="chown and chgrp" />
            <LectureP>
                <LectureTip code tip="Change file owner. Often requires sudo.">chown</LectureTip> and <LectureTip code tip="Change file group. Useful when multiple users need access.">chgrp</LectureTip> change who owns a file or which group it belongs to. On a server, you might run a web app as a dedicated user and use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">chown www-data:www-data</code> so the web server can read the files but others cannot.
            </LectureP>

            <LectureCallout type="info">
                Directories need execute (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">x</code>) for you to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">cd</code> into them. So directory permissions are often <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">755</code> (owner full, others can enter and list) or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">711</code> (others can enter but not list contents, useful for restricted areas).
            </LectureCallout>

            {/* ── 08 CRON ────────────────────────────────────────────────────── */}
            <LectureSectionHeading number="08" title="Scheduling with cron" />

            <LectureP>
                <LectureTerm>cron</LectureTerm> runs commands at fixed times. Edit your user's crontab with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">crontab -e</code>. Each line is: minute, hour, day-of-month, month, day-of-week, then the command.
            </LectureP>

            <CodeBlock
                language="bash"
                title="crontab example"
                lines={[
                    '# Every day at 2:30 AM: backup',
                    '30 2 * * * /home/you/scripts/backup.sh',
                    '',
                    '# Every 15 minutes: health check',
                    '*/15 * * * * /home/you/scripts/health-check.sh',
                ]}
            />

            <LectureP>
                Use absolute paths in cron jobs. Cron runs with a minimal environment, so your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">PATH</code> and current directory are not what you expect. Scripts started by cron also don't see your terminal; redirect output to a log file if you want to debug.
            </LectureP>

            <LectureCallout type="tip">
                End cron entries with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'>> /var/log/my-script.log 2>&1'}</code> to capture both stdout and stderr. Otherwise failed runs leave no trace unless you've set up separate logging.
            </LectureCallout>

            {/* ── 09 PUTTING IT TOGETHER ──────────────────────────────────────── */}
            <LectureSectionHeading number="09" title="Putting It Together" />

            <LectureP>
                A real deploy script uses everything from this lecture: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">set -e</code>, functions, arguments, conditionals, and clear logging. Here's the pattern you'll see in production:
            </LectureP>

            <CodeBlock
                language="bash"
                title="deploy.sh · production-style pattern"
                lines={[
                    '#!/bin/bash',
                    'set -e',
                    '',
                    'log() { echo "[$(date +%H:%M:%S)] $1"; }',
                    '',
                    'require() {',
                    '  if ! which "$1" > /dev/null 2>&1; then',
                    '    log "ERROR: $1 is not installed"',
                    '    exit 1',
                    '  fi',
                    '}',
                    '',
                    '# Validate environment argument',
                    'if [ -z "$1" ]; then',
                    '  echo "Usage: ./deploy.sh [dev|staging|prod]"',
                    '  exit 1',
                    'fi',
                    '',
                    'ENV="$1"',
                    'cd "$(dirname "$0")"',
                    '',
                    '# Check prerequisites',
                    'require "node"',
                    'require "npm"',
                    '',
                    'log "Deploying to $ENV..."',
                    'npm run build',
                    '',
                    'if [ "$ENV" = "prod" ]; then',
                    '  log "Running production checks..."',
                    '  npm test',
                    'fi',
                    '',
                    'log "Deploy to $ENV complete."',
                ]}
            />

            <LectureP>
                This script validates its input, checks dependencies, branches on the environment, and logs every step. Compare it to the three-line <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backup.sh</code> from section 02: same language, dramatically more capable.
            </LectureP>

            <LectureCallout type="warning">
                Avoid <LectureTip code tip="Recursive force delete. No undo. In a script, a wrong variable or path can wipe the wrong directory." warn>rm -rf</LectureTip> in scripts unless the path is fixed and you're certain. Prefer moving to a trash directory or using a flag that requires confirmation. One typo in a variable used with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">rm -rf $VAR</code> has destroyed production systems.
            </LectureCallout>


        </LectureLayout>
    );
}
