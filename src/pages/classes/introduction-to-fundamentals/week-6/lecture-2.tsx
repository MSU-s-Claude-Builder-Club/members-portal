import { Package } from 'lucide-react';
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
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

// ── VM vs Container diagram ───────────────────────────────────────────────────
const VmVsContainerDiagram = () => (
    <div className="my-8 rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Virtual Machine</p>
                {[
                    { label: 'App A', bg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' },
                    { label: 'Guest OS', bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs' },
                    { label: 'App B', bg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' },
                    { label: 'Guest OS', bg: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-xs' },
                    { label: 'Hypervisor', bg: 'bg-muted text-muted-foreground' },
                    { label: 'Host OS', bg: 'bg-muted text-muted-foreground' },
                    { label: 'Hardware', bg: 'bg-zinc-200 dark:bg-zinc-800 text-foreground' },
                ].map((layer, i) => (
                    <div key={i} className={`text-center text-xs font-medium py-1.5 px-2 rounded mb-1 ${layer.bg}`}>
                        {layer.label}
                </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">Each VM runs a full OS. Heavy. Slow to start. GBs per VM.</p>
            </div>
            <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Container</p>
                {[
                    { label: 'App A', bg: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300' },
                    { label: 'App B', bg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
                    { label: 'Docker Engine', bg: 'bg-muted text-muted-foreground' },
                    { label: 'Host OS', bg: 'bg-muted text-muted-foreground' },
                    { label: 'Hardware', bg: 'bg-zinc-200 dark:bg-zinc-800 text-foreground' },
                ].map((layer, i) => (
                    <div key={i} className={`text-center text-xs font-medium py-1.5 px-2 rounded mb-1 ${layer.bg}`}>
                        {layer.label}
                </div>
            ))}
                <p className="text-xs text-muted-foreground mt-2">Containers share the host OS kernel. Lightweight. Start in milliseconds. MBs per container.</p>
            </div>
        </div>
    </div>
);

export default function Week6Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={6}
                session="Lecture 2"
                title="Docker & Containerization"
                description="'It works on my machine' ends here. Docker packages your app and everything it needs into a single portable unit that runs identically everywhere."
                icon={<Package className="h-4 w-4" />}
            />

            <LectureCallout type="warning">
                This lecture requires Docker. If you haven't installed it yet, follow the instructions at the end of Lecture 1. On macOS run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">brew install --cask docker</code> and open Docker Desktop. Verify with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker --version</code> before continuing.
            </LectureCallout>

            {/* ── 01 THE PROBLEM ──────────────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="The Problem Docker Solves" />

            <LectureP>
                Imagine you build a web app on your MacBook. It uses Node.js 20, a specific version of a library, and a config file that lives at a certain path. You deploy it to a Ubuntu server running Node.js 18. The library version is slightly different. The config path doesn't exist. It crashes.
            </LectureP>
            <LectureP>
                This is the environment problem. Software doesn't run in isolation. It depends on the OS, the runtime version, installed libraries, environment variables, and dozens of other things. Getting all of those to match between development, staging, and production is hard. Doing it reliably across a team is even harder.
            </LectureP>
            <LectureP>
                Docker solves this by bundling your application together with its entire environment into a <LectureTip tip="A runnable instance of a Docker image. Isolated from the host and other containers; shares the host kernel. Start with docker run.">container</LectureTip>. The container includes the OS libraries, the runtime, the dependencies, the config: everything. You ship the container, and it runs identically on any machine that has Docker installed.
            </LectureP>

            {/* ── 02 CONTAINERS VS VMs ────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Containers vs. Virtual Machines" />

            <LectureP>
                Before Docker, the standard solution to the environment problem was <LectureTip tip="Software that emulates a full computer and runs a complete guest OS. Heavier than containers; each VM has its own kernel and boot process.">virtual machines</LectureTip>. A VM emulates an entire computer, including a full operating system, on top of your physical hardware. This works, but it's expensive: each VM needs gigabytes of disk space and takes minutes to start.
            </LectureP>
            <LectureP>
                Containers take a different approach. Instead of emulating hardware and running a full OS, containers share the host machine's OS kernel and isolate only the application and its dependencies. They're faster to start (milliseconds instead of minutes), use far less memory, and you can run dozens on a single machine where you might only run 3 or 4 VMs.
            </LectureP>

            <VmVsContainerDiagram />

            <LectureCallout type="info">
                Containers aren't completely isolated the way VMs are, because they share the host kernel. This means a Linux container can't run natively on a Mac or Windows machine without a Linux VM underneath. Docker Desktop handles this transparently by running a lightweight Linux VM in the background.
            </LectureCallout>

            {/* ── 03 IMAGES AND CONTAINERS ────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Images and Containers" />

            <LectureP>
                Two terms you need to keep straight:
            </LectureP>
            <LectureP>
                A <LectureTip tip="A read-only template built from a Dockerfile. Contains the filesystem and metadata needed to run an app. You build images, then run containers from them.">Docker image</LectureTip> is a read-only template: a snapshot of a filesystem with all the software and files needed to run an application. It's like a class definition or a blueprint. It doesn't run. It just describes what a running container should look like. Images are built from a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Dockerfile</code> and stored in a registry like Docker Hub.
            </LectureP>
            <LectureP>
                A <LectureTerm>container</LectureTerm> is a running instance of an image. You can run many containers from the same image simultaneously, each isolated from the others. It's like instantiating multiple objects from a class.
            </LectureP>

            <LectureCallout type="tip">
                Image : Container = Class : Object. The image is the blueprint; the container is the running instance. You build images once. You run them many times.
            </LectureCallout>

            {/* ── 04 CORE COMMANDS ────────────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Core Docker Commands" />

            <LectureP>
                Docker has a large CLI surface but you'll use a small subset of it for 90% of your work. Here's the essential set:
            </LectureP>

            <LectureSubHeading title="Working with images" />
            <TerminalBlock
                lines={[
                    { comment: 'pull an image from Docker Hub without running it', cmd: 'docker pull node:20-alpine' },
                    { comment: 'list all images stored locally', cmd: 'docker images' },
                    { comment: 'remove an image', cmd: 'docker rmi node:20-alpine' },
                    { comment: 'build an image from a Dockerfile in the current directory', cmd: 'docker build -t my-app:latest .' },
                    { comment: 'build and tag with a specific version', cmd: 'docker build -t my-app:1.0.0 .' },
                ]}
            />

            <LectureP>
                The <LectureTip code tip="-t flag for docker build: tag. Assigns a name and optional version tag to the built image. Format is name:tag. Without a tag, Docker defaults to 'latest'.">-t</LectureTip> flag in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker build</code> assigns a name and tag to the image. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.</code> at the end tells Docker where to find the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Dockerfile</code>: the current directory. The tag format is <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">name:version</code>. If you omit the version, Docker uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">latest</code>.
            </LectureP>

            <LectureSubHeading title="Running containers" />
            <TerminalBlock
                lines={[
                    { comment: 'run a container from an image', cmd: 'docker run node:20-alpine' },
                    { comment: 'run in detached mode (background) with a name', cmd: 'docker run -d --name my-app node:20-alpine' },
                    { comment: 'map host port 3000 to container port 3000', cmd: 'docker run -d -p 3000:3000 my-app:latest' },
                    { comment: 'mount a local directory into the container', cmd: 'docker run -v $(pwd):/app my-app:latest' },
                    { comment: 'pass environment variables into the container', cmd: 'docker run -e DATABASE_URL=postgres://... my-app:latest' },
                    { comment: 'run interactively with a bash shell', cmd: 'docker run -it node:20-alpine /bin/sh' },
                ]}
            />

            <LectureP>
                The <LectureTip code tip="-p flag for docker run: publish ports. Format is host_port:container_port. Without this, the container's ports are completely isolated and unreachable from your machine — even if your app listens on port 3000 inside the container.">-p</LectureTip> flag is critical to understand. Containers are isolated by default, so their ports are invisible to the outside world. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-p 3000:3000</code> punches a hole: requests to your machine's port 3000 get forwarded to the container's port 3000. Without this, your app runs but you can't reach it.
            </LectureP>
            <LectureP>
                The <LectureTip code tip="-d flag for docker run: detached mode. Runs the container in the background and returns your terminal. Without -d, the container runs in the foreground and you can't use your terminal until it stops.">-d</LectureTip> flag runs the container in the background so your terminal isn't held hostage. The <LectureTip code tip="-v flag for docker run: volume mount. Maps a directory from your host machine into the container. Changes to files in that directory are immediately visible inside the container — essential for development workflows.">-v</LectureTip> flag mounts a local directory into the container, which is essential for development because it means the container sees your local code changes in real time.
            </LectureP>

            <LectureSubHeading title="Managing running containers" />
            <TerminalBlock
                lines={[
                    { comment: 'list all running containers', cmd: 'docker ps' },
                    { comment: 'list all containers including stopped ones', cmd: 'docker ps -a' },
                    { comment: 'stop a running container gracefully', cmd: 'docker stop my-app' },
                    { comment: 'kill a container immediately', cmd: 'docker kill my-app' },
                    { comment: 'remove a stopped container', cmd: 'docker rm my-app' },
                    { comment: 'view the logs of a container', cmd: 'docker logs my-app' },
                    { comment: 'follow logs in real time (like tail -f)', cmd: 'docker logs -f my-app' },
                    { comment: 'open a shell inside a running container', cmd: 'docker exec -it my-app /bin/sh' },
                ]}
            />

            <LectureP>
                <LectureTip code tip="docker exec -it: execute a command inside a running container. -i keeps stdin open, -t allocates a pseudo-TTY (terminal). Together they give you an interactive shell. Use /bin/bash if bash is available, /bin/sh otherwise.">docker exec -it</LectureTip> is your debugging lifeline. When a container is misbehaving, you open a shell inside it and poke around exactly as you would on a regular Linux machine: check files, run commands, inspect environment variables.
            </LectureP>

            <LectureSubHeading title="Check yourself" />
            <LectureP>
                Before moving on, make sure the core commands are in muscle memory. Type each answer exactly as you would in a terminal.
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 1"
                prompt={<>Write the command that lists <strong>all</strong> containers, including the ones that have stopped.</>}
                expected={["docker ps -a", "docker ps --all", "docker container ls -a", "docker container ls --all", "docker container ps -a"]}
                hint="docker ps only shows running containers. Add the flag that means 'all'."
            />

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 2"
                prompt={<>Run the image <code>my-app:latest</code> in detached mode, mapping port <code>8080</code> on your machine to port <code>3000</code> inside the container.</>}
                expectedPattern="^docker\s+run\s+(-d\s+-p\s+8080:3000|-p\s+8080:3000\s+-d)\s+my-app:latest$"
                normalize="trim"
                hint="You need -d for detached mode and -p host_port:container_port. The image name goes last."
            />

            {/* ── 05 THE DOCKERFILE ───────────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="The Dockerfile" />

            <LectureP>
                A <LectureTerm>Dockerfile</LectureTerm> is a text file containing instructions for building a Docker image. Each instruction adds a <LectureTerm>layer</LectureTerm> to the image. Docker builds the image by executing the instructions in order from top to bottom.
            </LectureP>
            <LectureP>
                Here is a Dockerfile for a simple Node.js application, annotated line by line:
            </LectureP>

            <CodeBlock
                language="docker"
                title="Dockerfile"
                lines={[
                    '# Start from the official Node.js 20 image (Alpine = minimal Linux, ~5MB)',
                    'FROM node:20-alpine',
                    '# Set the working directory inside the container',
                    'WORKDIR /app',
                    '# Copy package files first (for layer caching, explained below)',
                    'COPY package*.json ./',
                    '# Install dependencies',
                    'RUN npm ci --only=production',
                    '# Copy the rest of the application code',
                    'COPY . .',
                    '# Tell Docker this container listens on port 3000',
                    'EXPOSE 3000',
                    '# The command that runs when the container starts',
                    'CMD ["node", "server.js"]',
                ]}
            />

            <LectureSubHeading title="Dockerfile instructions" />
            <LectureP>
                Each Dockerfile instruction creates a new layer. Understanding what each one does:
            </LectureP>

            <div className="my-6 rounded-xl border border-border overflow-hidden">
                {[
                    { instruction: 'FROM', desc: 'Sets the base image. Every Dockerfile starts here. Uses an image from Docker Hub (e.g. node:20-alpine, python:3.12, ubuntu:22.04).' },
                    { instruction: 'WORKDIR', desc: 'Sets the working directory for subsequent instructions. Creates the directory if it doesn\'t exist. Like running cd inside the container.' },
                    { instruction: 'COPY', desc: 'Copies files from your host machine into the image. Format: COPY source destination. The source is relative to the build context (usually your project folder).' },
                    { instruction: 'RUN', desc: 'Executes a shell command during the build. Use this to install packages, compile code, or set up config. Each RUN creates a new layer.' },
                    { instruction: 'ENV', desc: 'Sets environment variables that will be available inside the container at runtime.' },
                    { instruction: 'EXPOSE', desc: 'Documents which port the container listens on. Informational only; you still need -p when running the container.' },
                    { instruction: 'CMD', desc: 'The default command to run when the container starts. Only the last CMD in a Dockerfile takes effect. Can be overridden at runtime.' },
                    { instruction: 'ENTRYPOINT', desc: 'Like CMD, but harder to override. Used when the container is meant to behave as a single executable.' },
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                        <code className="text-xs font-bold text-blue-600 dark:text-blue-400 w-24 shrink-0 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                            {item.instruction}
                        </code>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* ── 06 IMAGE LAYERS AND CACHING ─────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Image Layers and Caching" />

            <LectureP>
                Every instruction in a Dockerfile creates an immutable <LectureTerm>layer</LectureTerm>. Docker caches each layer and reuses it on subsequent builds if neither that instruction nor anything before it has changed. This makes rebuilds fast: if your dependencies haven't changed, Docker skips the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm install</code> step entirely.
            </LectureP>
            <LectureP>
                This is why the Dockerfile above copies <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">package*.json</code> before copying the rest of the code. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">package.json</code> changes rarely. Your application code changes constantly. By copying them separately, Docker can cache the expensive <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm install</code> layer and only re-run it when dependencies actually change.
            </LectureP>

            <LectureCallout type="tip">
                Layer ordering is one of the most important Dockerfile optimization techniques. Rule of thumb: put instructions that change rarely near the top, instructions that change often near the bottom. Cache-busting an early layer invalidates every layer after it.
            </LectureCallout>

            <LectureSubHeading title="The .dockerignore file" />
            <LectureP>
                Just like <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.gitignore</code>, a <LectureTerm>.dockerignore</LectureTerm> file tells Docker which files to exclude from the build context, meaning the files sent to the Docker engine when you run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker build</code>. Always exclude <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">node_modules</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.git</code>, and any secrets.
            </LectureP>

            <CodeBlock
                language="bash"
                title=".dockerignore"
                lines={[
                    '# Never copy these into the image',
                    'node_modules',
                    '.git',
                    '.env',
                    '*.log',
                    'dist',
                    'build',
                ]}
            />

            {/* ── 07 DOCKER COMPOSE ───────────────────────────────────────────── */}
            <LectureSectionHeading number="07" title="Docker Compose" />

            <LectureP>
                Real applications rarely consist of a single container. A typical web app might need: a Node.js server, a PostgreSQL database, and a Redis cache. Running these separately with individual <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker run</code> commands and manually configuring how they talk to each other is painful. <LectureTerm>Docker Compose</LectureTerm> solves this.
            </LectureP>
            <LectureP>
                Compose lets you define a multi-container application in a single <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker-compose.yml</code> file and start everything with one command.
            </LectureP>

            <CodeBlock
                language="yaml"
                title="docker-compose.yml"
                lines={[
                    'services:',
                    '  app:',
                    '    build: .',
                    '    ports:',
                    '      - "3000:3000"',
                    '    environment:',
                    '      - DATABASE_URL=postgres://user:pass@db:5432/mydb',
                    '    depends_on:',
                    '      - db',
                    '',
                    '  db:',
                    '    image: postgres:16-alpine',
                    '    environment:',
                    '      - POSTGRES_USER=user',
                    '      - POSTGRES_PASSWORD=pass',
                    '      - POSTGRES_DB=mydb',
                    '    volumes:',
                    '      - postgres_data:/var/lib/postgresql/data',
                    '',
                    'volumes:',
                    '  postgres_data:',
                ]}
            />

            <TerminalBlock
                lines={[
                    { comment: 'start all services defined in docker-compose.yml', cmd: 'docker compose up' },
                    { comment: 'start in detached mode (background)', cmd: 'docker compose up -d' },
                    { comment: 'rebuild images before starting (use after changing Dockerfile)', cmd: 'docker compose up --build' },
                    { comment: 'stop all services', cmd: 'docker compose down' },
                    { comment: 'stop and remove volumes (deletes database data)', cmd: 'docker compose down -v' },
                    { comment: 'view logs from all services', cmd: 'docker compose logs -f' },
                    { comment: 'view logs from one specific service', cmd: 'docker compose logs -f app' },
                    { comment: 'run a one-off command in a service container', cmd: 'docker compose exec app /bin/sh' },
                ]}
            />

            <LectureP>
                The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">depends_on</code> key in the compose file tells Docker to start the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">db</code> service before the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">app</code> service. Services on the same Compose network can reach each other by their service name, so the app connects to the database at <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">db:5432</code> rather than <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">localhost:5432</code>.
            </LectureP>

            <LectureCallout type="warning">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker compose down -v</code> deletes your named volumes — including any database data stored in them. This is intentional for wiping a dev environment clean, but catastrophic if you run it accidentally on a database you care about.
            </LectureCallout>

            {/* ── 08 PUTTING IT TOGETHER ──────────────────────────────────────── */}
            <LectureSectionHeading number="08" title="Containerizing Your First App" />

            <LectureP>
                Let's walk through containerizing a minimal Node.js server from scratch. This is the exact process you'll follow for the activity.
            </LectureP>

            <TerminalBlock
                title="bash · ~/my-app"
                lines={[
                    { comment: 'create the project', cmd: 'mkdir my-app && cd my-app && npm init -y' },
                    { comment: 'install express', cmd: 'npm install express' },
                    { comment: 'create the server file', cmd: 'touch server.js' },
                    { comment: 'create the Dockerfile', cmd: 'touch Dockerfile' },
                    { comment: 'create the .dockerignore', cmd: 'touch .dockerignore' },
                    { comment: 'build the image', cmd: 'docker build -t my-app:latest .' },
                    { comment: 'run the container, mapping port 3000', cmd: 'docker run -d -p 3000:3000 --name my-app my-app:latest' },
                    { comment: 'check it is running', cmd: 'docker ps' },
                    { comment: 'test it responds', cmd: 'curl http://localhost:3000' },
                    { comment: 'view the logs', cmd: 'docker logs my-app' },
                    { comment: 'stop and remove the container', cmd: 'docker stop my-app && docker rm my-app' },
                ]}
            />

            <LectureCallout type="tip">
                The complete flow to remember: write <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Dockerfile</code> → <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker build</code> → <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker run</code>. Every time you change your app, rebuild the image and rerun the container. In production, this process is automated by a CI/CD pipeline.
            </LectureCallout>


        </LectureLayout>
    );
}
