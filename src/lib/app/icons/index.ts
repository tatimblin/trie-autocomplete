// Imported, not served from static/, so the embed build inlines them (lib mode
// inlines every asset) and the page needs no asset host.
import align from "./align.png";
import attach from "./attach.png";
import bold from "./bold.png";
import chevronLeft from "./chevron-left.png";
import chevronRight from "./chevron-right.png";
import close from "./close.png";
import expand from "./expand.png";
import link from "./link.png";

export const icons = {
	align,
	attach,
	bold,
	"chevron-left": chevronLeft,
	"chevron-right": chevronRight,
	close,
	expand,
	link,
};

export type Icon = keyof typeof icons;
