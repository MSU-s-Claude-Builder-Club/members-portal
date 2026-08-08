import { Zap } from 'lucide-react';
import { TerminalBlock } from '@/components/ui/terminal-block';
import { ActivityHint } from '@/components/ui/activity-hint';
import { ActivityChallenge } from '@/components/ui/activity-challenge';
import { ActivityTask, ActivityTaskListProvider } from '@/components/ui/activity-task';
import InteractiveExercise from '@/components/ui/interactive-exercise';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureP,
    LectureTerm,
} from '@/components/ui/lecture-typography';

export default function Week1Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                week={1}
                session="Activity"
                title="Linux & Shell Scripting Gauntlet"
                description="Apply what you learned in Lecture 1 (Linux & Command Line) and Lecture 2 (Shell Scripting & Permissions): terminal navigation, file operations, permissions, and scripting. Challenges 01 focus on Linux; sections 02 and 03 preview Git and are optional. You'll cover Version Control in depth in Week 4."
                icon={<Zap className="h-4 w-4" />}
            />

            <LectureCallout type="info">
                This is a <LectureTerm>Coworking Session activity</LectureTerm>, designed to fill 90 minutes of independent work. Work at your own pace. The challenges get harder as you go. If you finish early, there's a bonus challenge at the end.
            </LectureCallout>

            {/* ── 01 LINUX FUNDAMENTALS ───────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="Linux Fundamentals" />

            <LectureP>
                Before touching Git, let's make sure you're fully comfortable in the terminal. These challenges are entirely command-line navigation and file manipulation: no editors, no GUIs.
            </LectureP>

            <ActivityChallenge
                number="1.1"
                title="Build a Project Structure"
                description="Create a specific directory layout using only terminal commands. No Finder, no File Explorer."
            >
                <LectureP>
                    Using only <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">mkdir</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">touch</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">cd</code>, recreate this exact structure inside a folder called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet</code> in your home directory:
                </LectureP>

                <div className="my-4 rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-xs text-muted-foreground select-none">
                    <p>gauntlet/</p>
                    <p className="pl-4">├── src/</p>
                    <p className="pl-8">├── components/</p>
                    <p className="pl-8">└── utils/</p>
                    <p className="pl-4">├── tests/</p>
                    <p className="pl-4">├── README.md</p>
                    <p className="pl-4">└── .env</p>
                </div>

                <div className="space-y-1">
                    <ActivityTask>Create the entire directory tree in a single command using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">mkdir -p</code></ActivityTask>
                    <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">README.md</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> inside <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet/</code></ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ls -la</code> inside <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet/</code> and confirm <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> is visible (hint: it's a hidden file)</ActivityTask>
                    <ActivityTask>Print the full absolute path to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet/src/components</code> without navigating there first</ActivityTask>
                </div>

                <ActivityHint label="creating everything at once">
                    <code className="bg-muted px-1 rounded">mkdir -p</code> can take multiple paths separated by spaces. Think about how to pass all the nested directories in one shot: <code className="bg-muted px-1 rounded">mkdir -p gauntlet/src/components gauntlet/src/utils gauntlet/tests</code>
                </ActivityHint>
                <ActivityHint label="printing a path without navigating">
                    You don't need to be inside a directory to print its path. Think about what <code className="bg-muted px-1 rounded">cd</code> and <code className="bg-muted px-1 rounded">pwd</code> do individually. Is there a way to combine that intent without actually changing your location? Or think about what <code className="bg-muted px-1 rounded">pwd</code> would print if you were inside the folder.
                </ActivityHint>
            </ActivityChallenge>

            <ActivityChallenge
                number="1.2"
                title="Permissions Puzzle"
                description="A set of permission tasks described in plain English. You figure out the commands."
            >
                <LectureP>
                    Inside your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet/</code> directory, complete the following using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">chmod</code>:
                </LectureP>

                <div className="space-y-1">
                    <ActivityTask>Create a file called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">deploy.sh</code> and make it executable by the owner, but completely inaccessible to everyone else</ActivityTask>
                    <ActivityTask>Set <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">README.md</code> so the owner can read and write, but nobody else can do anything at all</ActivityTask>
                    <ActivityTask>Set <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> so only the owner can read it: no write, no execute, no access for group or others</ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ls -la</code> and verify all three files show the permissions you intended</ActivityTask>
                </div>

                <ActivityHint label="numeric permissions for deploy.sh">
                    "Executable by owner only, nothing for anyone else." Owner needs read + execute (no write needed to run a script, but you can include it). Group and others get nothing (0). So the numeric value is: owner = 5 (r-x) or 7 (rwx), group = 0, others = 0. That gives you <code className="bg-muted px-1 rounded">500</code> or <code className="bg-muted px-1 rounded">700</code>.
                </ActivityHint>
                <ActivityHint label="numeric permissions for .env">
                    "Only the owner can read it." Owner = read only = 4. Group = 0. Others = 0. That's <code className="bg-muted px-1 rounded">chmod 400 .env</code>.
                </ActivityHint>
            </ActivityChallenge>

            <ActivityChallenge
                number="1.3"
                title="Process Hunt"
                description="Find and kill a process using only terminal commands."
            >
                <LectureP>
                    This challenge requires two terminal windows open at the same time.
                </LectureP>

                <div className="space-y-1">
                    <ActivityTask>In terminal window 1, start a process that just sits there running: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">sleep 9999</code></ActivityTask>
                    <ActivityTask>In terminal window 2, use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ps aux</code> combined with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">grep</code> to find the PID of that sleep process</ActivityTask>
                    <ActivityTask>Kill it gracefully using its PID</ActivityTask>
                    <ActivityTask>Confirm it's gone by running the same <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ps aux | grep sleep</code> again</ActivityTask>
                    <ActivityTask>Now start it again and kill it a different way, without using its PID</ActivityTask>
                </div>

                <ActivityHint label="finding the PID">
                    <code className="bg-muted px-1 rounded">ps aux | grep sleep</code> will show a line for the sleep process. The PID is the number in the second column. Be careful: you might also see a line for the grep command itself. The one you want says <code className="bg-muted px-1 rounded">sleep 9999</code>.
                </ActivityHint>
                <ActivityHint label="killing without the PID">
                    Think about what <code className="bg-muted px-1 rounded">killall</code> does. It takes a process name instead of a PID.
                </ActivityHint>
            </ActivityChallenge>

            <ActivityChallenge
                number="1.4"
                title="grep Detective"
                description="Use grep to answer questions about a codebase without opening any files."
            >
                <LectureP>
                    Navigate into <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet/src</code> and create the following files with content. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'echo "content" > filename'}</code> to write to a file from the terminal:
                </LectureP>

                <TerminalBlock
                    title="bash · ~/gauntlet/src"
                    lines={[
                        { comment: 'create some fake source files with content', cmd: 'echo "function login() { // TODO: add validation }" > components/auth.js' },
                        { cmd: 'echo "function logout() { console.log(\'user logged out\') }" >> components/auth.js' },
                        { cmd: 'echo "const API_URL = \'https://api.example.com\'" > utils/config.js' },
                        { cmd: 'echo -e "// TODO: handle errors\\nconst fetchUser = () => {}" >> utils/config.js' },
                    ]}
                />

                <div className="space-y-1">
                    <ActivityTask>Find every line containing <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">TODO</code> across all files in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">src/</code>, and show the line numbers</ActivityTask>
                    <ActivityTask>Search for <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">console.log</code> anywhere in the project, case-insensitively, recursively from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet/</code></ActivityTask>
                    <ActivityTask>Count how many lines contain the word "function" across all <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.js</code> files</ActivityTask>
                </div>

                <ActivityHint label="counting matches">
                    grep has a flag specifically for counting matching lines instead of printing them. Try <code className="bg-muted px-1 rounded">man grep</code> and look for a flag related to counting. It's <code className="bg-muted px-1 rounded">-c</code>.
                </ActivityHint>
                <ActivityHint label="searching only .js files">
                    You can tell grep to only look at files matching a pattern using the <code className="bg-muted px-1 rounded">--include</code> flag: <code className="bg-muted px-1 rounded">grep -r --include="*.js" "function" .</code>
                </ActivityHint>
            </ActivityChallenge>

            <LectureP>
                Before moving on, prove to yourself that the two most important skills from this section stuck. Answer these two checks from memory, without scrolling back up.
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Checkpoint 1: Lock down the secrets file"
                prompt={<>Write the single <code>chmod</code> command that sets <code>.env</code> so the owner can only read it, and group and others have no access at all. Use numeric (octal) permissions.</>}
                expected={["chmod 400 .env", "chmod 0400 .env"]}
                hint="Owner read only is 4. Group and others get 0. Put the three digits together, then the filename."
            />

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Checkpoint 2: Kill it by name"
                prompt={<>A stray <code>sleep</code> process is running and you don't know its PID. Write one command that terminates it by its process <strong>name</strong>.</>}
                expected={["killall sleep", "pkill sleep"]}
                hint="There are two classic tools that accept a name instead of a PID: killall and pkill."
            />

            <LectureCallout type="info">
                <strong className="text-foreground">You've completed the required portion</strong> of this activity when you can: (1) build a directory tree from a spec using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">mkdir -p</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">touch</code>, (2) set file permissions with numeric <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">chmod</code>, (3) find and kill a process by PID and by name, and (4) search a codebase with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">grep</code>. Section 01 is the minimum; sections 02 and 03 are an optional Git preview.
            </LectureCallout>

            <LectureP>
                To verify your work, run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ls -laR ~/gauntlet</code> and check that the full directory structure, file permissions, and file contents match what the challenges asked for. Show the output to your instructor/TA, or screenshot it for your own records.
            </LectureP>

            {/* ── 02 GIT IN PRACTICE (PREVIEW, FULL COVERAGE IN WEEK 4) ──────── */}
            <LectureSectionHeading number="02" title="Git in Practice (optional preview)" />

            <LectureCallout type="info">
                Version Control with Git is the focus of <strong className="text-foreground">Week 4 Lecture 1</strong>. The challenges below are an optional preview. Try them if you have time, or skip to the next activity and return after Week 4.
            </LectureCallout>

            <LectureP>
                These challenges simulate real Git scenarios. The goal isn't just to make the commands work; it's to understand what's happening at each step.
            </LectureP>

            <ActivityChallenge
                number="2.1"
                title="A Clean Commit History"
                description="Initialize a repo and build a commit history that tells a story."
            >
                <LectureP>
                    Inside your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet/</code> directory:
                </LectureP>

                <div className="space-y-1">
                    <ActivityTask>Initialize a Git repository</ActivityTask>
                    <ActivityTask>Create a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.gitignore</code> that ignores <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">node_modules/</code></ActivityTask>
                    <ActivityTask>Stage and commit <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">README.md</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.gitignore</code> together as your initial commit</ActivityTask>
                    <ActivityTask>Make a second commit adding the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">src/</code> directory contents</ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git log --oneline</code> and check that you see exactly 2 commits with clear, descriptive messages</ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git status</code> and confirm <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> does not appear anywhere, proof that the gitignore is working</ActivityTask>
                </div>

                <ActivityHint label="staging specific files together">
                    You can stage multiple specific files in one command: <code className="bg-muted px-1 rounded">git add README.md .gitignore</code>. This adds both without touching anything else in the working directory.
                </ActivityHint>
                <ActivityHint label="committing directory contents">
                    Git doesn't track empty directories, only files. Make sure your <code className="bg-muted px-1 rounded">src/</code> files actually have content before committing. If a directory appears empty, Git will ignore it entirely.
                </ActivityHint>
            </ActivityChallenge>

            <ActivityChallenge
                number="2.2"
                title="Branch and Merge"
                description="Simulate a real feature branch workflow from start to finish."
            >
                <div className="space-y-1">
                    <ActivityTask>Create and switch to a branch called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">feature/add-tests</code></ActivityTask>
                    <ActivityTask>Create a file called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">tests/auth.test.js</code> with any content inside it</ActivityTask>
                    <ActivityTask>Commit it with a meaningful message on the feature branch</ActivityTask>
                    <ActivityTask>Switch back to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code> and confirm <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">tests/auth.test.js</code> does not exist, which shows the branch is isolated</ActivityTask>
                    <ActivityTask>Merge <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">feature/add-tests</code> into <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code></ActivityTask>
                    <ActivityTask>Confirm the file now exists on <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code> and delete the feature branch</ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git log --oneline --graph</code> and look at the shape of the history</ActivityTask>
                </div>

                <ActivityHint label="confirming isolation">
                    After switching to main, run <code className="bg-muted px-1 rounded">ls tests/</code>. If the branch is truly isolated, that directory will either be empty or not contain your new file. This is the thing that surprises most people the first time.
                </ActivityHint>
            </ActivityChallenge>

            <ActivityChallenge
                number="2.3"
                title="Engineer a Merge Conflict"
                description="Don't just resolve a conflict. Deliberately create one, then fix it."
            >
                <LectureP>
                    Most people encounter merge conflicts by accident. Here you'll create one on purpose, which forces you to understand exactly why they happen.
                </LectureP>

                <div className="space-y-1">
                    <ActivityTask>On <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code>, write a line of text to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">README.md</code> and commit it</ActivityTask>
                    <ActivityTask>Create a new branch called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">fix/update-readme</code> and switch to it</ActivityTask>
                    <ActivityTask>On the new branch, change that same line in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">README.md</code> to something different, and commit it</ActivityTask>
                    <ActivityTask>Switch back to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code> and attempt to merge <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">fix/update-readme</code>. Git will refuse and show a conflict</ActivityTask>
                    <ActivityTask>Open <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">README.md</code> in a text editor, find the conflict markers, and resolve the conflict by keeping whichever version you prefer</ActivityTask>
                    <ActivityTask>Stage the resolved file and complete the merge with a commit</ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git log --oneline</code> and check that the merge commit is at the top</ActivityTask>
                </div>

                <ActivityHint label="writing to README.md from the terminal">
                    Use <code className="bg-muted px-1 rounded">{'echo "some text" > README.md'}</code> to overwrite the file with new content. Use <code className="bg-muted px-1 rounded">{'echo "more text" >> README.md'}</code> (double arrow) to append without overwriting. On the branch, change the same line that you wrote on main.
                </ActivityHint>
                <ActivityHint label="opening the file in an editor">
                    From the terminal: <code className="bg-muted px-1 rounded">nano README.md</code> or <code className="bg-muted px-1 rounded">vim README.md</code>. Week 1 Lecture 1 has a quick reference for both. You can also open the file in VS Code or Cursor from the file explorer.
                </ActivityHint>
                <ActivityHint label="what the conflict markers mean">
                    When Git shows a conflict, look for <code className="bg-muted px-1 rounded">{'<<<<<<< HEAD'}</code>. Everything between that and <code className="bg-muted px-1 rounded">=======</code> is your version (on main). Everything between <code className="bg-muted px-1 rounded">=======</code> and <code className="bg-muted px-1 rounded">{'>>>>>>> fix/update-readme'}</code> is the incoming version. Delete all three marker lines and keep whatever you want the file to actually say.
                </ActivityHint>
            </ActivityChallenge>

            <ActivityChallenge
                number="2.4"
                title="Travel Back in Time"
                description="Use Git's recovery tools to undo a mistake without losing the history."
            >
                <div className="space-y-1">
                    <ActivityTask>Make a commit that adds a file called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">mistake.txt</code>. Pretend you committed something you shouldn't have</ActivityTask>
                    <ActivityTask>Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git log --oneline</code> to find the hash of the commit that added <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">mistake.txt</code></ActivityTask>
                    <ActivityTask>Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git revert</code> with that hash to undo it. Do not use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git reset</code></ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git log --oneline</code> again. You should now have one more commit at the top, not one fewer</ActivityTask>
                    <ActivityTask>Confirm <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">mistake.txt</code> is gone from the working directory</ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git reflog</code> and find the commit that added the file. It's still there even though it's been reverted</ActivityTask>
                </div>

                <LectureCallout type="info">
                    The reason we use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git revert</code> instead of <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git reset</code> here is important. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">revert</code> adds a new commit that undoes the change, so the history is preserved. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">reset</code> rewrites history, which is dangerous on any branch that others might be using.
                </LectureCallout>

                <ActivityHint label="using git revert">
                    The syntax is <code className="bg-muted px-1 rounded">git revert {'<hash>'}</code> where the hash is the shortened commit ID from <code className="bg-muted px-1 rounded">git log --oneline</code>. Git will open a text editor for the revert commit message. Just save and close it (in vim: press <code className="bg-muted px-1 rounded">Esc</code>, then type <code className="bg-muted px-1 rounded">:wq</code> and hit Enter).
                </ActivityHint>
            </ActivityChallenge>

            {/* ── 03 THE FULL WORKFLOW ─────────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="The Full Workflow" />

            <LectureP>
                The final challenge combines Linux and Git into a single connected workflow, the same kind of thing you'd do when starting work on a real project for the first time.
            </LectureP>

            <ActivityChallenge
                number="3.1"
                title="Clone, Explore, Contribute"
                description="Treat a GitHub repository like a real codebase you've just been added to."
            >
                <LectureP>
                    Go to GitHub and create a new public repository called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">gauntlet-final</code> with a README. Then:
                </LectureP>

                <div className="space-y-1">
                    <ActivityTask>Clone the repository to your machine using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git clone</code></ActivityTask>
                    <ActivityTask>Navigate into it using only terminal commands and confirm your location with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pwd</code></ActivityTask>
                    <ActivityTask>Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ls -la</code> to see all files including hidden ones, and find the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.git</code> folder</ActivityTask>
                    <ActivityTask>Create a branch called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">feature/project-structure</code></ActivityTask>
                    <ActivityTask>Build the same directory structure from Challenge 1.1 inside this repo</ActivityTask>
                    <ActivityTask>Add a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.gitignore</code> that ignores <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code></ActivityTask>
                    <ActivityTask>Commit everything with a clear message and push the branch to GitHub</ActivityTask>
                    <ActivityTask>Go to GitHub in the browser and open a Pull Request from your branch to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code></ActivityTask>
                    <ActivityTask>Merge the PR on GitHub, then pull the changes back down to your local <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code></ActivityTask>
                </div>

                <ActivityHint label="pushing a branch for the first time">
                    When pushing a new branch that doesn't exist on the remote yet, use <code className="bg-muted px-1 rounded">git push origin feature/project-structure</code>. Git will create the remote branch automatically. After this, future pushes from this branch can just use <code className="bg-muted px-1 rounded">git push</code>.
                </ActivityHint>
                <ActivityHint label="pulling after merging on GitHub">
                    After merging the PR on GitHub, your local <code className="bg-muted px-1 rounded">main</code> doesn't know about it yet. Switch to main with <code className="bg-muted px-1 rounded">git checkout main</code>, then run <code className="bg-muted px-1 rounded">git pull</code> to sync.
                </ActivityHint>
            </ActivityChallenge>

            {/* ── 04 BONUS ────────────────────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Bonus Challenge" />

            <LectureP>
                Finished early? This one is open-ended and has no hints.
            </LectureP>

            <ActivityChallenge
                number="★"
                title="Squash Your History"
                description="Take a messy commit history and clean it up using interactive rebase."
            >
                <LectureP>
                    On a new branch, make at least 4 small commits with messages like "fix typo", "oops", "another fix", "finally works." Then use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git rebase -i HEAD~4</code> to squash all four into a single clean commit with a proper message. Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git log --oneline</code> to confirm your history is clean.
                </LectureP>
                <LectureP>
                    This is exactly what you'd do before opening a Pull Request on a professional team. Nobody wants to review 12 "fix" commits when one clean commit says the same thing.
                </LectureP>
            </ActivityChallenge>


            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
