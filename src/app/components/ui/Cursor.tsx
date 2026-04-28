// "use client";
// import { useEffect, useRef } from "react";

// export default function Cursor() {
//   const cursorRef = useRef<HTMLDivElement>(null);
//   const ringRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     let mx = 0,
//       my = 0,
//       rx = 0,
//       ry = 0;

//     const onMove = (e: MouseEvent) => {
//       mx = e.clientX;
//       my = e.clientY;
//       if (cursorRef.current) {
//         cursorRef.current.style.left = mx + "px";
//         cursorRef.current.style.top = my + "px";
//       }
//     };

//     const animate = () => {
//       rx += (mx - rx) * 0.12;
//       ry += (my - ry) * 0.12;
//       if (ringRef.current) {
//         ringRef.current.style.left = rx + "px";
//         ringRef.current.style.top = ry + "px";
//       }
//       requestAnimationFrame(animate);
//     };

//     document.addEventListener("mousemove", onMove);
//     animate();
//     return () => document.removeEventListener("mousemove", onMove);
//   }, []);

//   return (
//     <>
//       <div ref={cursorRef} className="cursor" />
//       <div ref={ringRef} className="cursor-ring" />
//     </>
//   );
// }
