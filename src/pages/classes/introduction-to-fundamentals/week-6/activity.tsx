import { Package } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureP,
} from '@/components/ui/lecture-typography';
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import { ActivityHint } from '@/components/ui/activity-hint';
import { ActivityChallenge } from '@/components/ui/activity-challenge';
import { ActivityTask, ActivityTaskListProvider } from '@/components/ui/activity-task';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week6Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={6}
                    session="Activity"
                    title="Containerize Your Backend Stub"
                    description="You have a provided Python stub with one working endpoint. Your job is to containerize it, persist data with a volume, and explore what base image choice actually costs you in megabytes. The Dockerfile you write today is the foundation you will build on in the coming weeks."
                    icon={<Package className="h-4 w-4" />}
                />

                <LectureCallout type="info">
                    The stub app goes in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/main.py</code> in your project repo. Your current file is a comment placeholder from the Week 4 project kickoff. You'll replace it with the Flask stub below.
                </LectureCallout>

                <LectureCallout type="warning">
                    This stub uses Flask because it's the simplest way to get a working endpoint with zero setup. In Week 7 you'll replace it with a full FastAPI backend. The Dockerfile structure stays the same, only the framework and the CMD change.
                </LectureCallout>

                {/* ── 01 WRITE THE DOCKERFILE ─────────────────────────────────────── */}
                <LectureSectionHeading number="01" title="Write the Dockerfile" />

                <LectureP>
                    The stub is a single-file Flask app with one GET <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/health</code> endpoint that returns <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{`{"status": "ok"}`}</code> and logs each request to a file called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">requests.log</code>.
                </LectureP>

                <CodeBlock
                    language="python"
                    title="backend/main.py · Flask stub"
                    lines={[
                        'from flask import Flask, jsonify',
                        'import datetime',
                        '',
                        'app = Flask(__name__)',
                        'LOG_FILE = "/data/requests.log"',
                        '',
                        '@app.get("/health")',
                        'def health():',
                        '    with open(LOG_FILE, "a") as f:',
                        '        f.write(f"{datetime.datetime.now()} - health check\\n")',
                        '    return jsonify({"status": "ok"})',
                        '',
                        'if __name__ == "__main__":',
                        '    app.run(host="0.0.0.0", port=8000)',
                    ]}
                />

                <ActivityChallenge
                    number="1.1"
                    title="Set Up the Stub"
                    description="Replace the placeholder file with the working Flask stub and create a requirements file."
                >
                    <div className="space-y-1">
                        <ActivityTask>Open <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/main.py</code> and replace the comment placeholder with the Flask stub code shown above</ActivityTask>
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/requirements.txt</code> with one line: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">flask</code></ActivityTask>
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/.dockerignore</code> with: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">__pycache__</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.venv</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">*.pyc</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.git</code></ActivityTask>
                    </div>

                    <TerminalBlock
                        title="bash · backend"
                        lines={[
                            { cmd: 'echo "flask" > requirements.txt' },
                            { cmd: 'printf "__pycache__\\n.venv\\n*.pyc\\n.git\\n" > .dockerignore' },
                        ]}
                    />
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.2"
                    title="Write the Dockerfile"
                    description="Containerize the Python stub with the right base image and configuration."
                >
                    <div className="space-y-1">
                        <ActivityTask>In your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/</code> folder, create a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Dockerfile</code></ActivityTask>
                        <ActivityTask>Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">python:3.11-slim</code> as the base image</ActivityTask>
                        <ActivityTask>Set <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/app</code> as the working directory</ActivityTask>
                        <ActivityTask>Copy <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">requirements.txt</code> first, then run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">RUN pip install --no-cache-dir -r requirements.txt</code></ActivityTask>
                        <ActivityTask>Copy the rest of the application code</ActivityTask>
                        <ActivityTask>Create the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/data</code> directory with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">RUN mkdir /data</code></ActivityTask>
                        <ActivityTask>Expose port 8000</ActivityTask>
                        <ActivityTask>Set the CMD to run the app: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">CMD ["python", "main.py"]</code></ActivityTask>
                    </div>

                    <ActivityHint label="Dockerfile structure">
                        Copy requirements.txt before copying the full app, which lets Docker cache the pip install layer. The skeleton: FROM → WORKDIR → COPY requirements.txt → RUN pip install → COPY . . → RUN mkdir → EXPOSE → CMD.
                    </ActivityHint>
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.3"
                    title="Build and Run"
                    description="Verify the container works end-to-end."
                >
                    <div className="space-y-1">
                        <ActivityTask>Build the image: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker build -t my-stub .</code></ActivityTask>
                        <ActivityTask>Run it: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker run -p 8000:8000 my-stub</code></ActivityTask>
                        <ActivityTask>In another terminal, hit the endpoint: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">curl http://localhost:8000/health</code></ActivityTask>
                        <ActivityTask>Verify you get <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{`{"status": "ok"}`}</code></ActivityTask>
                    </div>

                    <TerminalBlock
                        title="bash · backend"
                        lines={[
                            { cmd: 'docker build -t my-stub .' },
                            { cmd: 'docker run -p 8000:8000 my-stub' },
                        ]}
                    />

                    <TerminalBlock
                        title="bash · another terminal"
                        lines={[
                            { cmd: 'curl http://localhost:8000/health' },
                        ]}
                    />

                    <LectureCallout type="info">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-p 8000:8000</code> tells Docker to map your machine's port 8000 to the container's port 8000. Without this flag, the container runs but you can't reach it.
                    </LectureCallout>
                </ActivityChallenge>

                <LectureP>
                    Quick check before you move on. Type the exact command from memory, no peeking at the terminal blocks above.
                </LectureP>

                <InteractiveExercise
                    runtime="check"
                    language="bash"
                    title="Exercise 1: Build the Image"
                    prompt={<>Write the command that builds an image from the Dockerfile in the current directory and tags it <code>api:v1</code>.</>}
                    expected={[
                        "docker build -t api:v1 .",
                        "docker build . -t api:v1",
                        "docker build --tag api:v1 .",
                        "docker build . --tag api:v1",
                    ]}
                    hint="docker build takes a tag flag (-t) and a build context path. The current directory is just a dot."
                />

                {/* ── 02 PERSIST DATA WITH A VOLUME ───────────────────────────────── */}
                <LectureSectionHeading number="02" title="Persist Data with a Volume" />

                <LectureP>
                    The stub writes to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/data/requests.log</code> inside the container. Right now that log disappears when the container stops. Fix that with a volume.
                </LectureP>

                <ActivityChallenge
                    number="2.1"
                    title="Mount a Volume"
                    description="Bind mount a directory on your machine to the container's /data folder."
                >
                    <div className="space-y-1">
                        <ActivityTask>Stop and remove your running container</ActivityTask>
                        <ActivityTask>Re-run with a bind mount: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker run -p 8000:8000 -v $(pwd)/data:/data my-stub</code></ActivityTask>
                        <ActivityTask>Hit the health endpoint 3 times</ActivityTask>
                        <ActivityTask>Stop the container</ActivityTask>
                        <ActivityTask>Verify that <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">data/requests.log</code> exists on your machine and contains 3 entries</ActivityTask>
                    </div>

                    <TerminalBlock
                        title="bash · backend"
                        lines={[
                            { cmd: 'docker run -p 8000:8000 -v $(pwd)/data:/data my-stub' },
                        ]}
                    />

                    <TerminalBlock
                        title="bash · another terminal"
                        lines={[
                            { cmd: 'curl http://localhost:8000/health' },
                            { cmd: 'curl http://localhost:8000/health' },
                            { cmd: 'curl http://localhost:8000/health' },
                            { cmd: 'cat data/requests.log' },
                        ]}
                    />

                    <LectureCallout type="info">
                        A bind mount syncs a folder on your machine with a folder inside the container. Both see the same files in real-time.
                    </LectureCallout>
                </ActivityChallenge>

                <InteractiveExercise
                    runtime="check"
                    language="bash"
                    title="Exercise 2: Run with a Port and a Volume"
                    prompt={<>From memory: write the command that runs the <code>my-stub</code> image, maps host port 8000 to container port 8000, and bind mounts <code>$(pwd)/data</code> on your machine to <code>/data</code> in the container.</>}
                    expectedPattern={"^docker\\s+run\\s+(?=.*-p\\s+8000:8000)(?=.*-v\\s+\\$\\(pwd\\)/data:/data)\\S.*\\bmy-stub$"}
                    hint="Combine the -p host:container flag and the -v host_path:container_path flag, then end with the image name."
                />

                <ActivityChallenge
                    number="2.2"
                    title="Prove It Survives a Restart"
                    description="Stop the container, start it again, and verify the log file persists."
                >
                    <div className="space-y-1">
                        <ActivityTask>Stop the container</ActivityTask>
                        <ActivityTask>Start it again with the same volume flag</ActivityTask>
                        <ActivityTask>Hit the endpoint 2 more times</ActivityTask>
                        <ActivityTask>Cat the log file again; it should now have 5 entries, not 2</ActivityTask>
                    </div>

                    <ActivityHint label="if your count resets">
                        Make sure you are using the same <code className="bg-muted px-1 rounded">$(pwd)/data</code> path each time. If you run from a different directory the volume will mount a different folder.
                    </ActivityHint>
                </ActivityChallenge>

                {/* ── 03 COMPARE BASE IMAGES ──────────────────────────────────────── */}
                <LectureSectionHeading number="03" title="Compare Base Images" />

                <LectureP>
                    The image size you ship affects pull times, cold start times, and storage costs. The base image is the biggest lever.
                </LectureP>

                <ActivityChallenge
                    number="3.1"
                    title="Build with Alpine"
                    description="Compare Python slim vs. Alpine Linux."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create a second Dockerfile named <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Dockerfile.alpine</code></ActivityTask>
                        <ActivityTask>Change only the FROM line to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">python:3.11-alpine</code></ActivityTask>
                        <ActivityTask>Build it: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker build -f Dockerfile.alpine -t my-stub-alpine .</code></ActivityTask>
                        <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker images</code> and compare the sizes of <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">my-stub</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">my-stub-alpine</code></ActivityTask>
                    </div>

                    <LectureCallout type="info">
                        Alpine Linux is built for containers: it strips out everything unnecessary and keeps the OS as tiny as possible. The trade-off is that some Python packages that rely on C extensions need extra build dependencies to compile on Alpine.
                    </LectureCallout>
                </ActivityChallenge>

                <ActivityChallenge
                    number="3.2"
                    title="Document Your Findings"
                    description="Record the size difference and explain why it matters."
                >
                    <div className="space-y-1">
                        <ActivityTask>In your repo, create a file called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">DOCKER.md</code></ActivityTask>
                        <ActivityTask>Write the size of each image</ActivityTask>
                        <ActivityTask>Write one sentence explaining why they differ</ActivityTask>
                        <ActivityTask>Commit: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git add . && git commit -m "docs: add Docker findings"</code></ActivityTask>
                        <ActivityTask>Push and open a PR that closes your Issue #1 from the project board</ActivityTask>
                        <ActivityTask>Move Issue #1 to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Done</code> on your GitHub Project board</ActivityTask>
                    </div>
                </ActivityChallenge>

            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
