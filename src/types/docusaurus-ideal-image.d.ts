// src/types/docusaurus-ideal-image.d.ts
declare module "@theme/IdealImage" {
  import type { ComponentType } from "react";

  export interface Props {
    img: string;
    alt?: string;
    className?: string;
    style?: React.CSSProperties;
  }

  const IdealImage: ComponentType<Props>;
  export default IdealImage;
}
