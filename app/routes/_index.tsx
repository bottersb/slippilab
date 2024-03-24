import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CounterClockwiseClockIcon,
  PauseIcon,
  PinLeftIcon,
  PinRightIcon,
  PlayIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { SelectValue } from "@radix-ui/react-select";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { decode } from "@shelacek/ubjson";
import { InferInsertModel } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { generateSlug } from "random-word-slugs";
import { useEffect, useRef, useState } from "react";

import { shortCharactersExt } from "~/common/names";
import { PlayerStub, ReplayStub, ReplayType } from "~/common/types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Progress } from "~/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "~/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Slider } from "~/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { parseReplay } from "~/parser";
import * as schema from "~/schema";
import { useFileStore } from "~/stores/fileStore";
import { useReplayStore } from "~/stores/replayStore";
import { Replay } from "~/viewer/Replay";

export async function action({ context, request }: ActionFunctionArgs) {
  const { DB, BUCKET } = context.cloudflare.env;
  const db = drizzle(DB, { schema });
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 20_000_000,
  });
  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  const file = form.get("replay");
  if (!(file instanceof File)) {
    return new Response("No file found", { status: 400 });
  }
  const buffer = new Uint8Array(await file.arrayBuffer());
  const { raw, metadata } = decode(buffer, { useTypedArrays: true });
  const replay = parseReplay(metadata, raw);

  const id = crypto.randomUUID();
  const slug = generateSlug(3, { format: "camel" });
  const dbReplay: InferInsertModel<typeof schema.replays> = {
    id,
    slug,
    type: replay.type,
    stageId: replay.settings.stageId,
    startTimestamp: replay.settings.startTimestamp,
    matchId: replay.settings.matchId,
    gameNumber: replay.settings.gameNumber,
    tiebreakerNumber: replay.settings.tiebreakerNumber,
  };
  const dbPlayers: InferInsertModel<typeof schema.replayPlayers>[] =
    replay.settings.playerSettings.filter(Boolean).map((player) => ({
      replayId: id,
      playerIndex: player.playerIndex,
      connectCode: player.connectCode,
      displayName: player.displayName,
      nametag: player.nametag,
      teamId: player.teamId,
      externalCharacterId: player.externalCharacterId,
      costumeIndex: player.costumeIndex,
    }));

  await BUCKET.put(slug, buffer);
  await db.batch([
    db.insert(schema.replays).values(dbReplay),
    ...dbPlayers.map((dbPlayer) =>
      db.insert(schema.replayPlayers).values(dbPlayer),
    ),
  ]);

  return redirect(`/?watch=${slug}`);
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { DB } = context.cloudflare.env;
  const db = drizzle(DB, { schema });
  const rows = await db.query.replays.findMany({
    with: {
      replayPlayers: true,
    },
  });
  const stubs: ReplayStub[] = rows.map((row) => ({
    slug: row.slug,
    type: row.type as ReplayType,
    startTimestamp: row.startTimestamp,
    stageId: row.stageId,
    players: row.replayPlayers.map((player) => ({
      playerIndex: player.playerIndex,
      connectCode: player.connectCode ?? undefined,
      displayName: player.displayName ?? undefined,
      externalCharacterId: player.externalCharacterId,
      costumeIndex: player.costumeIndex,
    })),
  }));
  return { stubs };
}

export default function Page() {
  return (
    <div className="flex h-screen gap-8 overflow-y-auto p-4">
      <div className="flex shrink grow flex-col">
        <div className="mb-2">
          <ReplaySelect />
        </div>
        <Replay />
        <Controls />
      </div>
      <div className="w-[200px]">
        <HighlightList />
      </div>
    </div>
  );
}

function Controls() {
  const { replay, frame, setFrame, paused, setPaused, speed, setSpeed } =
    useReplayStore();

  let current = "0:00";
  let total = "0:00";
  if (replay) {
    const currentMinutes = Math.floor(frame / 60 / 60);
    const currentSeconds = Math.floor((frame % 3600) / 60);
    current = `${currentMinutes}:${String(currentSeconds).padStart(2, "0")}`;
    const totalMinutes = Math.floor(replay.frames.length / 60 / 60);
    const totalSeconds = Math.floor((replay.frames.length % 3600) / 60);
    total = `${totalMinutes}:${String(totalSeconds).padStart(2, "0")}`;
  }

  function handleKeyPress(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft":
      case "j":
        setFrame(Math.max(frame - 120, 0));
        break;
      case "ArrowRight":
      case "l":
        setFrame(Math.min(frame + 120, (replay?.frames.length ?? 1) - 1));
        break;
      case " ":
      case "k":
        setPaused(!paused);
        break;
      case ",":
        setPaused(true);
        setFrame(Math.max(0, frame - 1));
        break;
      case ".":
        setPaused(true);
        setFrame(Math.min((replay?.frames.length ?? 1) - 1, frame + 1));
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        const num = parseInt(event.key);
        setFrame(Math.round((replay?.frames.length ?? 0) * (num / 10)));
        break;
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <>
      <Slider
        value={[frame]}
        min={0}
        max={replay?.frames.length ?? 10}
        onValueChange={(value) => setFrame(value[0])}
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm font-medium leading-none">
          {current} / {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            onClick={() => {
              setFrame(Math.max(frame - 120, 0));
              setPaused(true);
            }}
          >
            <CounterClockwiseClockIcon />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            onClick={() => {
              setFrame(Math.max(frame - 1, 0));
              setPaused(true);
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            onClick={() => setPaused(!paused)}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            onClick={() => {
              setFrame(Math.min(frame + 1, (replay?.frames.length ?? 1) - 1));
              setPaused(true);
            }}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            onClick={() => {
              setFrame(Math.min(frame + 120, (replay?.frames.length ?? 1) - 1));
              setPaused(true);
            }}
          >
            <CounterClockwiseClockIcon className=" -scale-x-100" />
          </Button>
        </div>
      </div>
    </>
  );
}

function HighlightList() {
  const { highlights, setFrame } = useReplayStore();
  const [selectedQuery, setSelectedQuery] = useState<string>(
    Object.keys(highlights)[0],
  );

  return (
    <>
      <Select value={selectedQuery} onValueChange={setSelectedQuery}>
        <SelectTrigger className="gap-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Category</SelectLabel>
            {Object.keys(highlights).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="mt-2 grid grid-cols-[repeat(2,auto)] justify-center gap-x-4">
        {highlights[selectedQuery].map((highlight, i) => (
          <button
            key={i}
            className="col-span-full grid grid-cols-subgrid items-center rounded px-4 py-1 hover:bg-foreground/10"
            onClick={() => setFrame(Math.max(highlight.startFrame - 30, 0))}
          >
            <Badge
              variant="outline"
              className={cn(
                [
                  "bg-red-400/10 text-red-400",
                  "bg-blue-400/10 text-blue-400",
                  "bg-yellow-400/10 text-yellow-400",
                  "bg-green-400/10 text-green-400",
                ][highlight.playerIndex],
              )}
            >
              Player {highlight.playerIndex + 1}
            </Badge>
            <div>
              {Math.floor(highlight.startFrame / 60 / 60)}:
              {String(
                Math.floor(Math.floor(highlight.startFrame % 3600) / 60),
              ).padStart(2, "0")}
            </div>
          </button>
        ))}
        <div className="col-span-full hidden text-center text-sm only:block">
          No highlights
        </div>
      </div>
    </>
  );
}

function ReplaySelect() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("watch");
  const { stubs } = useFileStore();
  const replay = useReplayStore((store) => store.replay);
  const submit = useSubmit();

  const navigation = useNavigation();

  return (
    <div className="flex items-center justify-between">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" className="gap-2">
            <div>Now playing:</div>
            <div>{slug?.replace("local-", "") ?? "None"}</div>
            <ChevronDownIcon className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-[600px] flex-col sm:max-w-none"
        >
          <div className="flex grow flex-col">
            <ReplaySelectContent />
          </div>
        </SheetContent>
      </Sheet>
      {replay && <div>{replay.settings.startTimestamp}</div>}
      {slug?.startsWith("local-") && (
        <Button
          variant="secondary"
          disabled={Boolean(navigation.formAction)}
          onClick={(e) => {
            const formData = new FormData();
            const file = stubs.find(([stub]) => stub.slug === slug)?.[1];
            if (!file) {
              return;
            }
            formData.append("replay", file);
            submit(formData, {
              method: "POST",
              encType: "multipart/form-data",
            });
          }}
        >
          {navigation.formAction && (
            <ReloadIcon className="mr-2 size-4 animate-spin" />
          )}
          Upload
        </Button>
      )}
      {slug && !slug.startsWith("local-") && (
        <Button variant="secondary" asChild>
          <a href={`/${slug}.slp`}>Download</a>
        </Button>
      )}
    </div>
  );
}

function ReplaySelectContent() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("watch");
  const { stubs: localStubs, loadFiles, loadProgress } = useFileStore();
  const cloudStubs = useLoaderData<typeof loader>().stubs;
  const [tab, setTab] = useState(
    slug && !slug.startsWith("local-") ? "cloud" : "local",
  );

  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mt-4 flex items-center justify-between"
      >
        <TabsList>
          <TabsTrigger value="local">Local</TabsTrigger>
          <TabsTrigger value="cloud">Cloud</TabsTrigger>
        </TabsList>
        <TabsContent value="local" className="mt-0">
          <input
            type="file"
            ref={fileInput}
            className="hidden"
            onInput={(event) =>
              loadFiles([...((event.target as HTMLInputElement).files ?? [])])
            }
          />
          <input
            type="file"
            ref={folderInput}
            // @ts-ignore webkit
            webkitdirectory=""
            className="hidden"
            onInput={(event) =>
              loadFiles([...((event.target as HTMLInputElement).files ?? [])])
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open files</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => folderInput.current?.click()}>
                Open folder
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => fileInput.current?.click()}>
                Open file
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TabsContent>
      </Tabs>
      {loadProgress !== undefined && (
        <Progress className="mt-2" value={loadProgress} />
      )}
      <ReplayList
        stubs={tab === "local" ? localStubs.map(([stub]) => stub) : cloudStubs}
      />
    </>
  );
}

function ReplayList({ stubs }: { stubs: ReplayStub[] }) {
  const { page, setPage, filters, setFilters } = useFileStore();
  const pageSize = 10;

  const filteredStubs = stubs.filter((stub) => {
    const allowedStages = filters
      .filter((filter) => filter.type === "stage")
      .map(Number);
    if (allowedStages.length > 0 && !allowedStages.includes(stub.stageId)) {
      return false;
    }
    const neededCharacterCounts: Record<number, number> = {};
    for (const filter of filters
      .filter((filter) => filter.type === "character")
      .map(Number)) {
      neededCharacterCounts[filter] = (neededCharacterCounts[filter] ?? 0) + 1;
    }
    for (const player of stub.players) {
      if (neededCharacterCounts[player.externalCharacterId] > 0) {
        neededCharacterCounts[player.externalCharacterId]--;
      }
    }
    if (Object.values(neededCharacterCounts).some((count) => count > 0)) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="mt-2 grid grow auto-rows-max grid-cols-[repeat(5,auto)] gap-x-4 text-sm">
        {filteredStubs
          .slice(page * pageSize, page * pageSize + pageSize)
          .map((stub) => (
            <ReplayRow key={stub.slug} stub={stub} />
          ))}
      </div>
      <div className="mt-auto flex items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          disabled={page === 0}
          onClick={() => setPage(0)}
        >
          <PinLeftIcon />
        </Button>
        <Button
          size="icon"
          variant="outline"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          <ArrowLeftIcon />
        </Button>
        <div className="mx-auto text-sm">
          Page {page + 1} of {Math.ceil(filteredStubs.length / pageSize)}
        </div>
        <Button
          size="icon"
          variant="outline"
          disabled={page === Math.ceil(filteredStubs.length / pageSize) - 1}
          onClick={() => setPage(page + 1)}
        >
          <ArrowRightIcon />
        </Button>
        <Button
          size="icon"
          variant="outline"
          disabled={page === Math.ceil(filteredStubs.length / pageSize) - 1}
          onClick={() =>
            setPage(Math.ceil(filteredStubs.length / pageSize) - 1)
          }
        >
          <PinRightIcon />
        </Button>
      </div>
    </>
  );
}

function ReplayRow({ stub }: { stub: ReplayStub }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const isDoubles = stub.players.length > 2;
  // @ts-expect-error groupBy is new-ish
  const playerGroups: Record<number, PlayerStub[]> = Object.groupBy(
    stub.players,
    (player: PlayerStub) => (isDoubles ? player.teamId : player.playerIndex),
  );

  return (
    <button
      className={cn(
        "col-span-full grid grid-cols-subgrid items-center rounded border-2 px-4 py-1",
        stub.slug === searchParams.get("watch")
          ? "border-primary bg-primary/10"
          : "border-transparent hover:border-border hover:bg-foreground/10",
      )}
      onClick={() => {
        searchParams.set("watch", stub.slug);
        searchParams.delete("start");
        setSearchParams(searchParams);
      }}
    >
      <div className="capitalize">{stub.type}</div>
      <div>
        <div>
          {new Date(stub.startTimestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
        <div>
          {new Date(stub.startTimestamp).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>

      <img
        src={`/stages/${stub.stageId}.png`}
        className="h-12 rounded border"
      />
      {Object.values(playerGroups).map((playerGroup) => (
        <div>
          {playerGroup.map((player) => (
            <div key={player.playerIndex} className="flex items-center gap-2">
              <img
                // using team id as the costume index for doubles is wrong
                src={`/stockicons/${player.externalCharacterId}/${isDoubles ? (player.teamId === 2 ? 3 : player.teamId) : player.costumeIndex}.png`}
                className="h-6"
              />
              <div>
                <div className="max-w-[8ch] overflow-hidden text-ellipsis whitespace-nowrap text-start">
                  {player.displayName ??
                    shortCharactersExt[player.externalCharacterId]}
                </div>
                {!isDoubles && (
                  <div className="text-start text-xs text-foreground/70">
                    {player.connectCode ?? `Port ${player.playerIndex + 1}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </button>
  );
}
