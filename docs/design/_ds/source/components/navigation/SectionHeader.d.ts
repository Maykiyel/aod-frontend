import * as React from 'react';

/**
 * Section heading: red square eyebrow, mono index, display title, lede.
 *
 * @startingPoint section="Layout" subtitle="Section heading with eyebrow and index" viewport="700x230"
 */
export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase mono kicker, e.g. 'Foundations'. */
  eyebrow?: string;
  /** Mono counter, e.g. '03/09'. */
  index?: string;
  /** Display-face title. Rendered uppercase. */
  title: string;
  /** One-paragraph lede under the title. */
  lede?: string;
}

export declare function SectionHeader(props: SectionHeaderProps): JSX.Element;
