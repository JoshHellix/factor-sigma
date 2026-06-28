"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

type FaIconProps = {
  icon: IconDefinition;
  className?: string;
  size?: "xs" | "sm" | "lg" | "1x" | "2x";
};

export function FaIcon({ icon, className, size = "1x" }: FaIconProps) {
  return <FontAwesomeIcon icon={icon} className={className} size={size} />;
}
