import Image from "next/image"

type Props = {
  src: string
  alt: string
  /** Tailwind aspect class. Fixed ratio = no layout shift while the image loads. */
  aspect?: string
  /** Responsive sizes hint so the browser downloads the right width. */
  sizes?: string
  /** Only for the one above-the-fold image of a page (disables lazy-loading). */
  priority?: boolean
  className?: string
  imgClassName?: string
}

export default function ProductImage({
  src,
  alt,
  aspect = "aspect-[4/5]",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  className = "",
  imgClassName = "",
}: Props) {
  return (
    <div className={`relative overflow-hidden bg-[#1C1C1E] ${aspect} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={`object-cover ${imgClassName}`}
      />
    </div>
  )
}
