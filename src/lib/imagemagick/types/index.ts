interface DefaultImageMagickOptions {
    gravity?: Gravity
    fontSize?: string | number
    fill?: string
    font?: string
    width?: string | number
    height?: string | number
    offsetX?: string | number
    offsetY?: string | number
}

type Gravity = 'north' | 'northeast' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'east' | 'center'