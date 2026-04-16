import { useGameState } from "@workspace/ui/hooks/use-game-state"
import { countSetWins } from "@workspace/ui/lib/game-state"
import { useEffect, useRef, useState } from "react"

export default function Scoreboard() {
  const { state } = useGameState("display")
  const [prevScoreA, setPrevScoreA] = useState(state.teamA.score)
  const [prevScoreB, setPrevScoreB] = useState(state.teamB.score)
  const [animateA, setAnimateA] = useState(false)
  const [animateB, setAnimateB] = useState(false)
  const [animateSwap, setAnimateSwap] = useState(false)
  const prevSwapped = useRef(state.swapped)

  // Detect score changes for animation
  useEffect(() => {
    if (state.teamA.score !== prevScoreA) {
      setAnimateA(true)
      setPrevScoreA(state.teamA.score)
      const t = setTimeout(() => setAnimateA(false), 300)
      return () => clearTimeout(t)
    }
  }, [state.teamA.score, prevScoreA])

  useEffect(() => {
    if (state.teamB.score !== prevScoreB) {
      setAnimateB(true)
      setPrevScoreB(state.teamB.score)
      const t = setTimeout(() => setAnimateB(false), 300)
      return () => clearTimeout(t)
    }
  }, [state.teamB.score, prevScoreB])

  // Detect swap changes
  useEffect(() => {
    if (state.swapped !== prevSwapped.current) {
      setAnimateSwap(true)
      prevSwapped.current = state.swapped
      const t = setTimeout(() => setAnimateSwap(false), 500)
      return () => clearTimeout(t)
    }
  }, [state.swapped])

  const leftTeam = state.swapped ? "B" : "A"
  const rightTeam = state.swapped ? "A" : "B"
  const leftData = state.swapped ? state.teamB : state.teamA
  const rightData = state.swapped ? state.teamA : state.teamB
  const servingLeft =
    (state.serving === "A" && !state.swapped) ||
    (state.serving === "B" && state.swapped)

  const leftAnimate = state.swapped ? animateB : animateA
  const rightAnimate = state.swapped ? animateA : animateB

  const setWins = countSetWins(state.setHistory)
  const leftSetWins = leftTeam === "A" ? setWins.teamA : setWins.teamB
  const rightSetWins = rightTeam === "A" ? setWins.teamA : setWins.teamB

  return (
    <div className="scoreboard-root">
      {/* Set Badge */}
      <div className="set-badge">
        <span>SET {state.currentSet}</span>
      </div>

      {/* Set Wins Display — positioned above panels */}
      {state.setHistory.length > 0 && (
        <div className="set-wins-bar">
          <div className="set-wins set-wins-left">
            <span className="set-wins-count">{leftSetWins}</span>
          </div>
          <div className="set-wins-label">ĐIỂM SET</div>
          <div className="set-wins set-wins-right">
            <span className="set-wins-count">{rightSetWins}</span>
          </div>
        </div>
      )}

      {/* Set History Pills */}
      {state.setHistory.length > 0 && (
        <div className="set-history">
          {state.setHistory.map((record) => (
            <div key={record.setNumber} className="set-pill">
              <span className="set-pill-label">S{record.setNumber}</span>
              <span
                className={record.teamA > record.teamB ? "set-pill-win" : ""}
              >
                {record.teamA}
              </span>
              <span className="set-pill-sep">-</span>
              <span
                className={record.teamB > record.teamA ? "set-pill-win" : ""}
              >
                {record.teamB}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Scoreboard panels */}
      <div className={`panels ${animateSwap ? "swapping" : ""}`}>
        {/* Left Panel */}
        <div className={`panel panel-left ${servingLeft ? "serving" : ""}`}>
          <div className={`serve-text ${servingLeft ? "serving-active" : ""}`}>
            GIAO BÓNG
          </div>
          <div className="team-name">{leftData.name}</div>
          <div className={`score ${leftAnimate ? "score-pop" : ""}`}>
            {leftData.score}
          </div>
        </div>

        {/* Divider */}
        <div className="divider">
          <div className="divider-line" />
          <div className="divider-vs">VS</div>
          <div className="divider-line" />
        </div>

        {/* Right Panel */}
        <div className={`panel panel-right ${!servingLeft ? "serving" : ""}`}>
          <div className={`serve-text ${!servingLeft ? "serving-active" : ""}`}>
            GIAO BÓNG
          </div>
          <div className="team-name">{rightData.name}</div>
          <div className={`score ${rightAnimate ? "score-pop" : ""}`}>
            {rightData.score}
          </div>
        </div>
      </div>

      <style>{`
        .scoreboard-root {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: #050505;
          font-family: 'Inter Variable', system-ui, sans-serif;
          overflow: hidden;
        }

        /* Set Badge */
        .set-badge {
          position: absolute;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
        }
        .set-badge span {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.7);
          padding: 0.4rem 1.5rem;
          border-radius: 9999px;
          font-size: clamp(0.9rem, 1.5vw, 1.3rem);
          font-weight: 700;
          letter-spacing: 0.15em;
        }

        /* Set Wins Bar */
        .set-wins-bar {
          position: absolute;
          top: 5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .set-wins {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .set-wins-count {
          font-size: clamp(1.8rem, 3vw, 3rem);
          font-weight: 900;
          font-variant-numeric: tabular-nums;
          color: #facc15;
          text-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
          min-width: 3rem;
          text-align: center;
        }
        .set-wins-label {
          font-size: clamp(0.6rem, 0.9vw, 0.8rem);
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.3);
          white-space: nowrap;
        }

        /* Set History */
        .set-history {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 0.75rem;
        }
        .set-pill {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          padding: 0.3rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: clamp(0.7rem, 1vw, 0.9rem);
          color: rgba(255, 255, 255, 0.5);
          font-variant-numeric: tabular-nums;
        }
        .set-pill-label {
          font-weight: 700;
          color: rgba(255, 255, 255, 0.35);
          margin-right: 0.3rem;
        }
        .set-pill-sep {
          color: rgba(255, 255, 255, 0.2);
        }
        .set-pill-win {
          color: #4ade80;
          font-weight: 700;
        }

        /* Panels */
        .panels {
          flex: 1;
          display: flex;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .panels.swapping {
          animation: swap-flash 0.5s ease;
        }

        .panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.4s ease;
        }

        .panel-left {
          background: linear-gradient(135deg, #0a1628 0%, #0f2847 40%, #132e52 100%);
        }
        .panel-right {
          background: linear-gradient(225deg, #280a0a 0%, #471414 40%, #521919 100%);
        }

        .panel.serving {
          box-shadow: inset 0 0 80px rgba(250, 204, 21, 0.06);
        }
        .panel-left.serving {
          border-right: 3px solid rgba(250, 204, 21, 0.4);
        }
        .panel-right.serving {
          border-left: 3px solid rgba(250, 204, 21, 0.4);
        }

        /* Serve Text */
        .serve-text {
          font-size: clamp(0.9rem, 1.8vw, 1.5rem);
          font-weight: 800;
          color: #facc15;
          letter-spacing: 0.2em;
          margin-bottom: 0.5rem;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
          text-shadow: 0 0 15px rgba(250, 204, 21, 0.4);
        }
        .serve-text.serving-active {
          opacity: 1;
          transform: translateY(0);
          animation: pulse-glow 2.5s ease-in-out infinite;
        }

        /* Team Name */
        .team-name {
          font-size: clamp(1.5rem, 4vw, 4rem);
          font-weight: 800;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
        }

        /* Score */
        .score {
          font-size: clamp(6rem, 25vh, 22rem);
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 40px rgba(255, 255, 255, 0.15),
                       0 4px 30px rgba(0, 0, 0, 0.5);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      color 0.2s ease;
        }
        .score-pop {
          animation: score-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }



        /* Divider */
        .divider {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .divider-line {
          flex: 1;
          width: 1px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
        }
        .divider-vs {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          font-size: clamp(0.8rem, 1.2vw, 1.1rem);
          font-weight: 800;
          letter-spacing: 0.15em;
          padding: 0.6rem 1rem;
          border-radius: 9999px;
        }

        /* Animations */
        @keyframes score-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.12); color: #4ade80; }
          100% { transform: scale(1); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes swap-flash {
          0% { opacity: 1; }
          30% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Auto-next-set Countdown Text */}
      {state.nextSetCountdown !== null && (
        <div className="absolute bottom-[10%] md:bottom-[15%] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-white/60 font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-1 text-center">
            Tự động sang Set {state.currentSet + 1}
          </div>
          <div className="text-emerald-400 font-mono font-black text-5xl md:text-6xl animate-pulse drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            {state.nextSetCountdown}
          </div>
        </div>
      )}
    </div>
  )
}
