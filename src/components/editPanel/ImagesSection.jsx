import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import CustomSvg from "@/components/atoms/CustomSvg";

import { useAssets } from "@/hooks";
import {
  addGameAsset,
  createAlert,
  removeGameAsset,
  renameGameAsset,
} from "@/state";
import {
  KINDS,
  MAX_FILES,
  MAX_PNG_BYTES,
  MAX_SVG_BYTES,
  assetProblem,
  customId,
  extensionOf,
  findDuplicate,
  nameProblem,
  pngDataUri,
  sanitizeName,
} from "@/util/assetNames";
import { customReferences } from "@/util/gameValidation";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";
import { sanitizeSvg } from "@/util/svgSanitize";

// The types of game the web app stores images for (IndexedDB, by game slug)
export const storesImages = (type) => type === idb.TYPE || type === opfs.TYPE;

// The codes of util/storage/assets that have a text (assets.errors)
const ERROR_CODES = [
  "kind",
  "empty",
  "long",
  "invalid",
  "reserved",
  "size",
  "png",
  "exists",
  "missing",
  "count",
  "total",
  "quota",
];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// The first name of the form name, name-2, name-3 ... that the kind does not
// have (case aside)
export const freeName = (names, name) => {
  let candidate = name;
  for (let n = 2; findDuplicate(names, candidate); n += 1) {
    candidate = `${name.slice(0, 60)}-${n}`;
  }
  return candidate;
};

const Preview = ({ kind, name, value }) =>
  kind === "trains" ? (
    <img src={value} alt="" className="h-10 w-auto max-w-20 object-contain" />
  ) : (
    <svg viewBox="-12.5 -12.5 25 25" className="size-10" aria-hidden="true">
      <CustomSvg
        svg={value}
        x="-12.5"
        y="-12.5"
        width="25"
        height="25"
        data-name={name}
      />
    </svg>
  );

const Row = ({ slug, kind, name, value, uses, writable }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [renaming, setRenaming] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const id = customId(name);

  const fail = (target, e) =>
    dispatch(
      createAlert(
        t("assets.failed", { name: target }),
        t(
          `assets.errors.${ERROR_CODES.includes(e.code) ? e.code : "unreadable"}`,
        ),
        "error",
      ),
    );

  const rename = () => {
    const to = renaming.trim();
    const problem = nameProblem(to);
    if (problem) {
      dispatch(
        createAlert(
          t("assets.failed", { name: to }),
          t(`assets.errors.${problem}`),
          "error",
        ),
      );
      return;
    }
    if (to === name) return setRenaming(null);
    dispatch(renameGameAsset(slug, kind, name, to))
      .then(() => setRenaming(null))
      .catch((e) => fail(to, e));
  };

  return (
    <li className="flex flex-row items-center gap-3 rounded-md border p-2">
      <Preview kind={kind} name={name} value={value} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {renaming === null ? (
          <code className="truncate text-sm">{id}</code>
        ) : (
          <Input
            aria-label={t("assets.rename", { id })}
            value={renaming}
            onChange={(event) => setRenaming(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") rename();
              if (event.key === "Escape") setRenaming(null);
            }}
          />
        )}
        {uses > 0 && (
          <span className="text-xs text-muted-foreground">
            {t("assets.used", { count: uses })}
          </span>
        )}
      </div>
      {writable && (
        <div className="flex shrink-0 flex-row gap-1">
          {renaming === null ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRenaming(name)}
              aria-label={t("assets.rename", { id })}
            >
              {t("assets.renameButton")}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={rename}>
              {t("assets.save")}
            </Button>
          )}
          <Button
            variant={confirming ? "destructive" : "outline"}
            size="sm"
            aria-label={t("assets.delete", { id })}
            onClick={() => {
              // An image the game still uses is deleted on the second click
              if (uses > 0 && !confirming) return setConfirming(true);
              dispatch(removeGameAsset(slug, kind, name)).catch((e) =>
                fail(id, e),
              );
            }}
          >
            {confirming ? t("assets.deleteAnyway") : t("assets.deleteButton")}
          </Button>
        </div>
      )}
    </li>
  );
};

// The Images tab: the custom images of the game (icons, logos and train
// images), used in the game as custom/<name>
const ImagesSection = ({ game }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const assets = useAssets();
  const input = useRef(null);
  const [svgKind, setSvgKind] = useState("icons");
  const { slug, type } = game.meta;
  const writable = storesImages(type);
  const references = customReferences(game);

  const upload = async (files) => {
    const added = [];
    const failed = [];
    // The names of each kind as they will be, so a batch never clashes
    const names = Object.fromEntries(
      KINDS.map((kind) => [kind, Object.keys(assets?.[kind] ?? {})]),
    );
    for (const file of files) {
      const extension = extensionOf(file.name);
      const kind =
        extension === "svg" ? svgKind : extension === "png" ? "trains" : null;
      const fail = (reason) =>
        failed.push(`${file.name}: ${t(`assets.errors.${reason}`)}`);
      if (!kind) {
        fail("type");
        continue;
      }
      if (file.size > (kind === "trains" ? MAX_PNG_BYTES : MAX_SVG_BYTES)) {
        fail("size");
        continue;
      }
      try {
        const buffer = new Uint8Array(await file.arrayBuffer());
        const name = freeName(names[kind], sanitizeName(file.name));
        const problem = assetProblem(kind, name, buffer);
        if (problem) {
          fail(problem);
          continue;
        }
        let value;
        if (kind === "trains") {
          value = pngDataUri(buffer);
        } else {
          value = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
          if (!sanitizeSvg(value)) {
            fail("svg");
            continue;
          }
        }
        await dispatch(addGameAsset(slug, kind, name, value));
        names[kind].push(name);
        added.push(customId(name));
      } catch (e) {
        fail(e.code && ERROR_CODES.includes(e.code) ? e.code : "unreadable");
      }
    }
    if (failed.length) {
      dispatch(createAlert(t("assets.notAdded"), failed.join("\n"), "error"));
    } else if (added.length) {
      dispatch(createAlert(t("assets.added"), added.join("\n"), "success"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {writable ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => input.current?.click()}
              disabled={
                KINDS.reduce(
                  (n, k) => n + Object.keys(assets?.[k] ?? {}).length,
                  0,
                ) >= MAX_FILES
              }
            >
              {t("assets.add")}
            </Button>
            <label className="flex flex-row items-center gap-2 text-sm">
              {t("assets.svgAs")}
              <select
                value={svgKind}
                onChange={(event) => setSvgKind(event.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-2"
              >
                <option value="icons">{t("assets.kinds.icons")}</option>
                <option value="logos">{t("assets.kinds.logos")}</option>
              </select>
            </label>
            <input
              ref={input}
              type="file"
              multiple
              hidden
              accept=".svg,.png,image/svg+xml,image/png"
              data-testid="images-upload"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (files.length) upload(files);
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("assets.limits", {
              files: MAX_FILES,
              svg: kb(MAX_SVG_BYTES),
              png: kb(MAX_PNG_BYTES),
            })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t(type === "electron" ? "assets.folderNote" : "assets.readOnlyNote")}
        </p>
      )}
      {KINDS.map((kind) => {
        const names = Object.keys(assets?.[kind] ?? {}).sort();
        return (
          <section key={kind} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">
              {t(`assets.kinds.${kind}`)}
            </h2>
            {names.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("assets.none")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {names.map((name) => (
                  <Row
                    key={name}
                    slug={slug}
                    kind={kind}
                    name={name}
                    value={assets[kind][name]}
                    uses={
                      references.filter(
                        (r) => r.kind === kind && r.id === customId(name),
                      ).length
                    }
                    writable={writable}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default ImagesSection;
