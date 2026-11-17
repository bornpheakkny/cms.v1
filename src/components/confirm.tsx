import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Button, Modal } from "./ui";

type Options = { title: string; message?: string; confirmLabel?: string; danger?: boolean };
type Ask = (o: Options) => Promise<boolean>;

const ConfirmContext = createContext<Ask>(() => Promise.resolve(false));

/** Styled replacement for window.confirm(): `if (await confirm({ title: "Delete?" })) …` */
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<Options | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});

  const ask = useCallback<Ask>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => (resolver.current = resolve));
  }, []);

  const done = (v: boolean) => {
    resolver.current(v);
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      <Modal
        open={!!opts}
        onClose={() => done(false)}
        title={opts?.title ?? ""}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => done(false)} data-autofocus>
              Cancel
            </Button>
            <Button variant={opts?.danger ? "danger" : "primary"} onClick={() => done(true)}>
              {opts?.confirmLabel ?? "Confirm"}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-fg-muted">{opts?.message ?? "This can't be undone."}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}
