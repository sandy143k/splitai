'use client'
import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const C = canvasRef.current!
    const X = C.getContext('2d')!
    let W = 0, H = 0, T = 0, raf = 0

    const resize = () => {
      W = C.width  = window.innerWidth
      H = C.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Nodes for neural net
    const nodes = Array.from({ length: 32 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - .5) * .00012,
      vy: (Math.random() - .5) * .00012,
    }))

    // Dust
    const dust = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - .5) * .00010,
      vy: -(Math.random() * .00014 + .00003),
      r: Math.random() * 1.4 + .3,
      a: Math.random() * .45 + .05,
      tw: Math.random() * Math.PI * 2,
      tws: Math.random() * .02 + .007,
      side: Math.random() > .5 ? 1 : -1,
    }))

    const SEGS = 360
    const waveLayers = [
      { amp: .060, freq: 2.0, spd: .50, lw: 2.8, glow: 26, a: .80 },
      { amp: .036, freq: 3.6, spd: .85, lw: 1.4, glow: 12, a: .48 },
      { amp: .020, freq: 6.0, spd: 1.6, lw: .8,  glow:  6, a: .26 },
      { amp: .068, freq: 1.3, spd: .28, lw: 4.8, glow: 42, a: .14 },
    ]

    function frame() {
      T += .010
      X.clearRect(0, 0, W, H)

      // BG
      const bg = X.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.9)
      bg.addColorStop(0, '#090618'); bg.addColorStop(.5,'#050410'); bg.addColorStop(1,'#020108')
      X.fillStyle = bg; X.fillRect(0,0,W,H)

      // Mesh blobs
      ;[[.12,.2,'rgba(70,0,180,.10)',.44],[.88,.28,'rgba(0,55,200,.09)',.40],[.5,.88,'rgba(55,0,150,.08)',.36]].forEach(([bx,by,col,r]: any) => {
        const g = X.createRadialGradient(bx*W,by*H,0,bx*W,by*H,r*Math.max(W,H))
        g.addColorStop(0,col); g.addColorStop(1,'transparent')
        X.fillStyle=g; X.fillRect(0,0,W,H)
      })

      // Neural net
      X.save()
      nodes.forEach(n => { n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>1)n.vx*=-1; if(n.y<0||n.y>1)n.vy*=-1 })
      nodes.forEach((a,i)=>nodes.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y)
        if(d<.20){const al=(1-d/.20)*.12,m=(a.x+b.x)/2; X.beginPath();X.moveTo(a.x*W,a.y*H);X.lineTo(b.x*W,b.y*H);X.strokeStyle=m>.5?`rgba(0,100,255,${al})`:`rgba(110,0,255,${al})`;X.lineWidth=.5;X.stroke()}
      }))
      X.restore()

      // Dust
      dust.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.tw+=p.tws
        if(p.y<-.02)p.y=1.02; if(p.x<0)p.x=1; if(p.x>1)p.x=0
        const tw=.4+.6*Math.sin(p.tw)
        X.beginPath(); X.arc(p.x*W,p.y*H,p.r,0,Math.PI*2)
        X.fillStyle=p.side>0?`rgba(20,80,255,${p.a*tw})`:`rgba(110,0,255,${p.a*tw})`
        X.fill()
      })

      // Waves
      const cx=W*.5, cy=H*.5, half=W*.43
      waveLayers.forEach((wl,wi)=>{
        ;[[-1,'rgba(150,0,255,1)'],[1,'rgba(0,110,255,1)']].forEach(([side, sc]: any)=>{
          X.save(); X.beginPath()
          for(let i=0;i<=SEGS;i++){
            const f=i/SEGS, px=cx+side*f*half
            const env=Math.pow(Math.sin(f*Math.PI),.65)
            const y=cy+Math.sin(f*Math.PI*wl.freq*2+side*T*wl.spd+wi*.7)*wl.amp*H*env
                     +Math.sin(f*Math.PI*wl.freq*1.5+side*T*wl.spd*.7)*wl.amp*H*.28*env
            i===0?X.moveTo(px,y):X.lineTo(px,y)
          }
          X.shadowColor=sc; X.shadowBlur=wl.glow
          X.strokeStyle=side<0?`rgba(140,0,255,${wl.a})`:`rgba(0,100,255,${wl.a})`
          X.lineWidth=wl.lw; X.stroke(); X.restore()
        })
      })

      // Rift
      const pulse=.7+.3*Math.sin(T*2)
      const riftH=H*.52
      const lg=X.createLinearGradient(cx,cy-riftH/2,cx,cy+riftH/2)
      lg.addColorStop(0,'transparent'); lg.addColorStop(.4,'rgba(160,100,255,.85)'); lg.addColorStop(.5,'rgba(220,180,255,.98)'); lg.addColorStop(.6,'rgba(80,140,255,.85)'); lg.addColorStop(1,'transparent')
      X.save(); X.beginPath(); X.moveTo(cx,cy-riftH/2); X.lineTo(cx,cy+riftH/2)
      X.strokeStyle=lg; X.lineWidth=1.6; X.shadowColor='rgba(180,120,255,1)'; X.shadowBlur=22; X.stroke()

      const coreG=X.createRadialGradient(cx,cy,0,cx,cy,50*pulse)
      coreG.addColorStop(0,'rgba(255,255,255,.95)'); coreG.addColorStop(.2,'rgba(190,140,255,.7)'); coreG.addColorStop(.5,'rgba(90,70,255,.35)'); coreG.addColorStop(1,'transparent')
      X.fillStyle=coreG; X.beginPath(); X.arc(cx,cy,50*pulse,0,Math.PI*2); X.fill()
      X.beginPath(); X.arc(cx,cy,3.5,0,Math.PI*2)
      X.fillStyle='white'; X.shadowColor='white'; X.shadowBlur=18*pulse; X.fill()
      X.restore()

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
