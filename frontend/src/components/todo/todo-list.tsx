"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconListCheck,
  IconPlus,
  IconTrash,
  type Icon,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { User } from "@/types/types-user";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  important: boolean;
};

type RowPhase = "idle" | "leaving" | "entering";

const initialTodos: Todo[] = [];

const TRANSITION_MS = 200;

export function TodoList({
  title = "Tasks",
  icon: IconHeading = IconListCheck,
  accentColor = "#8196ee",
  emptyMessage = "Anda tidak memiliki task saat ini",
  user,
}: {
  title?: string;
  icon?: Icon;
  accentColor?: string;
  emptyMessage?: string;
  user: User | null;
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(initialTodos.length + 1);
  const [completedOpen, setCompletedOpen] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [leavingFrom, setLeavingFrom] = useState<Map<number, boolean>>(
    new Map(),
  );
  const [enteringIds, setEnteringIds] = useState<Set<number>>(new Set());
  const [pulseId, setPulseId] = useState<number | null>(null);

  const timers = useRef<Map<number, number>>(new Map());
  const pulseTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const playEnter = (id: number) => {
    setEnteringIds((prev) => new Set(prev).add(id));
    const timer = window.setTimeout(() => {
      setEnteringIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timers.current.delete(id);
    }, TRANSITION_MS);
    timers.current.set(id, timer);
  };

  const pendingTodos = todos.filter((todo) =>
    leavingFrom.has(todo.id) ? !leavingFrom.get(todo.id) : !todo.completed,
  );
  const completedTodos = todos.filter((todo) =>
    leavingFrom.has(todo.id) ? leavingFrom.get(todo.id) : todo.completed,
  );

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;

    const id = nextId;
    setTodos((prev) => [
      ...prev,
      { id, title: text, completed: false, important: false },
    ]);
    setNextId((n) => n + 1);
    setInput("");
    playEnter(id);
  };

  const toggleCompleted = (id: number, checked: boolean) => {
    const previous = todos.find((todo) => todo.id === id)?.completed ?? false;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: checked } : todo,
      ),
    );

    setPulseId(id);
    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulseId(null), 320);

    const existing = timers.current.get(id);
    if (existing) window.clearTimeout(existing);

    setLeavingFrom((prev) => new Map(prev).set(id, previous));
    const exitTimer = window.setTimeout(() => {
      setLeavingFrom((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      playEnter(id);
    }, TRANSITION_MS);
    timers.current.set(id, exitTimer);
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      hex.replace("#", ""),
    );
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "129, 150, 238";
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTodo();
  };

  const handleInputBlur = () => {
    if (!input.trim()) {
      setIsAdding(false);
    }
  };

  const rowPhase = (id: number): RowPhase => {
    if (leavingFrom.has(id)) return "leaving";
    if (enteringIds.has(id)) return "entering";
    return "idle";
  };

  return (
    <section
      className="flex h-svh min-h-0 flex-col overflow-hidden overscroll-none bg-[#1b1b1b] px-3 py-3 text-foreground sm:px-6"
      style={
        {
          "--accent": accentColor,
          "--accent-rgb": hexToRgb(accentColor),
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes todo-checkbox-pop {
          0% { transform: scale(0.75); }
          55% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-checkbox-pop {
          animation: todo-checkbox-pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: center;
        }
        .todo-scroll {
            scrollbar-width: thin;
            scrollbar-color: #3f3f3f transparent;
            overscroll-behavior: contain;
        }
        .todo-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .todo-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .todo-scroll::-webkit-scrollbar-thumb {
          background-color: #3f3f3f;
          border-radius: 9999px;
        }
        .todo-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #4a4a4a;
        }
        .todo-scroll::-webkit-scrollbar-button {
          display: none;
          width: 0;
          height: 0;
        }
        .accent-text { color: var(--accent); }
        .accent-placeholder::placeholder { color: color-mix(in srgb, var(--accent) 90%, transparent); }
        .accent-ring { --tw-ring-color: var(--accent); }
        .accent-checkbox[data-checked] { border-color: var(--accent); background-color: var(--accent); }
        .accent-checkbox-hover:not([data-checked]):hover { border-color: var(--accent); }
        .accent-icon-check { color: var(--accent); }
        .accent-empty-icon { color: var(--accent); }
      `}</style>

      <header className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2.5 accent-text">
          <SidebarTrigger className="-ml-1 size-9 shrink-0 text-zinc-300 hover:bg-[#303030] hover:text-zinc-50 md:hidden" />
          <IconHeading className="size-5 shrink-0 stroke-[1.8] sm:size-6" />
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
        </div>
      </header>

      <div className="todo-scroll mt-4 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto sm:mt-6">
        {pendingTodos.length > 0 && (
          <ul className="space-y-1">
            {pendingTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                phase={rowPhase(todo.id)}
                pulsing={pulseId === todo.id}
                onToggleCompleted={toggleCompleted}
                onDelete={deleteTodo}
              />
            ))}
          </ul>
        )}
        {completedTodos.length > 0 && (
          <Collapsible
            open={completedOpen}
            onOpenChange={setCompletedOpen}
            className="mt-2"
          >
            <CollapsibleTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#282828] px-2.5 text-sm text-zinc-50 transition-colors hover:bg-[#333333] focus-visible:ring-1 accent-ring focus-visible:outline-none">
              <IconChevronDown
                className={cn(
                  "size-4 transition-transform",
                  !completedOpen && "-rotate-90",
                )}
              />
              <span>Completed</span>
              <span>{completedTodos.length}</span>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              {completedTodos.length > 0 && (
                <ul className="space-y-1">
                  {completedTodos.map((todo) => (
                    <TaskRow
                      key={todo.id}
                      todo={todo}
                      phase={rowPhase(todo.id)}
                      pulsing={pulseId === todo.id}
                      onToggleCompleted={toggleCompleted}
                      onDelete={deleteTodo}
                    />
                  ))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
        {pendingTodos.length === 0 && completedTodos.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-16">
            <IconHeading className="size-16 accent-empty-icon opacity-30" />
            <p className="text-sm text-zinc-500">{emptyMessage}</p>
          </div>
        )}
      </div>
      {user &&
        (isAdding ? (
          <form
            onSubmit={handleSubmit}
            className="mt-2 flex min-h-12 items-center gap-3 rounded-md bg-[#303030] px-3 py-3 transition-shadow focus-within:ring-1 accent-ring focus-within:ring-opacity-60 sm:px-4"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onBlur={handleInputBlur}
              placeholder="Try typing 'Pay utilities bill by Friday 6pm'"
              className="h-auto my-auto border-0 bg-transparent p-0 text-sm accent-text shadow-none accent-placeholder focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent"
            />
            <Button type="submit" className="sr-only">
              Add task
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="cursor-text mt-2 flex min-h-12 w-full items-center gap-3 rounded-md bg-[#303030] px-3 py-3 text-left transition-colors hover:bg-[#353535] focus-visible:outline-none focus-visible:ring-1 accent-ring sm:px-4"
          >
            <IconPlus className="size-5 shrink-0 accent-text" />
            <span className="text-sm accent-text opacity-80">Add a task</span>
          </button>
        ))}
    </section>
  );
}

function TaskRow({
  todo,
  phase,
  pulsing,
  onToggleCompleted,
  onDelete,
}: {
  todo: Todo;
  phase: RowPhase;
  pulsing: boolean;
  onToggleCompleted: (id: number, checked: boolean) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <li
      className={cn(
        "group flex min-h-14 items-center gap-3 rounded-md bg-[#282828] px-3 py-3 text-zinc-100 transition-colors duration-150 hover:bg-[#2e2e2e] sm:px-4",
        phase === "leaving" &&
          "pointer-events-none animate-out fade-out-0 zoom-out-95 duration-200 fill-mode-forwards motion-reduce:animate-none",
        phase === "entering" &&
          "animate-in fade-in-0 zoom-in-95 duration-200 fill-mode-forwards motion-reduce:animate-none",
      )}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0",
          pulsing && "animate-checkbox-pop motion-reduce:animate-none",
        )}
      >
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) =>
            onToggleCompleted(todo.id, checked === true)
          }
          aria-label={
            todo.completed
              ? `Mark ${todo.title} as pending`
              : `Mark ${todo.title} as completed`
          }
          className={cn(
            "peer size-5 rounded-full border-2 border-zinc-300 bg-transparent text-[#1b1b1b] transition-colors duration-150 dark:bg-transparent accent-checkbox dark:accent-checkbox [&_[data-slot=checkbox-indicator]>svg]:size-3.5",
            !todo.completed && "accent-checkbox-hover",
          )}
        />
        {!todo.completed && (
          <IconCheck
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto size-3 scale-50 accent-icon-check opacity-0 transition-[opacity,transform] duration-150 ease-out peer-hover:scale-100 peer-hover:opacity-70 motion-reduce:transition-none"
          />
        )}
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="relative inline-block">
          <span
            className={cn(
              "block text-sm leading-relaxed",
              todo.completed ? "text-zinc-400" : "text-zinc-100",
            )}
          >
            {todo.title}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 top-1/2 h-px origin-left scale-x-0 bg-zinc-500 transition-transform duration-300 ease-out motion-reduce:transition-none",
              todo.completed && "scale-x-100",
            )}
          />
        </span>
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete ${todo.title}`}
        className="size-8 shrink-0 rounded-full text-zinc-500 opacity-100 sm:opacity-0 transition-[opacity,transform,color,background-color] duration-150 hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 active:scale-90 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        <IconTrash className="size-4" />
      </Button>
    </li>
  );
}
