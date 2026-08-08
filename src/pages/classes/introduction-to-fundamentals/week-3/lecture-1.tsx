import { Cpu } from 'lucide-react';
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
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week3Lecture1() {
    return (
        <LectureLayout>
            <LectureHeader
                week={3}
                session="Lecture 1"
                title="Classes, Encapsulation & Inheritance"
                description="C++ OOP from the ground up: classes, access modifiers, constructors, inheritance chains, and the virtual keyword that makes polymorphism possible."
                icon={<Cpu className="h-4 w-4" />}
            />

            {/* ── 01 C++ ESSENTIALS ────────────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="C++ Essentials" />

            <LectureP>
                C++ is a <LectureTip tip="Types are declared at compile time; the compiler checks them before the program runs. Catches type errors early instead of at runtime like Python.">statically typed</LectureTip>, compiled language. Unlike Python, where you run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">python script.py</code> and the interpreter figures out types at runtime, C++ requires you to declare types up front and compile your code into a binary before running it. This gives you direct control over memory and performance, which is why operating systems, game engines, databases, and embedded systems are written in C++.
            </LectureP>

            <LectureSubHeading title="Types" />

            <LectureP>
                Every variable must have a type declared at creation. The core types: <LectureTip code tip="Whole numbers: -2, 0, 42. 32-bit signed integer on most systems. Range: roughly ±2 billion.">int</LectureTip>, <LectureTip code tip="Floating-point decimals: 3.14, -0.5. 64-bit, ~15 digits of precision. Use for money? No; use integers of cents.">double</LectureTip>, <LectureTip code tip="true or false. 1 byte. Used in conditions, flags, and return values. In C++, 0 is false, anything else is true.">bool</LectureTip>, <LectureTip code tip="A single character: 'A', '7', '\\n'. 1 byte. Use single quotes. A string is a sequence of chars.">char</LectureTip>, and <LectureTip code tip="Text type from the standard library. Dynamically sized, heap-allocated. Use double quotes. Unlike C strings (char*), std::string manages its own memory.">string</LectureTip> (from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">&lt;string&gt;</code>). Once declared, a variable's type cannot change: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">int x = 5;</code> cannot later become a string. Use <LectureTip code tip="Let the compiler infer the type from the right-hand side. auto x = 5; is int. auto s = string('hi'); is string. Useful with complex types like iterators.">auto</LectureTip> to let the compiler infer the type when it is obvious from context.
            </LectureP>

            <LectureSubHeading title="Includes, main, and namespaces" />

            <LectureP>
                C++ uses <LectureTip code tip="Preprocessor directive that copies the contents of a header file into your source. Like Python's import, but it literally pastes the header's text into your file before compilation.">#include</LectureTip> to import library headers. <LectureTip code tip="Input/Output stream library. Provides cout (output), cin (input), cerr (error output), and endl (newline + flush).">&lt;iostream&gt;</LectureTip> gives you <LectureTip code tip="Character output stream. Use << to insert values: cout << 'Hello' << endl; Chains left to right.">cout</LectureTip> and <LectureTip code tip="Character input stream. Use >> to extract values: cin >> x; Reads one whitespace-delimited token. Stops at spaces.">cin</LectureTip>. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">&lt;string&gt;</code> gives you the string type. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">&lt;vector&gt;</code> gives you dynamic arrays. Every C++ program starts at <LectureTip code tip="The entry point. The OS calls this function when your program launches. Returns int; 0 means success, non-zero means error.">int main()</LectureTip> and conventionally ends with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">return 0;</code> to indicate success.
            </LectureP>
            <LectureP>
                Standard library names live in the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">std</code> namespace. Without <LectureTip code tip="Imports all names from the std namespace into global scope so you can write cout instead of std::cout. Convenient for learning; avoid in headers or large projects to prevent name collisions.">using namespace std;</LectureTip>, you would have to write <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">std::cout</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">std::string</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">std::vector</code> everywhere. In production code, explicit <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">std::</code> is preferred to avoid name collisions, but for learning and in single-file programs, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">using namespace std;</code> is fine. All examples in this course use it.
            </LectureP>

            <CodeBlock language="cpp"
                title="hello.cpp · your first complete C++ program"
                lines={[
                    '#include <iostream>',
                    '#include <string>',
                    'using namespace std;',
                    '',
                    'int main() {',
                    '    string name = "world";',
                    '    int year = 2026;',
                    '    double pi = 3.14159;',
                    '    bool enrolled = true;',
                    '',
                    '    cout << "Hello, " << name << "!" << endl;',
                    '    cout << "Year: " << year << endl;',
                    '    cout << "Pi: " << pi << endl;',
                    '    cout << "Enrolled: " << (enrolled ? "yes" : "no") << endl;',
                    '',
                    '    return 0;',
                    '}',
                ]}
            />

            <LectureSubHeading title="Input with cin" />

            <LectureP>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">cout &lt;&lt;</code> writes to the terminal. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">cin &gt;&gt;</code> reads from the terminal; it reads one whitespace-delimited token at a time. For full lines (including spaces), use <LectureTip code tip="Reads an entire line of input including spaces. Takes the stream and a string variable: getline(cin, name). Use instead of cin >> when input has spaces.">getline(cin, variable)</LectureTip>. A common pitfall: after <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">cin &gt;&gt;</code>, a newline remains in the buffer, so call <LectureTip code tip="Discards the next character in the input buffer. Call after cin >> and before getline() to prevent the leftover newline from being consumed as an empty line.">cin.ignore()</LectureTip> before <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">getline()</code> to discard it.
            </LectureP>

            <CodeBlock language="cpp"
                title="input.cpp · reading user input"
                lines={[
                    '#include <iostream>',
                    '#include <string>',
                    'using namespace std;',
                    '',
                    'int main() {',
                    '    cout << "Enter your age: ";',
                    '    int age;',
                    '    cin >> age;',
                    '    cin.ignore();  // discard leftover newline',
                    '',
                    '    cout << "Enter your full name: ";',
                    '    string name;',
                    '    getline(cin, name);  // reads the whole line, spaces included',
                    '',
                    '    cout << name << " is " << age << " years old." << endl;',
                    '    return 0;',
                    '}',
                ]}
            />

            <LectureSubHeading title="Compilation" />

            <LectureP>
                Unlike Python, C++ code must be compiled before it can run. The compiler (<LectureTip code tip="GNU C++ compiler. Translates .cpp source files into executable binaries. Part of the GCC (GNU Compiler Collection). On macOS, g++ is actually clang++ by default.">g++</LectureTip>) translates your source code into machine code. Compile and run with:
            </LectureP>

            <CodeBlock language="bash"
                title="compile and run"
                lines={[
                    'g++ -std=c++17 -Wall hello.cpp -o hello',
                    './hello',
                ]}
            />

            <LectureP>
                <LectureTip code tip="Sets the C++ standard version. c++17 gives you structured bindings, if-init, optional, filesystem, and more. Always specify a standard.">-std=c++17</LectureTip> enables modern C++ features. <LectureTip code tip="Warns All: enables all common compiler warnings. Treat every warning as a bug. Also consider -Wextra and -Werror (treats warnings as errors).">-Wall</LectureTip> turns on all warnings; treat every warning as a bug. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">-o hello</code> names the output binary. If compilation fails, the compiler will tell you the exact line and the problem. Read the first error message and fix it before worrying about the rest.
            </LectureP>

            <LectureP>
                Before moving on, make sure the compile command is in your fingers. Try it from memory:
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 1"
                prompt={<>Write the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">g++</code> command that compiles <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">hello.cpp</code> into a binary named <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">hello</code>, using the C++17 standard with all warnings enabled.</>}
                expected={[
                    'g++ -std=c++17 -Wall hello.cpp -o hello',
                    'g++ -Wall -std=c++17 hello.cpp -o hello',
                    'g++ -std=c++17 -Wall -o hello hello.cpp',
                    'g++ -Wall -std=c++17 -o hello hello.cpp',
                    'g++ -o hello -std=c++17 -Wall hello.cpp',
                    'g++ -o hello -Wall -std=c++17 hello.cpp',
                ]}
                hint="The shape is: g++ -std=c++17 -Wall <source file> -o <output name>."
            />

            <LectureSubHeading title="Key syntax differences from Python" />

            <LectureP>
                <strong className="text-foreground">Braces</strong> <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'{}'}</code> delimit blocks instead of indentation (though you should still indent for readability). <strong className="text-foreground">Semicolons</strong> end every statement. <strong className="text-foreground">Types are explicit</strong>: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">int x = 5;</code> not <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">x = 5</code>. <strong className="text-foreground">Logical operators</strong> are <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">&&</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">||</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">!</code> instead of <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">and</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">or</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">not</code>. <strong className="text-foreground">Comments</strong> use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">//</code> for single-line and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/* */</code> for multi-line.
            </LectureP>

            <LectureCallout type="info">
                From this point forward, most code examples omit <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">#include</code> directives and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">int main()</code> for brevity. To compile any example, wrap it in the template from this section: add your includes at the top, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">using namespace std;</code>, and place the code inside <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">int main() {'{ ... return 0; }'}</code>.
            </LectureCallout>

            {/* ── 02 WHY C++ FOR OOP ──────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Why C++ for OOP?" />

            <LectureP>
                You have been writing Python and TypeScript. C++ gives you direct control over memory and a type system that makes object boundaries explicit. For systems code and technical interviews, C++ OOP (classes, access modifiers, constructors, inheritance) is the reference model. What you learn here maps to every language: Python's <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">self</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">super()</code>, TypeScript's <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">extends</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">implements</code>, and Java/C# classes all follow the same ideas. C++ makes the machinery visible so you see exactly when constructors run, when <LectureTerm>virtual dispatch</LectureTerm> happens, and what "pass by reference" means.
            </LectureP>
            <LectureP>
                This lecture focuses on <strong className="text-foreground">classes, encapsulation, and inheritance</strong>. Next lecture covers polymorphism, abstract base classes, the STL, and system design principles.
            </LectureP>

            <LectureCallout type="info">
                <LectureTerm>Encapsulation</LectureTerm> means hiding internal state and exposing only a clear interface. It prevents callers from putting your object into an invalid state and lets you change implementation details without breaking the rest of the codebase.
            </LectureCallout>

            {/* ── 03 THE FOUR OOP PRINCIPLES ──────────────────────────────────── */}
            <LectureSectionHeading number="03" title="The Four OOP Principles" />

            <LectureP>
                Object-Oriented Programming organizes software around objects: data bundled with the functions that operate on it. Four principles underpin OOP: <LectureTip tip="Bundle data and methods together. Hide internal state and expose only what users of the class need. Prevents invalid states.">encapsulation</LectureTip>, <LectureTip tip="A derived class gets the data and methods of its base class and can extend or override them. Models 'is-a' relationships.">inheritance</LectureTip>, <LectureTip tip="Same interface, different behavior. Call getType() on any LibraryItem; each derived class responds differently via virtual dispatch.">polymorphism</LectureTip>, and <LectureTip tip="Expose what a class does, hide how it does it. Users of std::vector don't need to know about memory reallocation.">abstraction</LectureTip>. We focus on encapsulation and inheritance in this lecture.
            </LectureP>

            <div className="my-6 space-y-4">
                {[
                    { principle: 'Encapsulation', color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950/20', def: 'Bundle data and methods together. Hide internal state and expose only what users of the class need.', why: 'Prevents external code from putting an object into an invalid state.' },
                    { principle: 'Inheritance', color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/20', def: 'A derived class gets the data and methods of its base class and can extend or override them.', why: 'Eliminates duplication for related types (e.g. Dog and Cat extending Animal).' },
                    { principle: 'Polymorphism', color: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', bg: 'bg-orange-100 dark:bg-orange-950/20', def: 'The same interface works for different types. Call speak() on any Animal; each responds differently.', why: 'Next lecture: virtual methods and abstract base classes.' },
                    { principle: 'Abstraction', color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-950/20', def: 'Expose what a class does, hide how. Users of std::vector don\'t need to know about resizing.', why: 'Reduces cognitive load; good APIs are abstract.' },
                ].map((item) => (
                    <div key={item.principle} className={`rounded-xl border ${item.border} overflow-hidden`}>
                        <div className={`px-4 py-2.5 ${item.bg}`}>
                            <p className={`text-xs font-black uppercase tracking-widest ${item.color}`}>{item.principle}</p>
                            <p className="text-xs text-foreground mt-1">{item.def}</p>
                        </div>
                        <div className="px-4 py-2.5">
                            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Why:</span> {item.why}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 04 ACCESS MODIFIERS: PUBLIC, PRIVATE, PROTECTED ────────────── */}
            <LectureSectionHeading number="04" title="Access Modifiers: Public, Private, Protected" />

            <LectureP>
                C++ gives you explicit control over who can see what. By default, a <LectureTip code tip="Defines a type with private members by default. Use when you're building an abstraction with invariants to protect. Has constructors, methods, access control.">class</LectureTip> has private members until you say otherwise; a <LectureTip code tip="Same as class but members are public by default. Use for plain data (POD) with no invariants to protect; just data, no encapsulation needed.">struct</LectureTip> has public members by default. The only difference is that default: use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">struct</code> for plain data and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">class</code> when you are building an abstraction with an interface.
            </LectureP>

            <div className="my-6 rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                    <p className="text-xs font-semibold text-foreground">Who can access what</p>
                </div>
                <div className="divide-y divide-border">
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground"><LectureTip code tip="Accessible by anyone: the class itself, derived classes, and all external code. Your API surface: constructors, getters, methods that change state in valid ways.">public:</LectureTip></p>
                        <p className="text-xs text-muted-foreground mt-0.5">Anyone can call or read. Your API: constructors, getters, methods that change state in valid ways.</p>
                    </div>
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground"><LectureTip code tip="Accessible only by this class's own methods. Not even derived classes can see private members. Use for implementation details and data that must be protected by invariants.">private:</LectureTip></p>
                        <p className="text-xs text-muted-foreground mt-0.5">Only this class. Derived classes cannot see private members. Use for implementation details and invariants.</p>
                    </div>
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground"><LectureTip code tip="Accessible by this class and all derived classes, but not external code. Use sparingly; it creates a coupling contract between base and derived classes.">protected:</LectureTip></p>
                        <p className="text-xs text-muted-foreground mt-0.5">This class and derived classes. Lets subclasses access or extend internal state without exposing it to the world. Use sparingly; it tightens coupling between base and derived.</p>
                    </div>
                </div>
            </div>

            <LectureCallout type="tip">
                Prefer <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">private</code> unless you have a clear reason for <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">protected</code>. Protected members become part of your inheritance contract; changing them can break every derived class.
            </LectureCallout>

            {/* ── 05 OOP IN C++: CLASSES, CONSTRUCTORS, INHERITANCE ───────────── */}
            <LectureSectionHeading number="05" title="OOP in C++: Classes, Constructors & Inheritance" />

            <LectureP>
                A <LectureTerm>class</LectureTerm> bundles data (member variables) and behavior (member functions). Constructors initialize the object; use the <LectureTip tip="Syntax: ClassName(params) : member1(val1), member2(val2) {}. Runs BEFORE the constructor body. Required for const members and references. More efficient than assigning in the body.">initializer list</LectureTip> (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">: title(t), author(a)</code>) to set members before the body runs; it is required for <LectureTip code tip="A member marked const cannot be changed after construction. Must be initialized in the initializer list; you cannot assign to a const member in the constructor body.">const</LectureTip> members and references, and often more efficient.
            </LectureP>

            <CodeBlock language="cpp"
                title="encapsulation · Book class with private state"
                lines={[
                    'class Book {',
                    'private:',
                    '    string title;',
                    '    string author;',
                    '    bool checkedOut = false;',
                    '',
                    'public:',
                    '    // Constructor with initializer list : title(t), author(a)',
                    '    Book(string t, string a) : title(t), author(a) {}',
                    '',
                    '    string getTitle()  const { return title; }',
                    '    string getAuthor() const { return author; }',
                    '    bool isAvailable() const { return !checkedOut; }',
                    '',
                    '    bool checkout() {',
                    '        if (checkedOut) return false;',
                    '        checkedOut = true;',
                    '        return true;',
                    '    }',
                    '    void returnBook() { checkedOut = false; }',
                    '};',
                ]}
            />

            <LectureCallout type="tip">
                Use the initializer list (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">: title(t), author(a)</code>) to initialize members. It runs before the constructor body and is required for const members and references.
            </LectureCallout>

            <LectureSubHeading title="Initializer list order" />
            <LectureP>
                Members are always initialized in the <strong className="text-foreground">order they are declared in the class</strong>, not the order you list them in the initializer list. If your list order does not match declaration order, you can get subtle bugs (e.g. member A is initialized using member B, but B is not initialized yet). Keep declaration order and list order the same.
            </LectureP>

            <LectureSubHeading title="Const correctness" />
            <LectureP>
                Mark member functions that do not modify the object with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">const</code> at the end: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">string getTitle() const;</code>. That is a promise: "this function will not change any member." Getters and inspectors should always be const. Const objects can only call const member functions. When you take a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">const LibraryItem&amp;</code>, you are promising not to modify it, so only const methods are callable.
            </LectureP>

            <LectureP>
                <LectureTerm>Inheritance</LectureTerm> lets a derived class reuse and extend a base class. Use <LectureTip code tip="Declares a method as overridable. When called through a base pointer/reference, the derived class's version runs instead of the base class's. Enables polymorphism via the vtable.">virtual</LectureTip> so that calls through a base pointer invoke the derived class's override. A virtual destructor in the base is required when you delete through a base pointer; otherwise the derived destructor will not run.
            </LectureP>

            <CodeBlock language="cpp"
                title="inheritance + virtual methods"
                lines={[
                    'class LibraryItem {',
                    'public:',
                    '    string id, title;',
                    '    LibraryItem(string i, string t) : id(i), title(t) {}',
                    '    virtual string getType() const { return "Item"; }',
                    '    virtual int getLoanDays() const = 0;  // pure virtual: must override',
                    '    virtual ~LibraryItem() {}  // required for correct cleanup',
                    '};',
                    '',
                    'class Book : public LibraryItem {',
                    'public:',
                    '    Book(string i, string t) : LibraryItem(i, t) {}',
                    '    string getType() const override { return "Book"; }',
                    '    int getLoanDays() const override { return 21; }',
                    '};',
                    '',
                    '// Polymorphism: same code works for any LibraryItem',
                    'void printInfo(const LibraryItem& item) {',
                    '    cout << item.getType() << " - " << item.getLoanDays() << " days" << endl;',
                    '}',
                ]}
            />

            <LectureCallout type="warning">
                <LectureTip tip="Assigning a derived object to a base variable by value copies only the base class's data; the derived part is 'sliced off' and lost. The object becomes just a base, losing its polymorphic identity. Always use references or pointers.">Slicing</LectureTip>: assigning a derived object to a base by value copies only the base part; the derived data is "sliced off." Always pass base classes by reference or pointer (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">const LibraryItem&</code>) to preserve polymorphic behavior.
            </LectureCallout>

            <LectureSubHeading title="Constructor and destructor order" />
            <LectureP>
                When you create a derived object, the base constructor runs first, then the derived constructor. When it is destroyed, the derived destructor runs first, then the base. Base builds the foundation, derived builds on top; on teardown, derived cleans up first, then base. A non-virtual destructor in the base is dangerous: only the base destructor runs when you <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">delete basePtr</code>, and the derived part is never cleaned up.
            </LectureP>

            <LectureCallout type="tip">
                Always declare destructors <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">virtual</code> in base classes that have virtual methods. Without it, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">delete basePtr</code> only runs the base destructor; the derived destructor will not run, leaking resources.
            </LectureCallout>

            <LectureP>
                Quick check on virtual dispatch. Read the snippet in the prompt carefully and predict the output before answering:
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="cpp"
                title="Exercise 2"
                prompt={<>Using the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">LibraryItem</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Book</code> classes above, what single word does this print? <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'LibraryItem* p = new Book("b1", "Dune"); cout << p->getType();'}</code></>}
                expected={['Book', '"Book"']}
                hint="getType() is virtual, so the call goes through the pointer's actual object type, not the pointer's declared type."
            />

            {/* ── 06 COMPOSITION VS INHERITANCE ─────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Composition vs Inheritance" />

            <LectureP>
                <LectureTerm>Inheritance</LectureTerm> models an <strong className="text-foreground">is-a</strong> relationship: a Book is a LibraryItem. <LectureTerm>Composition</LectureTerm> models <strong className="text-foreground">has-a</strong>: a Library has a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{"vector<LibraryItem*>"}</code> and an <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">unordered_map</code> for loans. Prefer composition when you are reusing behavior or data without needing to substitute one type for another through a common interface. Prefer inheritance when you have a true subtype: multiple classes that share an interface and can be used interchangeably.
            </LectureP>

            <LectureP>
                Deep inheritance hierarchies (A → B → C → D) are hard to maintain and test. If you find yourself going beyond one level of derivation, ask whether composition or a flatter design would work. "Favor composition over inheritance" is a design guideline, not a law: use inheritance where polymorphism is the goal, composition everywhere else.
            </LectureP>

            {/* ── 07 RULE OF THREE & RESOURCE MANAGEMENT ───────────────────────── */}
            <LectureSectionHeading number="07" title="Rule of Three & Resource Management" />

            <LectureP>
                If your class manages a resource (raw pointer, file handle, etc.), the compiler-generated copy constructor and copy-assignment operator do a <LectureTip tip="Copies the pointer value (the memory address), not the data it points to. Both objects now point to the same memory. When one frees it, the other has a dangling pointer.">shallow copy</LectureTip>: they copy the pointer, not what it points to. Then two objects think they own the same resource; when one is destroyed, it frees the memory and the other is left with a <LectureTip tip="A pointer that still holds an address, but the memory at that address has been freed. Accessing it causes undefined behavior: crashes, corrupted data, or silent bugs.">dangling pointer</LectureTip>. The <LectureTip tip="If you define any one of: destructor, copy constructor, or copy-assignment operator, you almost certainly need all three. They work together to manage resource ownership correctly.">rule of three</LectureTip>: if you define one of destructor, copy constructor, or copy-assignment operator, you usually need to define all three (or explicitly delete the copies and use move semantics). For now, prefer STL containers and smart pointers so the compiler-generated behavior is correct.
            </LectureP>

            <LectureCallout type="info">
                In C++11 and later, the <LectureTerm>rule of five</LectureTerm> adds move constructor and move assignment. For interview-level code and most application logic, stick to values and STL types and you rarely need to implement these yourself. Lecture 2 introduces smart pointers, which automate resource management entirely.
            </LectureCallout>

            {/* ── 08 ANOTHER EXAMPLE: INVARIANTS IN PRACTICE ─────────────────── */}
            <LectureSectionHeading number="08" title="Another Example: Invariants in Practice" />

            <LectureP>
                Encapsulation is about enforcing <LectureTip tip="Conditions that are always true for a correctly-constructed object. A bank balance is never negative. A connection is never used after close. The class's methods must maintain these guarantees.">invariants</LectureTip>, conditions that are always true for your object. A bank account balance should never be negative; a connection handle should never be used after close. Expose only operations that preserve the invariant.
            </LectureP>

            <CodeBlock language="cpp"
                title="BankAccount · balance never goes negative"
                lines={[
                    'class BankAccount {',
                    'private:',
                    '    double balance = 0.0;   // invariant: balance >= 0',
                    '',
                    'public:',
                    '    bool deposit(double amount) {',
                    '        if (amount <= 0) return false;',
                    '        balance += amount;',
                    '        return true;',
                    '    }',
                    '',
                    '    bool withdraw(double amount) {',
                    '        if (amount <= 0 || amount > balance) return false;',
                    '        balance -= amount;',
                    '        return true;',
                    '    }',
                    '',
                    '    double getBalance() const { return balance; }  // const: does not modify',
                    '};',
                    '',
                    '// Callers cannot set balance directly; only deposit/withdraw.',
                    '// So the invariant "balance >= 0" is always maintained.',
                ]}
            />

            <LectureSubHeading title="Common pitfalls to avoid" />
            <LectureP>
                <strong className="text-foreground">Virtual destructor:</strong> Base class with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">virtual</code> methods must have a virtual destructor; otherwise <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">delete basePtr</code> leaks the derived part. <strong className="text-foreground">Slicing:</strong> Passing or assigning by value copies only the base; use reference or pointer. <strong className="text-foreground">Const:</strong> Mark getters and read-only methods <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">const</code> so they work on const objects. <strong className="text-foreground">Initializer list:</strong> Use it for all members when possible; required for const and reference members. <strong className="text-foreground">Protected vs private:</strong> Prefer private; use protected only when derived classes genuinely need access.
            </LectureP>


        </LectureLayout>
    );
}
