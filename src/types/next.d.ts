// Add this to src/types/next.d.ts if you get any Image component typing errors
declare module 'next/image' {
    export default function Image(props: ImageProps): JSX.Element
  }
  