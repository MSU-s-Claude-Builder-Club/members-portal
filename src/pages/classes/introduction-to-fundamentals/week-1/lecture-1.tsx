import { Terminal } from 'lucide-react';
import { TerminalBlock } from '@/components/ui/terminal-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureTip,
    LectureSectionHeading,
    LectureSubHeading,
    LectureP,
} from '@/components/ui/lecture-typography';

export default function Week1Lecture1() {
    return (
        <LectureLayout>
            <LectureHeader
                week={1}
                session="Lecture 1"
                title="Linux & The Command Line"
                description="Every server, container, and cloud environment runs Linux underneath. Learn to navigate, manipulate files, manage processes, and install software without touching a mouse."
                icon={<Terminal className="h-4 w-4" />}
            />

            {/* ── 01 WHAT IS THE TERMINAL ─────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="What is the Terminal?" />

            <LectureP>
                You usually interact with a <LectureTip tip="Windows, icons, buttons, mouse: a layer on top of the OS to make things approachable. A convenience, not a necessity.">GUI</LectureTip>. Underneath it is a <LectureTip tip="A program that takes typed commands and passes them directly to the operating system. No middleman.">shell</LectureTip>. The <LectureTip tip="Also called command line, console, or CLI. The window where you type commands to the shell.">terminal</LectureTip> is where you talk to that shell.
            </LectureP>
            <LectureP>
                The shell exposes everything; GUIs only expose what a designer included. Automate tasks, chain operations, and work on remote servers, all from the terminal.
            </LectureP>

            <LectureCallout type="info">
                You'll use <LectureTip code tip="Bourne Again Shell, the default on most Linux. Brian Fox, 1989.">bash</LectureTip> or <LectureTip code tip="Z Shell, the default on macOS since Catalina. Very similar to bash.">zsh</LectureTip>. This course works in both.
            </LectureCallout>

            <LectureSubHeading title="Opening a terminal" />

            <LectureP>
                <LectureTip tip="⌘ + Space → type “Terminal” → Enter. Or use iTerm2 for more power.">macOS</LectureTip>: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">⌘ + Space</code>, type "Terminal", Enter.
            </LectureP>
            <LectureP>
                <LectureTip tip="Install WSL2 from the Microsoft Store for a real Linux environment inside Windows.">Windows</LectureTip>: install WSL2. Search "WSL" in the Microsoft Store.
            </LectureP>
            <LectureP>
                <LectureTip tip="Ctrl + Alt + T on most distros.">Linux</LectureTip>: you already have one. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Ctrl + Alt + T</code>.
            </LectureP>
            <LectureP>
                You'll see a <LectureTip tip="The shell is waiting for input. Type after the $ and press Enter to run. That's the whole interface.">prompt</LectureTip> (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">$</code>). Type a command, press Enter.
            </LectureP>

            <TerminalBlock lines={[{ cmd: '' }]} />

            {/* ── 02 NAVIGATION ───────────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Navigating the Filesystem" />

            <LectureP>
                Files live in a <LectureTip tip="A tree of directories and files. On Linux/macOS everything starts at / (root). Home is /home/you or /Users/you; ~ is shorthand for home.">filesystem</LectureTip>. You're always "in" one folder: your <LectureTip tip="Where you currently are. Commands run relative to this unless you specify a path.">working directory</LectureTip>.
            </LectureP>

            <LectureSubHeading title="Where am I?" />
            <LectureP>
                <LectureTip code tip="print working directory: the full path of where you are. Run whenever you're disoriented.">pwd</LectureTip>
            </LectureP>
            <TerminalBlock lines={[{ comment: 'print your current location', cmd: 'pwd' }]} />

            <LectureSubHeading title="What's in here?" />
            <LectureP>
                <LectureTip code tip="list: contents of the current directory. -l = long format (permissions, size, date). -a = show hidden files (names starting with .).">ls</LectureTip>. Use <LectureTip code tip="-la: long format + all files. The combo you'll use most.">-la</LectureTip> for the full picture.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'list files in the current directory', cmd: 'ls' },
                    { comment: 'list ALL files including hidden ones, in long format', cmd: 'ls -la' },
                    { comment: 'list a specific directory without navigating there', cmd: 'ls -la /etc' },
                ]}
            />

            <LectureSubHeading title="Moving around" />
            <LectureP>
                <LectureTip code tip="change directory: move to another folder. Like double-clicking, but faster.">cd</LectureTip> moves you. <LectureTip code tip="Parent directory, one level up. Use constantly.">..</LectureTip> goes up; <LectureTip code tip="Your home directory. Works anywhere.">~</LectureTip> goes home.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'go to the Documents folder inside your home directory', cmd: 'cd ~/Documents' },
                    { comment: 'go up one level (to the parent directory)', cmd: 'cd ..' },
                    { comment: 'go up two levels at once', cmd: 'cd ../..' },
                    { comment: 'go back to your home directory (the ~ shortcut)', cmd: 'cd ~' },
                    { comment: 'go back to the last directory you were in', cmd: 'cd -' },
                ]}
            />
            <LectureCallout type="tip">
                <LectureTip tip="Start typing a path or filename and hit Tab, and the shell completes it. Tab twice for multiple matches. Saves thousands of keystrokes.">Tab</LectureTip> autocompletes. Use it.
            </LectureCallout>

            <LectureSubHeading title="Getting help" />
            <LectureP>
                Every command has a built-in manual. <LectureTip code tip="Full manual for any command. man ls, man grep, man chmod. q to quit. When in doubt, man it out.">man</LectureTip> shows it. Use it any time you forget flags or want to know what a command can do.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'open the manual for ls (scroll with arrows, q to quit)', cmd: 'man ls' },
                    { comment: 'look up grep flags', cmd: 'man grep' },
                    { comment: 'check what chmod options exist', cmd: 'man chmod' },
                ]}
            />
            <LectureCallout type="info">
                When in doubt, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">man</code> it out. You don't need to memorize every flag; you need to know where to look.
            </LectureCallout>

            <LectureSubHeading title="Check yourself" />
            <LectureP>
                Before moving on, make sure the core listing command is in your fingers.
            </LectureP>
            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 1"
                prompt={<>Write the command that lists <strong>all</strong> files in the current directory, including hidden ones, in long format.</>}
                expected={["ls -la", "ls -al", "ls -l -a", "ls -a -l"]}
                hint="Combine the -l (long format) and -a (all files) flags of ls."
            />

            {/* ── 03 FILE MANIPULATION ────────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Creating and Manipulating Files" />

            <LectureP>
                Create, copy, move, delete, all from the terminal.
            </LectureP>

            <LectureSubHeading title="Creating files and directories" />
            <TerminalBlock
                lines={[
                    { comment: 'create an empty file called notes.txt', cmd: 'touch notes.txt' },
                    { comment: 'create a new directory called projects', cmd: 'mkdir projects' },
                    { comment: 'create nested directories in one shot', cmd: 'mkdir -p projects/web/src' },
                ]}
            />
            <LectureP>
                <LectureTip code tip="Creates an empty file (or updates its timestamp).">touch</LectureTip> for files. <LectureTip code tip="Creates a directory. -p = create parent dirs as needed.">mkdir</LectureTip> for folders. <LectureTip code tip="-p: create parent directories. Without it, mkdir fails if parents don't exist.">-p</LectureTip> when nesting.
            </LectureP>

            <LectureSubHeading title="Editing files" />
            <LectureP>
                When you need to add or change content in a file, use a text editor. From the terminal, the two you'll find on almost every Linux and macOS system are:
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'nano: type directly, Ctrl+O to save, Ctrl+X to quit (easiest)', cmd: 'nano notes.txt' },
                    { comment: 'vim: press i to type, Esc then :wq and Enter to save and quit', cmd: 'vim notes.txt' },
                ]}
            />
            <LectureP>
                <strong className="text-foreground">nano</strong> is simpler: you type, then save and exit with the key combos shown at the bottom of the screen. <strong className="text-foreground">vim</strong> is powerful but modal: you switch between "normal" mode (commands) and "insert" mode (typing). If you use VS Code or Cursor, you can open a file with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">code filename</code> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">cursor filename</code> if the editor's CLI is installed. In this course we use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">touch</code> when we only need an empty file; when a lesson says "use your editor" or "open in a text editor," use one of the options above.
            </LectureP>
            <LectureP>
                <strong className="text-foreground">Vim quick reference:</strong>
            </LectureP>
            <ul className="list-disc pl-6 py-1.5 space-y-2 text-sm text-muted-foreground [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-border">
                <li><LectureTip code tip="Enter insert mode so you can type. You'll see -- INSERT -- at the bottom. Press Esc when done typing.">i</LectureTip>: insert mode (type)</li>
                <li><LectureTip code tip="Leave insert mode and return to command mode. You must be in command mode before typing : commands.">Esc</LectureTip>: command mode</li>
                <li><LectureTip code tip="Write (save) the file and quit. Type :wq then press Enter.">:wq</LectureTip>: save and quit</li>
                <li><LectureTip code tip="Quit without saving. Discards any changes. Use when you want to exit without keeping edits.">:q!</LectureTip>: quit without saving</li>
            </ul>
            <LectureP>
                If Git or another tool opens vim and you're stuck, press <LectureTip code tip="Leave insert mode.">Esc</LectureTip> then type <LectureTip code tip="Save and quit.">:wq</LectureTip> and Enter.
            </LectureP>

            <LectureSubHeading title="Writing content with echo" />
            <LectureP>
                <LectureTip code tip="Print text to the terminal, or redirect it into a file. The simplest way to create a file with content in one command.">echo</LectureTip> prints text. Combined with <LectureTip tip="Send a command's output to a file instead of the screen. > overwrites, >> appends.">redirection</LectureTip>, it creates files with content in one shot, no editor needed.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'print text to the terminal', cmd: 'echo "hello world"' },
                    { comment: 'write text into a file (creates it if it doesn\'t exist, overwrites if it does)', cmd: 'echo "# My Project" > README.md' },
                    { comment: 'append a second line without erasing the first', cmd: 'echo "Work in progress" >> README.md' },
                    { comment: 'verify the contents', cmd: 'cat README.md' },
                ]}
            />
            <LectureP>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'>'}</code> overwrites the file. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'>>'}</code> appends. You'll use this pattern constantly; section 05 covers redirection and pipes in full.
            </LectureP>

            <LectureSubHeading title="Copying and moving" />
            <TerminalBlock
                lines={[
                    { comment: 'copy notes.txt to a new file called backup.txt', cmd: 'cp notes.txt backup.txt' },
                    { comment: 'copy a whole directory and everything inside it', cmd: 'cp -r projects projects-backup' },
                    { comment: 'move (or rename) a file', cmd: 'mv notes.txt ~/Documents/notes.txt' },
                    { comment: 'rename a file (mv works for renaming too)', cmd: 'mv backup.txt old-notes.txt' },
                ]}
            />
            <LectureP>
                <LectureTip code tip="Copy a file. -r for directories.">cp</LectureTip>. <LectureTip code tip="Move (or rename: same directory, new name). No separate rename command.">mv</LectureTip>.
            </LectureP>

            <LectureSubHeading title="Deleting files" />
            <TerminalBlock
                lines={[
                    { comment: 'delete a single file', cmd: 'rm notes.txt' },
                    { comment: 'delete a directory and all its contents', cmd: 'rm -r projects-backup' },
                ]}
            />
            <LectureP>
                <LectureTip code tip="Permanent delete. No trash, no undo. -r for directories.">rm</LectureTip> deletes for good.
            </LectureP>
            <LectureCallout type="warning">
                <LectureTip code tip="Recursive + force. No confirmation. Wrong path = disaster. Never run on / or system paths." warn>rm -rf</LectureTip> is dangerous. Double-check the path.
            </LectureCallout>

            {/* ── 04 READING FILES ────────────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Reading File Contents" />

            <LectureP>
                Read files without opening an editor: logs, configs, code.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'print the entire contents of a file', cmd: 'cat notes.txt' },
                    { comment: 'view a large file one screen at a time', cmd: 'less server.log' },
                    { comment: 'print the first 10 lines of a file', cmd: 'head server.log' },
                    { comment: 'print the last 10 lines', cmd: 'tail server.log' },
                    { comment: 'watch a log file update in real time', cmd: 'tail -f server.log' },
                ]}
            />
            <LectureP>
                <LectureTip code tip="Print whole file to the terminal.">cat</LectureTip>. <LectureTip code tip="Scroll through large files: arrows, / to search, q to quit.">less</LectureTip> for big files. <LectureTip code tip="Follow mode: stream new lines as they're added. Essential for live logs.">tail -f</LectureTip> for live logs.
            </LectureP>

            <LectureSubHeading title="Searching inside files with grep" />
            <LectureP>
                <LectureTip code tip="Search for a pattern; prints every matching line. -i = case-insensitive, -n = line numbers, -r = recursive through dirs. One of the most useful commands.">grep</LectureTip> finds text in files.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'find every line containing the word "error"', cmd: 'grep "error" server.log' },
                    { comment: 'case-insensitive search', cmd: 'grep -i "error" server.log' },
                    { comment: 'search recursively through every file in a directory', cmd: 'grep -r "TODO" ./src' },
                    { comment: 'show line numbers alongside matches', cmd: 'grep -n "error" server.log' },
                    { comment: 'combine: case-insensitive + line numbers + recursive', cmd: 'grep -inr "console.log" ./src' },
                ]}
            />
            <LectureCallout type="tip">
                <LectureTip code tip="Recursive grep through a codebase, often faster than IDE search.">grep -r</LectureTip> in a project to find where something's defined or used.
            </LectureCallout>

            {/* ── 05 PIPES AND REDIRECTION ─────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Pipes and Redirection" />

            <LectureP>
                The real power of the command line comes from <LectureTip tip="Connecting commands together so the output of one becomes the input of the next. The foundation of Unix philosophy: small tools that do one thing, combined into powerful chains.">combining commands</LectureTip>. Two mechanisms make this work: <strong className="text-foreground">pipes</strong> connect commands together, and <strong className="text-foreground">redirection</strong> sends output to files.
            </LectureP>

            <LectureSubHeading title="The pipe operator" />
            <LectureP>
                <LectureTip code tip="Pipe: takes the output of the command on the left and feeds it as input to the command on the right. Chain as many as you need.">|</LectureTip> connects two commands: the left command's output becomes the right command's input. You can chain as many as you need.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'search a log file for errors', cmd: 'cat server.log | grep "error"' },
                    { comment: 'find a specific process by name', cmd: 'ps aux | grep node' },
                    { comment: 'show only the first 5 files in a long listing', cmd: 'ls -la | head -5' },
                    { comment: 'chain three commands: find 404 errors and count them', cmd: 'cat access.log | grep 404 | wc -l' },
                ]}
            />
            <LectureP>
                Each <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">|</code> takes the full output of the previous command and feeds it into the next. <LectureTip code tip="Word count. -l = count lines only. Combined with pipes, it counts how many matches grep found.">wc -l</LectureTip> counts lines; combined with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">grep</code>, it tells you how many matches exist.
            </LectureP>

            <LectureSubHeading title="Output redirection" />
            <LectureP>
                You already used <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'>'}</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'>>'}</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">echo</code> in section 03. They work with <em>any</em> command. Anything that prints to the terminal can be redirected to a file instead.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'save a directory listing to a file (overwrites)', cmd: 'ls -la > listing.txt' },
                    { comment: 'append grep results to an existing file', cmd: 'grep -r "TODO" ./src >> todos.txt' },
                    { comment: 'save the output of a piped chain', cmd: 'ps aux | grep node > running-node.txt' },
                ]}
            />

            <LectureSubHeading title="Redirecting errors" />
            <LectureP>
                Programs have two output streams: <LectureTip tip="Standard output: normal program output. File descriptor 1. Where echo, ls, grep send their results.">stdout</LectureTip> (normal output, file descriptor <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">1</code>) and <LectureTip tip="Standard error: error messages and warnings. File descriptor 2. Separate from stdout so you can capture or suppress errors independently.">stderr</LectureTip> (errors, file descriptor <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">2</code>). By default both print to your terminal. You can redirect them separately.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'send errors to a file, keep normal output on screen', cmd: 'grep -r "pattern" /etc 2> errors.log' },
                    { comment: 'send both stdout and stderr to the same file', cmd: 'npm run build > build.log 2>&1' },
                    { comment: 'throw away errors entirely (send to /dev/null)', cmd: 'find / -name "*.conf" 2> /dev/null' },
                ]}
            />
            <LectureCallout type="tip">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'2>&1'}</code> means "send stderr to wherever stdout is going." You'll see this in cron jobs, CI pipelines, and deployment scripts: anywhere you want a single log file capturing everything.
            </LectureCallout>

            <LectureSubHeading title="Check yourself" />
            <LectureP>
                Combine what you just learned about pipes with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">grep</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">wc -l</code>.
            </LectureP>
            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 2"
                prompt={<>Write a single command line that counts how many lines in <code>server.log</code> contain the word <code>error</code>.</>}
                expected={[
                    'grep "error" server.log | wc -l',
                    'grep error server.log | wc -l',
                    'cat server.log | grep "error" | wc -l',
                    'cat server.log | grep error | wc -l',
                    'grep -c "error" server.log',
                    'grep -c error server.log',
                ]}
                hint='Pipe the output of grep "error" server.log into wc -l (or use grep with the -c flag).'
            />

            {/* ── 06 PERMISSIONS ──────────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Permissions" />

            <LectureP>
                Every file has <LectureTip tip="Who can read, write, or execute. Misconfigured permissions = bugs and security issues.">permissions</LectureTip>. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ls -la</code> shows them.
            </LectureP>

            <div className="my-6 rounded-xl border border-border bg-muted/30 p-5 font-mono text-sm">
                <div className="flex items-start gap-3 flex-wrap">
                    {[
                        { chars: '-', label: 'type', color: 'text-foreground' },
                        { chars: 'rwx', label: 'owner', color: 'text-orange-500' },
                        { chars: 'r-x', label: 'group', color: 'text-blue-500' },
                        { chars: 'r--', label: 'others', color: 'text-emerald-500' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            {i > 0 && <span className="text-muted-foreground">|</span>}
                            <div className="text-center">
                                <div className={`font-bold text-lg ${item.color}`}>{item.chars}</div>
                                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    <strong>r</strong> read · <strong>w</strong> write · <strong>x</strong> execute · <strong>-</strong> none. First char: <strong>-</strong> file, <strong>d</strong> dir, <strong>l</strong> link.
                </p>
            </div>

            <LectureSubHeading title="Changing permissions with chmod" />
            <LectureP>
                <LectureTip code tip="Change permissions. Symbolic: chmod +x. Numeric: r=4, w=2, x=1, so 755 = rwxr-xr-x, 644 = rw-r--r--.">chmod</LectureTip>
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'make a script executable by the owner', cmd: 'chmod +x script.sh' },
                    { comment: 'remove write permission from others', cmd: 'chmod o-w file.txt' },
                    { comment: 'owner read+write, group and others read-only (numeric)', cmd: 'chmod 644 file.txt' },
                    { comment: 'owner full access, others read+execute (common for scripts)', cmd: 'chmod 755 script.sh' },
                ]}
            />
            <LectureCallout type="info">
                <LectureTip code tip="Make a file executable. Every .sh script needs this before you can run it.">chmod +x</LectureTip> on scripts; you'll use it constantly.
            </LectureCallout>

            {/* ── 07 PROCESSES ────────────────────────────────────────────────── */}
            <LectureSectionHeading number="07" title="Processes" />

            <LectureP>
                A <LectureTip tip="A running program. The OS gives each one a unique Process ID (PID).">process</LectureTip> is a running program. See what's running, find what's eating CPU, or stop a stuck server.
            </LectureP>

            <LectureSubHeading title="Viewing running processes" />
            <TerminalBlock
                lines={[
                    { comment: 'show your own running processes', cmd: 'ps' },
                    { comment: 'show ALL processes on the system', cmd: 'ps aux' },
                    { comment: 'find a specific process by name', cmd: 'ps aux | grep node' },
                ]}
            />
            <LectureP>
                <LectureTip code tip="Process status. aux = all processes with CPU/memory.">ps</LectureTip> shows what's running. <LectureTip code tip="Pipe: send one command's output to the next. ps aux | grep node lists all processes, then filters for 'node'.">|</LectureTip> chains commands.
            </LectureP>

            <LectureSubHeading title="Stopping processes" />
            <TerminalBlock
                lines={[
                    { comment: 'stop a process gracefully by its PID', cmd: 'kill 3829' },
                    { comment: 'force-stop a process that won\'t respond', cmd: 'kill -9 3829' },
                    { comment: 'stop all processes with a given name', cmd: 'killall node' },
                ]}
            />
            <LectureP>
                <LectureTip code tip="Send terminate signal. Default is graceful (SIGTERM).">kill</LectureTip>. <LectureTip code tip="Force kill, no cleanup. Use when a process is frozen." warn>kill -9</LectureTip> when it won't quit.
            </LectureP>
            <LectureCallout type="tip">
                <LectureTip tip="Sends interrupt to the foreground process. Standard way to stop npm run dev, Python servers, etc.">Ctrl + C</LectureTip> stops whatever's running in the terminal.
            </LectureCallout>

            {/* ── 08 PACKAGE MANAGERS ─────────────────────────────────────────── */}
            <LectureSectionHeading number="08" title="Package Managers" />

            <LectureP>
                <LectureTip tip="Installs, updates, removes software. One command handles download, verify, install, dependencies. No install wizards.">Package managers</LectureTip>: one command, everything handled.
            </LectureP>

            <LectureP>
                <LectureTip code tip="Advanced Package Tool, used on Debian/Ubuntu. Most servers use it. Always run apt update first.">apt</LectureTip> (Ubuntu/Debian), <LectureTip code tip="Homebrew, the macOS package manager. Installs what Apple doesn't ship.">brew</LectureTip> (macOS), <LectureTip code tip="Node Package Manager: JavaScript libs and tools. You'll use it constantly.">npm</LectureTip> (Node.js), <LectureTip code tip="Pip Installs Packages: Python's standard. FastAPI, NumPy, etc.">pip</LectureTip> (Python):
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'Ubuntu/Debian: apt', cmd: 'apt install nginx' },
                    { comment: 'macOS: brew', cmd: 'brew install node' },
                    { comment: 'Node.js: npm', cmd: 'npm install react' },
                    { comment: 'Python: pip', cmd: 'pip install fastapi' },
                ]}
            />

            <LectureSubHeading title="Installing software with apt" />
            <LectureP>
                <LectureTip code tip="Advanced Package Tool. Run apt update before installing.">apt</LectureTip> on Linux. A typical workflow:
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'refresh the list of available packages (always do this first)', cmd: 'sudo apt update' },
                    { comment: 'install nginx (a popular web server)', cmd: 'sudo apt install nginx' },
                    { comment: 'install node and npm', cmd: 'sudo apt install nodejs npm' },
                    { comment: 'install python3 and its package manager', cmd: 'sudo apt install python3 python3-pip' },
                    { comment: 'remove a package', cmd: 'sudo apt remove nginx' },
                ]}
            />
            <LectureP>
                <LectureTip code tip="Run as administrator for one command. Required for installing software. You'll be prompted for your password.">sudo</LectureTip> = admin for that command.
            </LectureP>
            <LectureCallout type="warning">
                <LectureTip code tip="Full system access. Can break the OS or create security holes. Only use when needed; understand what you run." warn>sudo</LectureTip>: know what the command does before you run it.
            </LectureCallout>

            <LectureSubHeading title="Finding installed programs" />
            <LectureP>
                <LectureTip code tip="Shows the full path to a program's binary. Useful to check if something is installed and which version the shell will use.">which</LectureTip> tells you where a program lives on disk, or whether it's installed at all.
            </LectureP>
            <TerminalBlock
                lines={[
                    { comment: 'find where node is installed', cmd: 'which node' },
                    { comment: 'check if python3 is available', cmd: 'which python3' },
                    { comment: 'find the brew binary on macOS', cmd: 'which brew' },
                ]}
            />
            <LectureP>
                If <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">which</code> prints nothing, the program isn't in your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">PATH</code>: either it's not installed, or the shell can't find it. Useful when you have multiple versions of a tool and want to verify which one the system will use.
            </LectureP>

            {/* ── 09 PUTTING IT TOGETHER ──────────────────────────────────────── */}
            <LectureSectionHeading number="09" title="Putting It All Together" />

            <LectureP>
                Full toolkit. One scenario: set up a project on a fresh server. This uses navigation, file creation, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">echo</code>, permissions, pipes, and package management, everything from sections 01 to 08.
            </LectureP>
            <TerminalBlock
                title="bash · fresh server"
                lines={[
                    { comment: 'start in your home directory', cmd: 'cd ~' },
                    { comment: 'create a project folder with a src subdirectory', cmd: 'mkdir -p projects/my-app/src' },
                    { comment: 'navigate into it', cmd: 'cd projects/my-app' },
                    { comment: 'confirm where you are', cmd: 'pwd' },
                    { comment: 'create a README with a heading', cmd: 'echo "# My App" > README.md' },
                    { comment: 'append a description', cmd: 'echo "A sample project" >> README.md' },
                    { comment: 'create a start script', cmd: 'echo "#!/bin/bash" > start.sh' },
                    { comment: 'add the start command to the script', cmd: 'echo "node src/index.js" >> start.sh' },
                    { comment: 'make it executable', cmd: 'chmod +x start.sh' },
                    { comment: 'verify the script has execute permission', cmd: 'ls -la | grep start' },
                    { comment: 'update package list and install node', cmd: 'sudo apt update && sudo apt install nodejs npm' },
                    { comment: 'confirm node is installed and find its path', cmd: 'which node && node --version' },
                ]}
            />
            <LectureP>
                Navigate, create structure, write content with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">echo</code>, set permissions, pipe commands together, install software, verify. First five minutes on a new server.
            </LectureP>


        </LectureLayout>
    );
}
