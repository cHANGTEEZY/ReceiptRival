import type { ReactNode } from "react";

/** Props for compound slots: optional `children` replaces the default icon/content. */
export type HeaderSlotProps = {
  children?: ReactNode;
};

export type HeaderRootProps = {
  children?: ReactNode;
};
