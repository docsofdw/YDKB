type SpriteIconProps = {
  id: string;
  size?: number;
  className?: string;
  stroke?: string;
  fill?: string;
};

export default function SpriteIcon({
  id,
  size = 24,
  className = "",
  stroke = "currentColor",
  fill = "none"
}: SpriteIconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      stroke={stroke}
      fill={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
} 